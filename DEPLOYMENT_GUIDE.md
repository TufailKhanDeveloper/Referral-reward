# 🚀 Complete Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Referral Rewards System smart contracts and configuring the frontend application.

## 📋 Prerequisites

### Required Tools
- **MetaMask** browser extension
- **Sepolia ETH** for gas fees ([Get from faucet](https://sepoliafaucet.com/))
- **Infura Account** (free) for RPC access
- **Code Editor** (VS Code recommended)

### Recommended Knowledge
- Basic understanding of blockchain and smart contracts
- Familiarity with MetaMask wallet operations
- Basic command line usage

## 🔧 Step 1: Environment Setup

### 1.1 Get Sepolia ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your MetaMask wallet
3. Request 0.5 ETH (sufficient for deployment and testing)
4. Wait for confirmation (usually 1-2 minutes)

### 1.2 Set Up Infura
1. Go to [Infura.io](https://infura.io/) and create a free account
2. Create a new project
3. Copy your Project ID from the dashboard
4. Your RPC URL will be: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

## 📝 Step 2: Smart Contract Deployment

### Option A: Using Remix IDE (Recommended for Beginners)

#### 2.1 Prepare Remix
1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create a new workspace or use the default
3. Create the following files in the `contracts` folder:

#### 2.2 Create ReferralToken.sol
```solidity
// Copy the complete ReferralToken.sol content from /contracts/ReferralToken.sol
```

#### 2.3 Create ReferralSystem.sol
```solidity
// Copy the complete ReferralSystem.sol content from /contracts/ReferralSystem.sol
```

#### 2.4 Compile Contracts
1. Go to the "Solidity Compiler" tab
2. Select compiler version `0.8.19` or higher
3. Click "Compile ReferralToken.sol"
4. Click "Compile ReferralSystem.sol"
5. Ensure no compilation errors

#### 2.5 Deploy ReferralToken
1. Go to the "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask" as environment
3. Ensure you're connected to Sepolia testnet
4. Select "ReferralToken" contract
5. In the constructor parameters, enter your wallet address:
   ```
   _initialOwner: 0xYourWalletAddress
   ```
6. Click "Deploy"
7. Confirm the transaction in MetaMask
8. **Save the deployed contract address** - you'll need it later

#### 2.6 Deploy ReferralSystem
1. Select "ReferralSystem" contract
2. In the constructor parameters, enter:
   ```
   _tokenAddress: 0xYourReferralTokenAddress (from step 2.5)
   _referrerReward: 1000000000000000000000 (1000 REFT tokens)
   _refereeReward: 500000000000000000000 (500 REFT tokens)
   _backendWallet: 0xYourWalletAddress
   _minReferralInterval: 3600 (1 hour in seconds)
   ```
3. Click "Deploy"
4. Confirm the transaction in MetaMask
5. **Save the deployed contract address**

#### 2.7 Configure Token Permissions
1. In the deployed ReferralToken contract, find the "addMinter" function
2. Enter the ReferralSystem contract address as the parameter
3. Click "transact"
4. Confirm the transaction in MetaMask

### Option B: Using Hardhat (Advanced Users)

#### 2.1 Install Dependencies
```bash
cd contracts
npm install
```

#### 2.2 Configure Hardhat
Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: ["YOUR_PRIVATE_KEY"] // Never commit this!
    }
  }
};
```

#### 2.3 Create Deployment Script
Create `scripts/deploy.js`:
```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy ReferralToken
  const ReferralToken = await ethers.getContractFactory("ReferralToken");
  const token = await ReferralToken.deploy(deployer.address);
  await token.deployed();
  console.log("ReferralToken deployed to:", token.address);

  // Deploy ReferralSystem
  const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
  const system = await ReferralSystem.deploy(
    token.address,
    ethers.utils.parseEther("1000"), // 1000 REFT
    ethers.utils.parseEther("500"),  // 500 REFT
    deployer.address,
    3600 // 1 hour
  );
  await system.deployed();
  console.log("ReferralSystem deployed to:", system.address);

  // Add minter role
  await token.addMinter(system.address);
  console.log("Minter role granted to ReferralSystem");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### 2.4 Deploy
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## ⚙️ Step 3: Frontend Configuration

### 3.1 Update Environment Variables
Create or update `.env` file in the project root:

