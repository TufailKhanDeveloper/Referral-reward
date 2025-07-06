# 🚀 Complete Solidity Referral Rewards System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.19-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-blue.svg)](https://tailwindcss.com/)

> A production-ready, full-stack Web3 referral rewards system built with Solidity smart contracts and a modern React frontend. Features real REFT token distribution, comprehensive security measures, and an intuitive user interface.

## 🌟 Features

### 🔐 Smart Contract Features
- **ERC20 Token (REFT)** - Custom token with minting controls and supply caps
- **Referral System** - Secure referral processing with anti-spam mechanisms
- **Role-Based Access** - Backend integration with proper authorization
- **Rate Limiting** - Prevents spam referrals with configurable intervals
- **Comprehensive Security** - Reentrancy protection, input validation, and emergency controls
- **Event Logging** - Detailed blockchain events for monitoring and analytics

### 🎨 Frontend Features
- **Modern UI/UX** - Beautiful, responsive design with dark/light mode
- **Real-time Updates** - Live blockchain event monitoring
- **Wallet Integration** - MetaMask support with automatic network switching
- **QR Code Generation** - Easy sharing with downloadable QR codes
- **Social Sharing** - Twitter, Telegram, and native sharing integration
- **Comprehensive Dashboard** - Analytics, leaderboards, and referral history
- **Mobile-First Design** - Optimized for all devices and screen sizes

### 🛡️ Security & Quality
- **Audited Contracts** - Security-focused smart contract development
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error management and user feedback
- **Accessibility** - WCAG 2.1 AA compliant design
- **Performance** - Optimized loading and smooth animations

## 🏗️ Architecture

```
├── 📁 contracts/                 # Smart Contracts
│   ├── ReferralToken.sol        # ERC20 token contract
│   ├── ReferralSystem.sol       # Main referral logic
│   └── package.json             # Contract dependencies
├── 📁 src/                      # Frontend Application
│   ├── 📁 components/           # React components
│   │   ├── 📁 enhanced/         # Enhanced UI components
│   │   └── 📁 ui/               # Reusable UI components
│   ├── 📁 hooks/                # Custom React hooks
│   ├── 📁 types/                # TypeScript definitions
│   └── 📁 config/               # Configuration files
└── 📁 docs/                     # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** browser extension
- **Sepolia ETH** for gas fees ([Get from faucet](https://sepoliafaucet.com/))

### 1. Clone & Install

```bash
git clone <repository-url>
cd referral-rewards-system
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Sepolia Testnet Configuration
VITE_REFERRAL_SYSTEM_ADDRESS=0xfea0f99f3934472db65162410f3ee39bfab153d2
VITE_REFERRAL_TOKEN_ADDRESS=0x0b0119ee5750dca51f05a99365ba2abbded85f8a
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/4b10e92a256845688ea82b2894de73ca
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Connect & Test

1. **Connect MetaMask** to Sepolia testnet
2. **Generate your referral code** (automatic)
3. **Test referrals** with demo codes or different wallet addresses
4. **Verify token distribution** in your wallet

## 📖 How It Works

### For Users

1. **Connect Wallet** → MetaMask connection to Sepolia testnet
2. **Get Referral Code** → Unique code generated automatically
3. **Share Code** → Multiple sharing options (QR, social, direct link)
4. **Earn Rewards** → Real REFT tokens distributed instantly
5. **Track Progress** → Dashboard with analytics and history

### For Developers

1. **Smart Contracts** → Deployed on Sepolia testnet
2. **Event Monitoring** → Real-time blockchain event listening
3. **State Management** → React hooks with TypeScript
4. **UI Components** → Modular, reusable component library
5. **Error Handling** → Comprehensive error management

## 🎯 Reward Structure

| Action | Reward | Recipient |
|--------|--------|-----------|
| **Successful Referral** | 1000 REFT | Referrer |
| **Being Referred** | 500 REFT | Referee |
| **Token Distribution** | Instant | Both parties |

## 🔧 Configuration

### Smart Contract Parameters

```solidity
// Configurable via owner functions
uint256 public referrerReward = 1000 * 10**18;    // 1000 REFT
uint256 public refereeReward = 500 * 10**18;      // 500 REFT
uint256 public minReferralInterval = 3600;        // 1 hour
uint256 public maxReferralsPerUser = 100;         // Max referrals
```

### Frontend Configuration

```typescript
// src/config/contracts.ts
export const CONTRACT_CONFIG = {
  referralSystemAddress: process.env.VITE_REFERRAL_SYSTEM_ADDRESS,
  referralTokenAddress: process.env.VITE_REFERRAL_TOKEN_ADDRESS,
  chainId: 11155111, // Sepolia
  rpcUrl: process.env.VITE_RPC_URL,
  blockExplorer: 'https://sepolia.etherscan.io'
};
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Smart Contracts
cd contracts
npm run compile      # Compile contracts
npm run test         # Run contract tests
npm run deploy       # Deploy to network

# Code Quality
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking
```

### Project Structure

