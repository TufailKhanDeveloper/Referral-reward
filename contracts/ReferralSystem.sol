// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ReferralToken.sol";

/**
 * @title ReferralSystem
 * @dev Enhanced referral rewards system with frontend compatibility
 * @author Referral Rewards System
 */
contract ReferralSystem is Ownable, AccessControl, ReentrancyGuard, Pausable {
    
    // Role for authorized backend wallet
    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");
    
    // Referral token contract
    ReferralToken public immutable referralToken;
    
    // Reward amounts
    uint256 public referrerReward;
    uint256 public refereeReward;
    
    // Minimum time between referrals (anti-spam)
    uint256 public minReferralInterval;
    
    // Maximum referrals per user
    uint256 public maxReferralsPerUser;
    
    // Frontend mode - allows direct user interactions for testing
    bool public frontendMode;
    
    // Demo mode - enables built-in demo codes
    bool public demoMode;
    
    // Enum for referral types
    enum ReferralType {
        REFERRER,
        REFEREE
    }
    
    // Struct to store referral data
    struct Referral {
        address referee;
        address referrer;
        uint256 timestamp;
        uint256 referrerReward;
        uint256 refereeReward;
    }
    
    // Mappings
    mapping(address => Referral[]) public userReferrals;
    mapping(address => uint256) public lastReferralTime;
    mapping(address => uint256) public totalReferrals;
    mapping(address => uint256) public totalRewardsEarned;
    mapping(address => bool) public hasBeenReferred;
    
    // Referral code to address mapping for frontend mode
    mapping(string => address) public referralCodeToAddress;
    mapping(address => string) public addressToReferralCode;
    
    // Demo referral codes (for testing)
    mapping(string => address) public demoReferralCodes;
    
    // Events
    event ReferralProcessed(
        address indexed referee,
        address indexed referrer,
        uint256 timestamp
    );
    
    event RewardsDistributed(
        address indexed user,
        uint256 amount,
        ReferralType referralType
    );
    
    event RewardAmountsUpdated(
        uint256 newReferrerReward,
        uint256 newRefereeReward
    );
    
    event MinReferralIntervalUpdated(uint256 newInterval);
    event MaxReferralsPerUserUpdated(uint256 newMaxReferrals);
    event FrontendModeUpdated(bool enabled);
    event DemoModeUpdated(bool enabled);
    event ReferralCodeRegistered(address indexed user, string referralCode);
    event DemoCodeAdded(string referralCode, address referrer);
    
    // Errors
    error InvalidAddress();
    error InvalidAmount();
    error SelfReferralNotAllowed();
    error UserAlreadyReferred();
    error ReferralTooSoon();
    error MaxReferralsExceeded();
    error InsufficientTokenBalance();
    error UnauthorizedBackend();
    error InvalidReferralCode();
    error ReferralCodeAlreadyExists();
    
    /**
     * @dev Constructor
     * @param _tokenAddress Address of the referral token contract
     * @param _referrerReward Reward amount for referrer
     * @param _refereeReward Reward amount for referee
     * @param _backendWallet Address of authorized backend wallet
     * @param _minReferralInterval Minimum time between referrals in seconds
     */
    constructor(
        address _tokenAddress,
        uint256 _referrerReward,
        uint256 _refereeReward,
        address _backendWallet,
        uint256 _minReferralInterval
    ) Ownable(msg.sender) {
        if (_tokenAddress == address(0)) revert InvalidAddress();
        if (_backendWallet == address(0)) revert InvalidAddress();
        if (_referrerReward == 0 || _refereeReward == 0) revert InvalidAmount();
        
        referralToken = ReferralToken(_tokenAddress);
        referrerReward = _referrerReward;
        refereeReward = _refereeReward;
        minReferralInterval = _minReferralInterval;
        maxReferralsPerUser = 100; // Default maximum referrals
        frontendMode = true; // Enable frontend mode by default for testing
        demoMode = true; // Enable demo mode by default for testing
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BACKEND_ROLE, _backendWallet);
        _grantRole(BACKEND_ROLE, msg.sender); // Owner also gets backend role
        
        // Initialize demo referral codes
        _initializeDemoCodes();
    }
    
    /**
     * @dev Initialize demo referral codes for testing
     */
    function _initializeDemoCodes() internal {
        // Create demo addresses (deterministic based on code)
        address demo1 = address(uint160(uint256(keccak256("DEMO_REF_ABC123"))));
        address demo2 = address(uint160(uint256(keccak256("DEMO_REF_DEF456"))));
        address demo3 = address(uint160(uint256(keccak256("DEMO_REF_GHI789"))));
        address demo4 = address(uint160(uint256(keccak256("DEMO_REF_JKL012"))));
        address demo5 = address(uint160(uint256(keccak256("DEMO_REF_MNO345"))));
        address demo6 = address(uint160(uint256(keccak256("DEMO_REF_PQR678"))));
        
        demoReferralCodes["REF_ABC123"] = demo1;
        demoReferralCodes["REF_DEF456"] = demo2;
        demoReferralCodes["REF_GHI789"] = demo3;
        demoReferralCodes["REF_JKL012"] = demo4;
        demoReferralCodes["REF_MNO345"] = demo5;
        demoReferralCodes["REF_PQR678"] = demo6;
    }
    
    /**
     * @dev Add demo referral code (only owner)
     * @param _referralCode The referral code
     * @param _referrer The referrer address
     */
    function addDemoCode(string memory _referralCode, address _referrer) external onlyOwner {
        if (_referrer == address(0)) revert InvalidAddress();
        demoReferralCodes[_referralCode] = _referrer;
        emit DemoCodeAdded(_referralCode, _referrer);
    }
    
    /**
     * @dev Toggle demo mode (only owner)
     * @param _enabled Whether to enable demo mode
     */
    function setDemoMode(bool _enabled) external onlyOwner {
        demoMode = _enabled;
        emit DemoModeUpdated(_enabled);
    }
    
    /**
     * @dev Register a referral code for a user (frontend mode)
     * @param _referralCode The referral code to register
     */
    function registerReferralCode(string memory _referralCode) external {
        if (!frontendMode) revert UnauthorizedBackend();
        if (bytes(_referralCode).length == 0) revert InvalidReferralCode();
        if (referralCodeToAddress[_referralCode] != address(0)) revert ReferralCodeAlreadyExists();
        
        // If user already has a code, remove the old mapping
        string memory oldCode = addressToReferralCode[msg.sender];
        if (bytes(oldCode).length > 0) {
            delete referralCodeToAddress[oldCode];
        }
        
        referralCodeToAddress[_referralCode] = msg.sender;
        addressToReferralCode[msg.sender] = _referralCode;
        
        emit ReferralCodeRegistered(msg.sender, _referralCode);
    }
    
    /**
     * @dev Process a referral using referral code (frontend mode)
     * @param _referralCode The referral code to use
     */
    function processReferralByCode(string memory _referralCode) external nonReentrant whenNotPaused {
        if (!frontendMode) revert UnauthorizedBackend();
        
        address referrer = _getReferrerFromCode(_referralCode);
        if (referrer == address(0)) revert InvalidReferralCode();
        
        _processReferralInternal(msg.sender, referrer);
    }
    
    /**
     * @dev Process a referral with addresses (backend mode)
     * @param _referee Address of the referee (new user)
     * @param _referrer Address of the referrer (existing user)
     */
    function processReferral(
        address _referee,
        address _referrer
    ) external nonReentrant whenNotPaused {
        // Check authorization
        if (!frontendMode && !hasRole(BACKEND_ROLE, msg.sender)) {
            revert UnauthorizedBackend();
        }
        
        _processReferralInternal(_referee, _referrer);
    }
    
    /**
     * @dev Internal function to get referrer from code (checks both user and demo codes)
     * @param _referralCode The referral code
     * @return The referrer address
     */
    function _getReferrerFromCode(string memory _referralCode) internal view returns (address) {
        // First check user-registered codes
        address userReferrer = referralCodeToAddress[_referralCode];
        if (userReferrer != address(0)) {
            return userReferrer;
        }
        
        // Then check demo codes if demo mode is enabled
        if (demoMode) {
            return demoReferralCodes[_referralCode];
        }
        
        return address(0);
    }
    
    /**
     * @dev Internal function to process referrals
     * @param _referee Address of the referee
     * @param _referrer Address of the referrer
     */
    function _processReferralInternal(address _referee, address _referrer) internal {
        // Validate addresses
        if (_referee == address(0) || _referrer == address(0)) revert InvalidAddress();
        if (_referee == _referrer) revert SelfReferralNotAllowed();
        
        // Check if referee has already been referred
        if (hasBeenReferred[_referee]) revert UserAlreadyReferred();
        
        // Check referral interval for referrer (only for real users, not demo addresses)
        if (!_isDemoAddress(_referrer) && block.timestamp < lastReferralTime[_referrer] + minReferralInterval) {
            revert ReferralTooSoon();
        }
        
        // Check maximum referrals per user (only for real users, not demo addresses)
        if (!_isDemoAddress(_referrer) && totalReferrals[_referrer] >= maxReferralsPerUser) {
            revert MaxReferralsExceeded();
        }
        
        // Mark referee as referred
        hasBeenReferred[_referee] = true;
        
        // Update referrer's last referral time (only for real users)
        if (!_isDemoAddress(_referrer)) {
            lastReferralTime[_referrer] = block.timestamp;
            totalReferrals[_referrer]++;
        }
        
        // Create referral record
        Referral memory newReferral = Referral({
            referee: _referee,
            referrer: _referrer,
            timestamp: block.timestamp,
            referrerReward: referrerReward,
            refereeReward: refereeReward
        });
        
        // Store referral for both users
        userReferrals[_referrer].push(newReferral);
        userReferrals[_referee].push(newReferral);
        
        // Distribute rewards
        _distributeRewards(_referrer, _referee);
        
        // Emit events
        emit ReferralProcessed(_referee, _referrer, block.timestamp);
    }
    
    /**
     * @dev Check if an address is a demo address
     * @param _address The address to check
     * @return True if it's a demo address
     */
    function _isDemoAddress(address _address) internal view returns (bool) {
        if (!demoMode) return false;
        
        // Check if this address matches any demo code address
        if (_address == demoReferralCodes["REF_ABC123"] ||
            _address == demoReferralCodes["REF_DEF456"] ||
            _address == demoReferralCodes["REF_GHI789"] ||
            _address == demoReferralCodes["REF_JKL012"] ||
            _address == demoReferralCodes["REF_MNO345"] ||
            _address == demoReferralCodes["REF_PQR678"]) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Internal function to distribute rewards
     * @param _referrer Address of the referrer
     * @param _referee Address of the referee
     */
    function _distributeRewards(address _referrer, address _referee) internal {
        // Check if contract has enough tokens
        uint256 totalRewardAmount = referrerReward + refereeReward;
        if (referralToken.balanceOf(address(this)) < totalRewardAmount) {
            revert InsufficientTokenBalance();
        }
        
        // Transfer rewards (only to real users, not demo addresses)
        if (!_isDemoAddress(_referrer)) {
            referralToken.transfer(_referrer, referrerReward);
            totalRewardsEarned[_referrer] += referrerReward;
            emit RewardsDistributed(_referrer, referrerReward, ReferralType.REFERRER);
        }
        
        // Always reward the referee (real user)
        referralToken.transfer(_referee, refereeReward);
        totalRewardsEarned[_referee] += refereeReward;
        emit RewardsDistributed(_referee, refereeReward, ReferralType.REFEREE);
    }
    
    /**
     * @dev Get referrer address from referral code (public function)
     * @param _referralCode The referral code
     * @return The address of the referrer
     */
    function getReferrerFromCode(string memory _referralCode) external view returns (address) {
        return _getReferrerFromCode(_referralCode);
    }
    
    /**
     * @dev Get referral code from address
     * @param _user The user address
     * @return The referral code
     */
    function getReferralCode(address _user) external view returns (string memory) {
        return addressToReferralCode[_user];
    }
    
    /**
     * @dev Check if a referral code is a demo code
     * @param _referralCode The referral code to check
     * @return True if it's a demo code
     */
    function isDemoCode(string memory _referralCode) external view returns (bool) {
        return demoMode && demoReferralCodes[_referralCode] != address(0);
    }
    
    /**
     * @dev Get all referrals for a user
     * @param _user Address of the user
     * @return Array of referrals
     */
    function getReferrals(address _user) external view returns (Referral[] memory) {
        return userReferrals[_user];
    }
    
    /**
     * @dev Get referral count for a user
     * @param _user Address of the user
     * @return Number of referrals
     */
    function getReferralCount(address _user) external view returns (uint256) {
        return userReferrals[_user].length;
    }
    
    /**
     * @dev Check if user is eligible for referral
     * @param _user Address of the user
     * @return Boolean indicating eligibility
     */
    function isEligibleForReferral(address _user) external view returns (bool) {
        // Check if user has been referred before
        if (hasBeenReferred[_user]) return false;
        
        // Check if enough time has passed since last referral (for referrer)
        if (block.timestamp < lastReferralTime[_user] + minReferralInterval) {
            return false;
        }
        
        // Check if user hasn't exceeded max referrals
        if (totalReferrals[_user] >= maxReferralsPerUser) return false;
        
        return true;
    }
    
    /**
     * @dev Get user statistics
     * @param _user Address of the user
     * @return totalRefs Total referrals made
     * @return totalRewards Total rewards earned
     * @return lastReferral Timestamp of last referral
     * @return isReferred Whether user has been referred
     */
    function getUserStats(address _user) external view returns (
        uint256 totalRefs,
        uint256 totalRewards,
        uint256 lastReferral,
        bool isReferred
    ) {
        return (
            totalReferrals[_user],
            totalRewardsEarned[_user],
            lastReferralTime[_user],
            hasBeenReferred[_user]
        );
    }
    
    /**
     * @dev Toggle frontend mode (only owner)
     * @param _enabled Whether to enable frontend mode
     */
    function setFrontendMode(bool _enabled) external onlyOwner {
        frontendMode = _enabled;
        emit FrontendModeUpdated(_enabled);
    }
    
    /**
     * @dev Update reward amounts (only owner)
     * @param _referrerReward New referrer reward amount
     * @param _refereeReward New referee reward amount
     */
    function updateRewardAmounts(
        uint256 _referrerReward,
        uint256 _refereeReward
    ) external onlyOwner {
        if (_referrerReward == 0 || _refereeReward == 0) revert InvalidAmount();
        
        referrerReward = _referrerReward;
        refereeReward = _refereeReward;
        
        emit RewardAmountsUpdated(_referrerReward, _refereeReward);
    }
    
    /**
     * @dev Update minimum referral interval (only owner)
     * @param _minInterval New minimum interval in seconds
     */
    function updateMinReferralInterval(uint256 _minInterval) external onlyOwner {
        minReferralInterval = _minInterval;
        emit MinReferralIntervalUpdated(_minInterval);
    }
    
    /**
     * @dev Update maximum referrals per user (only owner)
     * @param _maxReferrals New maximum referrals per user
     */
    function updateMaxReferralsPerUser(uint256 _maxReferrals) external onlyOwner {
        if (_maxReferrals == 0) revert InvalidAmount();
        maxReferralsPerUser = _maxReferrals;
        emit MaxReferralsPerUserUpdated(_maxReferrals);
    }
    
    /**
     * @dev Add backend wallet (only owner)
     * @param _backendWallet Address to add as backend
     */
    function addBackendWallet(address _backendWallet) external onlyOwner {
        if (_backendWallet == address(0)) revert InvalidAddress();
        _grantRole(BACKEND_ROLE, _backendWallet);
    }
    
    /**
     * @dev Remove backend wallet (only owner)
     * @param _backendWallet Address to remove from backend
     */
    function removeBackendWallet(address _backendWallet) external onlyOwner {
        _revokeRole(BACKEND_ROLE, _backendWallet);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw tokens (only owner)
     * @param _token Address of token to withdraw
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        ReferralToken token = ReferralToken(_token);
        token.transfer(owner(), _amount);
    }
    
    /**
     * @dev Get contract balance of referral tokens
     * @return Balance of referral tokens
     */
    function getContractBalance() external view returns (uint256) {
        return referralToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get current reward configuration
     * @return Current referrer and referee reward amounts
     */
    function getRewardConfig() external view returns (uint256, uint256) {
        return (referrerReward, refereeReward);
    }
    
    /**
     * @dev Get contract configuration
     * @return Configuration values
     */
    function getConfig() external view returns (
        uint256 minInterval,
        uint256 maxReferrals,
        uint256 refReward,
        uint256 reeReward
    ) {
        return (
            minReferralInterval,
            maxReferralsPerUser,
            referrerReward,
            refereeReward
        );
    }
}