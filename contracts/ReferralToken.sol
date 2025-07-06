// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ReferralToken
 * @dev ERC20 token specifically designed for referral rewards
 * @author Referral Rewards System
 */
contract ReferralToken is ERC20, Ownable, Pausable {
    
    // Maximum total supply (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Initial supply to mint to owner (10 million tokens)
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**18;
    
    // Mapping to track authorized minters
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    event InitialSupplyMinted(address indexed owner, uint256 amount);
    
    // Errors
    error UnauthorizedMinter();
    error ExceedsMaxSupply();
    error InvalidAddress();
    error InvalidAmount();
    
    /**
     * @dev Constructor
     * @param _initialOwner Address of the initial owner
     */
    constructor(address _initialOwner) ERC20("ReferralToken", "REFT") Ownable(_initialOwner) {
        if (_initialOwner == address(0)) revert InvalidAddress();
        
        // Mint initial supply to owner
        _mint(_initialOwner, INITIAL_SUPPLY);
        
        // Automatically authorize the owner as a minter
        authorizedMinters[_initialOwner] = true;
        
        emit InitialSupplyMinted(_initialOwner, INITIAL_SUPPLY);
        emit MinterAdded(_initialOwner);
    }
    
    /**
     * @dev Add authorized minter
     * @param _minter Address to authorize for minting
     */
    function addMinter(address _minter) external onlyOwner {
        if (_minter == address(0)) revert InvalidAddress();
        authorizedMinters[_minter] = true;
        emit MinterAdded(_minter);
    }
    
    /**
     * @dev Remove authorized minter
     * @param _minter Address to remove from minting authorization
     */
    function removeMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = false;
        emit MinterRemoved(_minter);
    }
    
    /**
     * @dev Mint tokens to specified address
     * @param _to Address to mint tokens to
     * @param _amount Amount of tokens to mint
     */
    function mint(address _to, uint256 _amount) external whenNotPaused {
        if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter();
        if (_to == address(0)) revert InvalidAddress();
        if (_amount == 0) revert InvalidAmount();
        if (totalSupply() + _amount > MAX_SUPPLY) revert ExceedsMaxSupply();
        
        _mint(_to, _amount);
        emit TokensMinted(_to, _amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param _amount Amount of tokens to burn
     */
    function burn(uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();
        _burn(msg.sender, _amount);
    }
    
    /**
     * @dev Burn tokens from specified address (requires approval)
     * @param _from Address to burn tokens from
     * @param _amount Amount of tokens to burn
     */
    function burnFrom(address _from, uint256 _amount) external {
        if (_from == address(0)) revert InvalidAddress();
        if (_amount == 0) revert InvalidAmount();
        _spendAllowance(_from, msg.sender, _amount);
        _burn(_from, _amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include pause functionality
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._update(from, to, amount);
    }
    
    /**
     * @dev Check if address is authorized minter
     * @param _address Address to check
     * @return Boolean indicating if address is authorized minter
     */
    function isMinter(address _address) external view returns (bool) {
        return authorizedMinters[_address];
    }
    
    /**
     * @dev Get remaining supply that can be minted
     * @return Remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Get initial supply amount
     * @return Initial supply constant
     */
    function getInitialSupply() external pure returns (uint256) {
        return INITIAL_SUPPLY;
    }
    
    /**
     * @dev Emergency function to recover accidentally sent tokens
     * @param _token Address of token to recover
     * @param _amount Amount to recover
     */
    function recoverToken(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(0)) revert InvalidAddress();
        if (_amount == 0) revert InvalidAmount();
        
        IERC20(_token).transfer(owner(), _amount);
    }
}