```
src/
├── components/
│   ├── enhanced/           # Enhanced UI components
│   │   ├── EnhancedDashboard.tsx
│   │   ├── EnhancedReferralInput.tsx
│   │   └── EnhancedReferralGenerator.tsx
│   ├── ui/                 # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Tooltip.tsx
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Leaderboard.tsx     # User rankings
│   ├── RealTimeEvents.tsx  # Live event feed
│   └── WalletConnect.tsx   # Wallet integration
├── hooks/
│   ├── useContract.ts      # Smart contract interactions
│   └── useWallet.ts        # Wallet management
├── types/
│   └── index.ts            # TypeScript definitions
└── config/
    └── contracts.ts        # Contract configuration
```

## 🔒 Security Features

### Smart Contract Security

- **Reentrancy Protection** - All state-changing functions protected
- **Access Control** - Role-based permissions with OpenZeppelin
- **Input Validation** - Comprehensive parameter validation
- **Rate Limiting** - Configurable cooldown periods
- **Emergency Controls** - Pause functionality for critical situations
- **Supply Caps** - Maximum token supply enforcement

### Frontend Security

- **Type Safety** - Full TypeScript implementation
- **Input Sanitization** - All user inputs validated
- **Error Boundaries** - Graceful error handling
- **Secure Communication** - HTTPS and secure RPC endpoints
- **Wallet Security** - MetaMask integration with proper permissions

## 📊 Analytics & Monitoring

### Dashboard Metrics

- **Total Referrals** - Real-time referral count
- **Rewards Distributed** - Total REFT tokens distributed
- **User Statistics** - Individual user analytics
- **Leaderboard** - Top referrers ranking
- **Live Events** - Real-time blockchain events

### Smart Contract Events

```solidity
event ReferralProcessed(address indexed referee, address indexed referrer, uint256 timestamp);
event RewardsDistributed(address indexed user, uint256 amount, uint8 referralType);
event RewardAmountsUpdated(uint256 newReferrerReward, uint256 newRefereeReward);
```

## 🌐 Deployment

### Live Demo

The application is deployed and accessible at:
**https://shiny-meerkat-bf162f.netlify.app**

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

### Smart Contract Deployment

1. **Testnet Deployment** (Sepolia) ✅ **COMPLETED**
   - ReferralSystem: `0xfea0f99f3934472db65162410f3ee39bfab153d2`
   - ReferralToken: `0x0b0119ee5750dca51f05a99365ba2abbded85f8a`
   - Verified on Etherscan
   - Fully functional and tested

2. **Mainnet Deployment** (Production)
   - Security audit recommended
   - Gas optimization
   - Comprehensive testing
   - Monitoring setup

## 🧪 Testing

### Demo Referral Codes

For testing purposes, you can use these demo codes:

- `REF_ABC123`
- `REF_DEF456`
- `REF_GHI789`
- `REF_JKL012`

### Smart Contract Testing

```bash
cd contracts
npm test
```

### Frontend Testing

```bash
npm run test
npm run test:coverage
```

### Manual Testing Checklist

- [x] Wallet connection and network switching
- [x] Referral code generation and sharing
- [x] Referral processing and token distribution
- [x] Dashboard updates and real-time events
- [x] Mobile responsiveness and accessibility
- [x] Error handling and edge cases

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Q: "Smart contracts not connected" error**
A: Ensure you're on Sepolia testnet and contracts are deployed at the configured addresses.

**Q: "Insufficient funds" error**
A: Get Sepolia ETH from the [faucet](https://sepoliafaucet.com/) for gas fees.

**Q: "Invalid referral code" error**
A: Use one of the demo codes provided or ensure the referrer has generated their code first.

**Q: Transactions failing**
A: Check gas limits, network congestion, and contract permissions.

### Getting Help

- **Documentation**: Check the comprehensive guides in this README
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Live Demo**: Test the application at https://shiny-meerkat-bf162f.netlify.app

### Useful Links

- [Solidity Documentation](https://docs.soliditylang.org/)
- [React Documentation](https://reactjs.org/docs/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

## 🎉 Acknowledgments

- **OpenZeppelin** - Smart contract security standards
- **Ethereum Foundation** - Blockchain infrastructure
- **React Team** - Frontend framework
- **Vite Team** - Build tooling
- **Tailwind CSS** - Styling framework

## 📈 Roadmap

### Phase 1: Foundation ✅ **COMPLETED**
- [x] Smart contract development and deployment
- [x] Frontend application with modern UI/UX
- [x] Wallet integration and network handling
- [x] Real-time event monitoring
- [x] Comprehensive testing and documentation

### Phase 2: Enhancement (In Progress)
- [ ] Backend service for referral code mapping
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Multi-language support

### Phase 3: Scale (Future)
- [ ] Mainnet deployment
- [ ] Multi-chain support
- [ ] Advanced gamification features
- [ ] Enterprise integrations

---

<div align="center">

**Built with ❤️ for the Web3 community**

[🌟 Star this repo](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [💡 Request Feature](https://github.com/your-repo/issues) • [🚀 Live Demo](https://shiny-meerkat-bf162f.netlify.app)

</div>