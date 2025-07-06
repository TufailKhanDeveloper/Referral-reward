# Referral Rewards System - Smart Contracts

This directory contains the complete Solidity implementation for a production-ready referral rewards system.

## Contracts Overview

### 1. ReferralToken.sol
- **Purpose**: Custom ERC20 token specifically designed for referral rewards
- **Features**:
  - Mintable by authorized addresses only
  - Pausable transfers for emergency situations
  - Maximum supply cap (100 million tokens)
  - Owner-controlled minter management
  - Gas-optimized implementation

### 2. ReferralSystem.sol
- **Purpose**: Core referral management and reward distribution system
- **Features**:
  - Secure referral processing with comprehensive validation
  - Role-based access control for backend integration
  - Anti-spam mechanisms (rate limiting, maximum referrals)
  - Comprehensive referral tracking and statistics
  - Emergency controls and admin functions

## Key Features

### Security Measures
- **Reentrancy Protection**: All state-changing functions are protected
- **Access Control**: Role-based permissions for different operations
- **Input Validation**: Comprehensive validation of all inputs
- **Rate Limiting**: Prevents spam referrals with configurable intervals
- **Pausable**: Emergency pause functionality for both contracts

### Gas Optimization
- **Efficient Storage**: Optimized struct packing and storage patterns
- **Minimal External Calls**: Reduced gas costs through efficient call patterns
- **Batch Operations**: Where applicable, operations are batched for efficiency

### Comprehensive Tracking
- **Referral History**: Complete history of all referrals per user
- **Reward Distribution**: Detailed tracking of rewards distributed
- **User Statistics**: Comprehensive user statistics and eligibility checks
- **Event Logging**: Detailed events for off-chain monitoring

## Usage Examples

### Deployment
```solidity
// Deploy ReferralToken
ReferralToken token = new ReferralToken(owner);

// Deploy ReferralSystem
ReferralSystem referralSystem = new ReferralSystem(
    address(token),      // Token address
    1000 * 10**18,      // Referrer reward (1000 tokens)
    500 * 10**18,       // Referee reward (500 tokens)
    backendWallet,      // Authorized backend wallet
    3600                // 1 hour minimum interval
);

// Authorize the referral system to mint tokens
token.addMinter(address(referralSystem));
```

### Processing Referrals
```solidity
// Called by authorized backend wallet
referralSystem.processReferral(referee, referrer);
```

### Querying Data
```solidity
// Get user's referral history
Referral[] memory referrals = referralSystem.getReferrals(user);

// Check eligibility
bool eligible = referralSystem.isEligibleForReferral(user);

// Get user statistics
(uint256 totalRefs, uint256 totalRewards, uint256 lastReferral, bool isReferred) = 
    referralSystem.getUserStats(user);
```

## Configuration

### Reward Amounts
- Configurable referrer and referee rewards
- Can be updated by contract owner
- Immediate effect on new referrals

### Rate Limiting
- Configurable minimum interval between referrals
- Prevents spam and abuse
- Per-user enforcement

### Maximum Referrals
- Configurable maximum referrals per user
- Prevents single user from dominating the system
- Can be adjusted based on system needs

## Events

### ReferralProcessed
```solidity
event ReferralProcessed(
    address indexed referee,
    address indexed referrer,
    uint256 timestamp
);
```

### RewardsDistributed
```solidity
event RewardsDistributed(
    address indexed user,
    uint256 amount,
    ReferralType referralType
);
```

## Error Handling

The contracts implement comprehensive error handling with custom errors for gas efficiency:

- `InvalidAddress()`: Zero address validation
- `InvalidAmount()`: Amount validation
- `SelfReferralNotAllowed()`: Prevents self-referrals
- `UserAlreadyReferred()`: Prevents duplicate referrals
- `ReferralTooSoon()`: Rate limiting enforcement
- `MaxReferralsExceeded()`: Maximum referral limit
- `InsufficientTokenBalance()`: Token balance checks
- `UnauthorizedBackend()`: Access control validation

## Testing Recommendations

1. **Unit Tests**: Test each function individually
2. **Integration Tests**: Test complete referral workflows
3. **Security Tests**: Test access controls and edge cases
4. **Gas Tests**: Verify gas efficiency
5. **Stress Tests**: Test with high volumes and edge cases

## Deployment Considerations

1. **Token Supply**: Ensure sufficient tokens for rewards
2. **Backend Integration**: Properly configure backend wallet roles
3. **Network Configuration**: Set appropriate gas limits and prices
4. **Monitoring**: Set up event monitoring for production use
5. **Upgradability**: Consider proxy patterns for future upgrades

## License

MIT License - See LICENSE file for details