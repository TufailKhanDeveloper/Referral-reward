# 🚀 Quick Start: Deploy Contracts & Get Real REFT Tokens

## ⚡ 5-Minute Setup

### Step 1: Get Sepolia ETH
1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect MetaMask and request 0.5 ETH
3. Wait for confirmation

### Step 2: Deploy Contracts (Using Remix)
1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new workspace
3. Copy contracts from `/contracts/` folder:
   - `ReferralToken.sol`
   - `ReferralSystem.sol`

### Step 3: Deploy ReferralToken
```solidity
// Constructor parameters:
_initialOwner: YOUR_WALLET_ADDRESS
```

### Step 4: Deploy ReferralSystem
```solidity
// Constructor parameters:
_tokenAddress: REFERRAL_TOKEN_ADDRESS_FROM_STEP_3
_referrerReward: 1000000000000000000000  // 1000 REFT
_refereeReward: 500000000000000000000   // 500 REFT
_backendWallet: YOUR_WALLET_ADDRESS
_minReferralInterval: 3600              // 1 hour
```

### Step 5: Setup Token Permissions
Call `addMinter(REFERRAL_SYSTEM_ADDRESS)` on ReferralToken contract

### Step 6: Update .env File
```env
VITE_REFERRAL_SYSTEM_ADDRESS=0xYourDeployedReferralSystemAddress
VITE_REFERRAL_TOKEN_ADDRESS=0xYourDeployedReferralTokenAddress
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

### Step 7: Restart Application
```bash
npm run dev
```

## ✅ After Deployment You'll Have:
- Real REFT tokens in your wallet
- Actual referral processing
- Live blockchain events
- Real-time token transfers
- Authentic leaderboard data

## 🎯 How to Earn REFT Tokens:
1. **Refer someone**: Share your referral code → Earn 1000 REFT
2. **Get referred**: Use someone's code → Earn 500 REFT
3. **Owner privileges**: Mint tokens directly (if you're the owner)