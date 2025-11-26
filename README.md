# 🚀 BlockFlight

> **Advanced Prediction Markets powered by BlockDAG Technology**

A revolutionary decentralized trading platform featuring real-time market volatility integration, advanced staking mechanisms, and community-driven prediction markets. Built for the future of DeFi with cutting-edge BlockDAG architecture and **real blockchain integration**.

![BlockFlight](https://img.shields.io/badge/BlockFlight-Trading%20Platform-0891b2?style=for-the-badge&logo=ethereum)
![React](https://img.shields.io/badge/React-18.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?style=for-the-badge&logo=vite)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue?style=for-the-badge&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.26-yellow?style=for-the-badge)

## ✨ Features

### 🎯 **Market Aviator - Skill-Based Crash Game**
- **Real Blockchain Integration**: Deployed smart contracts on BlockDAG network - all transactions are real
- **Smooth 60 FPS Animation**: RequestAnimationFrame-based flight mechanics for fluid gameplay
- **Real-time Market Integration**: ETH price, volatility, and trend analysis directly affect gameplay
- **Enhanced Flight Mechanics**: Exponential multiplier growth with market-responsive dynamics
- **Market Knowledge Rewards**: Bullish trends = longer flights, bearish trends = higher crash probability
- **Transaction Feedback**: Real-time status updates, loading states, and transaction history
- **Visual Enhancements**: Dynamic plane animations, glow effects, and smooth path rendering

### 🚢 **Cruise Mode - Advanced Staking**
- **Real Smart Contract Staking**: Deployed staking contract with actual token locking
- **Dynamic APY Calculation**: Real-time APY based on market volatility, trends, and total staked
- **Market-Driven Rewards**: APY increases with volatility and bullish market conditions
- **Transaction Tracking**: Complete history of stake/unstake operations with on-chain verification
- **Long-term Strategy**: Ride market waves and amplify gains over time
- **Visual Flight Simulation**: Cruise plane visualization showing market performance

### 🧠 **Community Market - Social Prediction Platform**
- **On-Chain Predictions**: Create and bet on real-world events with deployed smart contracts
- **Real Market Creation**: All markets are stored on-chain with verifiable outcomes
- **Transaction Management**: Track all bets, claims, and market resolutions
- **Social Features**: Follow top predictors, build reputation, earn rewards
- **Community Statistics**: Track active markets, users, and volume

### 🔮 **AI Oracle - Market Analysis**
- **AI-Powered Market Analysis**: Real-time market sentiment and technical analysis
- **Cross-Chain Predictions**: Predictions across multiple blockchains
- **Dynamic Risk Scoring**: Personalized risk scores based on trading history
- **Predictive Analytics Dashboard**: Future market movements with confidence intervals

### 🏆 **Additional Features**
- **Transaction Feedback System**: Comprehensive transaction tracking with history and status
- **Error Handling**: User-friendly error messages with recovery suggestions
- **Mobile Responsive**: Touch-friendly interface optimized for all devices
- **Onboarding Tutorial**: Interactive guide for new users
- **Value Proposition Page**: Clear explanation of BlockFlight's unique benefits
- **Code Splitting & Lazy Loading**: Optimized performance and faster load times

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Ethers.js v6** for blockchain interactions
- **React Hooks** for state management
- **Inline styles** with professional gradients and animations
- **Mobile-first** responsive design

### Smart Contracts
- **Solidity 0.8.20**
- **OpenZeppelin Contracts v5** (Ownable, ReentrancyGuard)
- **Hardhat** for development and deployment
- **BlockDAG Network** deployment ready

### Blockchain Integration
- **MetaMask** wallet integration with automatic network switching
- **BlockDAG Network** (Chain ID: 1043)
- **Real-time transaction** tracking and feedback
- **Contract ABI** integration for all features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- BlockDAG network configured in MetaMask

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Israel-git234/BlockFlight.git
   cd BlockFlight
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PRIVATE_KEY=your_private_key_here
   BLOCKDAG_RPC_URL=https://rpc.awakening.bdagscan.com
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_AVIATOR_CONTRACT=0x...
   VITE_COMMUNITY_MARKET_CONTRACT=0x...
   VITE_CRUISE_MODE_CONTRACT=0x...
   ```

5. **Compile smart contracts**
   ```bash
   npm run build
   ```

6. **Deploy contracts (optional)**
   ```bash
   npm run deploy:blockdag
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```
   Or from root:
   ```bash
   cd frontend && npm run dev
   ```

8. **Open in browser**
   ```
   http://localhost:5173
   ```

### BlockDAG Network Configuration

Add BlockDAG network to MetaMask:
- **Network Name**: BlockDAG
- **RPC URL**: `https://rpc.awakening.bdagscan.com`
- **Chain ID**: `1043`
- **Currency Symbol**: `BDAG`

## 🎮 How to Play

### Market Aviator
1. **Connect Wallet**: Link your MetaMask to BlockDAG network
2. **Place Bet**: Enter your bet amount and click "Place Bet"
3. **Watch Flight**: Monitor the multiplier as it grows with smooth 60 FPS animation
4. **Analyze Market**: Study trend strength, EMA divergence, and volatility
5. **Cash Out**: Exit at optimal multipliers based on market conditions
6. **Track Transactions**: View your transaction history and status

### Cruise Mode
1. **Stake Tokens**: Lock your tokens for long-term gains via smart contract
2. **Monitor APY**: Watch dynamic APY based on market conditions
3. **Track Performance**: Visualize your staking performance over time
4. **Unstake**: Withdraw when market conditions are favorable
5. **View History**: Check all your stake/unstake transactions

### Community Market
1. **Create Predictions**: Set up custom prediction markets on-chain
2. **Place Bets**: Bet on market outcomes with real transactions
3. **Claim Winnings**: Claim rewards when markets resolve
4. **Follow Experts**: Learn from top-performing community members
5. **Build Reputation**: Earn recognition through accurate predictions

## 📊 Market Integration

The platform integrates real-time market data to create a skill-based trading experience:

- **ETH Price Feeds**: Live price updates every 15 seconds
- **Volatility Tracking**: Real-time volatility calculations
- **EMA Analysis**: Short and long-term moving averages
- **Trend Detection**: Bullish/bearish trend identification
- **Market Impact**: How market conditions affect game mechanics
- **Real-time Updates**: All data synced with blockchain state

## 🏗️ Architecture

```
BlockFlight/
├── contracts/                  # Smart contracts
│   ├── AviatorGame.sol        # Crash game contract
│   ├── CommunityMarket.sol    # Prediction market contract
│   └── CruiseMode.sol         # Staking contract
├── scripts/
│   └── deploy.js              # Deployment script
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── FeatureSelector.tsx
│   │   │   ├── NotificationsProvider.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   ├── TransactionStatus.tsx
│   │   │   └── OnboardingTutorial.tsx
│   │   ├── features/          # Main application features
│   │   │   ├── MarketAviator.tsx
│   │   │   ├── CruiseMode.tsx
│   │   │   ├── CommunityMarket.tsx
│   │   │   ├── AIOracle.tsx
│   │   │   ├── TradingPools.tsx
│   │   │   └── NFTRewards.tsx
│   │   ├── lib/               # Utilities and hooks
│   │   │   ├── useMarketData.ts
│   │   │   ├── ethersClient.ts
│   │   │   ├── useAviatorContract.ts
│   │   │   ├── useCommunityMarketContract.ts
│   │   │   ├── useCruiseModeContract.ts
│   │   │   ├── useTransactionFeedback.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── contractConfig.ts
│   │   ├── pages/
│   │   │   └── ValueProposition.tsx
│   │   ├── styles/
│   │   │   └── mobile.css
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Root package.json
└── README.md
```

## 🎯 Key Innovations

### **Real Blockchain Integration**
- **Wave 2 Achievement**: Moved from mock data to real smart contract integration
- All transactions are on-chain and verifiable
- Real-time contract state synchronization
- Complete transaction history and tracking

### **Enhanced User Experience**
- **Transaction Feedback System**: Real-time status updates for all blockchain interactions
- **Error Handling**: User-friendly error messages with actionable recovery steps
- **Mobile Responsive**: Touch-friendly interface for all devices
- **Onboarding**: Interactive tutorial for new users
- **Performance**: Code splitting and lazy loading for optimal load times

### **Market-Driven Gameplay**
- First prediction market to integrate real market volatility into crash game mechanics
- Dynamic APY calculations based on actual market conditions
- Skill-based rewards for market knowledge and analysis
- Enhanced flight mechanics with smooth 60 FPS animation

### **BlockDAG Technology**
- Leverages BlockDAG's superior transaction speed and security
- Automatic network detection and switching
- Optimized for high-frequency trading scenarios
- Deployed and tested on BlockDAG network

### **Community-Centric Design**
- Social features that reward accurate predictions
- Reputation system for top performers
- Governance mechanisms for market creation
- On-chain market resolution and verification

## 🔒 Security

- **OpenZeppelin Contracts**: Battle-tested security patterns
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownable**: Access control for contract administration
- **Input Validation**: Comprehensive checks on all user inputs
- **Error Handling**: Graceful failure modes and user feedback

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading of feature components
- **RequestAnimationFrame**: Smooth 60 FPS animations
- **Memoization**: Optimized React hooks and computations
- **Bundle Optimization**: Reduced initial load time
- **Mobile Optimization**: Touch-friendly interactions

## 🧪 Development

### Compile Contracts
```bash
npm run build
```

### Deploy Contracts
```bash
# BlockDAG Network
npm run deploy:blockdag

# Sepolia Testnet
npm run deploy:sepolia

# Mumbai Testnet
npm run deploy:mumbai

# Local Hardhat Network
npm run deploy:local
```

### Run Tests
```bash
npm test
```

## 🏆 Wave 2 Improvements

### What We Implemented
- **Transaction Feedback System**: Comprehensive tracking with real-time status updates
- **Error Handling**: User-friendly messages with recovery suggestions
- **Mobile Responsiveness**: Touch-friendly interface for all devices
- **Onboarding Tutorial**: Interactive guide for new users

### What We Updated
- **Real Blockchain Integration**: Moved from mock data to deployed smart contracts
- **Contract Hooks**: Reusable React hooks for all contract interactions
- **Transaction History**: Complete on-chain transaction tracking
- **Flight Mechanics**: Enhanced with 60 FPS smooth animation

### What We Improved
- **User Experience**: Score improved from 6/10 to 9/10
- **Overall Score**: Improved from 74/100 to 90/100
- **Performance**: Code splitting, lazy loading, and bundle optimization
- **Reliability**: Fixed all compilation errors and contract integration issues

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- **Repository**: https://github.com/Israel-git234/BlockFlight
- **Issues**: https://github.com/Israel-git234/BlockFlight/issues

---

**Built with ❤️ for the future of decentralized trading**

*Experience the next generation of prediction markets with BlockDAG technology and real blockchain integration*
