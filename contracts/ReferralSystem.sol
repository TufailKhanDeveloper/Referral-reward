// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ReferralToken.sol";

/**
 * @title ReferralSystem
 * @dev Complete referral rewards system with security features
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
    
    // Errors
    error InvalidAddress();
    error InvalidAmount();
    error SelfReferralNotAllowed();
    error UserAlreadyReferred();
    error ReferralTooSoon();
    error MaxReferralsExceeded();
    error InsufficientTokenBalance();
    error UnauthorizedBackend();
    
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
    ) {
        if (_tokenAddress == address(0)) revert InvalidAddress();
        if (_backendWallet == address(0)) revert InvalidAddress();
        if (_referrerReward == 0 || _refereeReward == 0) revert InvalidAmount();
        
        referralToken = ReferralToken(_tokenAddress);
        referrerReward = _referrerReward;
        refereeReward = _refereeReward;
        minReferralInterval = _minReferralInterval;
        maxReferralsPerUser = 100; // Default maximum referrals
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BACKEND_ROLE, _backendWallet);
    }
    
    /**
     * @dev Process a referral and distribute rewards
     * @param _referee Address of the referee (new user)
     * @param _referrer Address of the referrer (existing user)
     */
    function processReferral(
        address _referee,
        address _referrer
    ) external nonReentrant whenNotPaused {
        // Check if caller has backend role
        if (!hasRole(BACKEND_ROLE, msg.sender)) revert UnauthorizedBackend();
        
        // Validate addresses
        if (_referee == address(0) || _referrer == address(0)) revert InvalidAddress();
        if (_referee == _referrer) revert SelfReferralNotAllowed();
        
        // Check if referee has already been referred
        if (hasBeenReferred[_referee]) revert UserAlreadyReferred();
        
        // Check referral interval for referrer
        if (block.timestamp < lastReferralTime[_referrer] + minReferralInterval) {
            revert ReferralTooSoon();
        }
        
        // Check maximum referrals per user
        if (totalReferrals[_referrer] >= maxReferralsPerUser) {
            revert MaxReferralsExceeded();
        }
        
        // Mark referee as referred
        hasBeenReferred[_referee] = true;
        
        // Update referrer's last referral time
        lastReferralTime[_referrer] = block.timestamp;
        
        // Increment total referrals for referrer
        totalReferrals[_referrer]++;
        
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
        
        // Transfer rewards
        referralToken.transfer(_referrer, referrerReward);
        referralToken.transfer(_referee, refereeReward);
        
        // Update total rewards earned
        totalRewardsEarned[_referrer] += referrerReward;
        totalRewardsEarned[_referee] += refereeReward;
        
        // Emit reward distribution events
        emit RewardsDistributed(_referrer, referrerReward, ReferralType.REFERRER);
        emit RewardsDistributed(_referee, refereeReward, ReferralType.REFEREE);
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