```env
# Sepolia Testnet Configuration
VITE_REFERRAL_SYSTEM_ADDRESS=0xYourDeployedReferralSystemAddress
VITE_REFERRAL_TOKEN_ADDRESS=0xYourDeployedReferralTokenAddress
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Start Development Server
```bash
npm run dev
```

## ✅ Step 4: Verification & Testing

### 4.1 Verify Contract Deployment
1. Visit [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for your contract addresses
3. Verify the contracts are deployed and have code
4. Check the transaction history

### 4.2 Test Frontend Connection
1. Open the application in your browser
2. Connect MetaMask to Sepolia testnet
3. Verify you see "Smart contracts connected successfully!" message
4. Check that your referral code is generated

### 4.3 Test Referral Functionality
1. **Generate referral code** - Should appear automatically
2. **Copy referral code** - Test the copy functionality
3. **Test with another wallet** - Use a different MetaMask account
4. **Process referral** - Enter the referral code from step 1
5. **Verify token distribution** - Check both wallets receive REFT tokens

## 🔍 Step 5: Contract Verification (Optional but Recommended)

### 5.1 Verify on Etherscan
1. Go to your contract on Sepolia Etherscan
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Select "Solidity (Single file)"
5. Upload your contract source code
6. Set compiler version to match your deployment
7. Submit for verification

### 5.2 Benefits of Verification
- Public source code visibility
- Enhanced trust and transparency
- Better debugging capabilities
- Easier integration for other developers

## 🚨 Troubleshooting

### Common Issues and Solutions

#### "Contracts not deployed" Error
**Cause**: Contract addresses not found or incorrect network
**Solution**: 
- Verify you're on Sepolia testnet
- Check contract addresses in `.env` file
- Ensure contracts were deployed successfully

#### "Insufficient funds for gas" Error
**Cause**: Not enough Sepolia ETH for transaction fees
**Solution**:
- Get more Sepolia ETH from [faucet](https://sepoliafaucet.com/)
- Wait for faucet cooldown period if needed

#### "Transaction failed" Error
**Cause**: Various reasons including gas limits, contract errors
**Solution**:
- Check transaction details on Etherscan
- Increase gas limit if needed
- Verify contract permissions are set correctly

#### "Invalid referral code" Error
**Cause**: Referral code mapping not found
**Solution**:
- Ensure the referrer has connected their wallet first
- Check that referral code was generated properly
- Verify the code format (REF_XXXXXX)

### Getting Help

If you encounter issues not covered here:

1. **Check the console** - Browser developer tools often show helpful error messages
2. **Review transaction logs** - Etherscan provides detailed transaction information
3. **Verify contract state** - Use Etherscan to check contract functions and state
4. **Ask for help** - Open an issue on GitHub with detailed error information

## 📊 Step 6: Monitoring & Analytics

### 6.1 Set Up Monitoring
1. **Bookmark contract addresses** on Etherscan for easy access
2. **Monitor events** - Watch for ReferralProcessed and RewardsDistributed events
3. **Track token distribution** - Monitor total supply and distribution
4. **User analytics** - Use the dashboard to track user engagement

### 6.2 Performance Metrics
- **Transaction success rate** - Should be >95%
- **Average gas costs** - Monitor for optimization opportunities
- **User engagement** - Track referral conversion rates
- **System health** - Monitor contract balance and token distribution

## 🎯 Step 7: Production Considerations

### 7.1 Security Checklist
- [ ] Smart contracts audited by security professionals
- [ ] Private keys stored securely (hardware wallet recommended)
- [ ] Environment variables not committed to version control
- [ ] Rate limiting and anti-spam measures tested
- [ ] Emergency procedures documented

### 7.2 Scaling Considerations
- [ ] Gas optimization for high-volume usage
- [ ] Backend service for referral code mapping
- [ ] Database for analytics and user management
- [ ] CDN for frontend asset delivery
- [ ] Monitoring and alerting systems

### 7.3 Mainnet Deployment
When ready for production:
1. **Security audit** - Professional audit recommended
2. **Testnet validation** - Extensive testing on Sepolia
3. **Gas optimization** - Optimize contracts for lower costs
4. **Monitoring setup** - Comprehensive monitoring and alerting
5. **Backup procedures** - Emergency response plans

## 📚 Additional Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Etherscan API Documentation](https://docs.etherscan.io/)
- [Infura Documentation](https://docs.infura.io/)

---

**Congratulations!** 🎉 You've successfully deployed a complete referral rewards system. Your users can now earn real REFT tokens through referrals on the Sepolia testnet.