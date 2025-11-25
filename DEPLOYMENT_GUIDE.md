# 🚀 BlockFlight Contract Deployment Guide

## Prerequisites

1. **Node.js and npm** installed
2. **Wallet with testnet tokens** (BlockDAG testnet tokens)
3. **Private key** from your wallet (keep this secure!)

## Step 1: Install Dependencies

```bash
# In the project root directory
npm install
```

## Step 2: Create Environment File

Create a `.env` file in the **project root** (not in frontend/):

```bash
# Create .env file
touch .env
```

Add the following to `.env`:

```env
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Custom treasury address (defaults to deployer address)
TREASURY=0x...

# Optional: BlockDAG RPC URL (defaults to https://relay.awakening.bdagscan.com)
BLOCKDAG_RPC_URL=https://relay.awakening.bdagscan.com

# Optional: For other networks
INFURA_KEY=your_infura_key_here
```

⚠️ **SECURITY WARNING**: Never commit your `.env` file to git! It contains your private key.

## Step 3: Get Your Private Key

### From MetaMask:
1. Open MetaMask
2. Click the three dots (⋮) next to your account
3. Select "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key (remove the `0x` prefix if present)

### From Other Wallets:
- Follow your wallet's export instructions
- **Never share your private key with anyone!**

## Step 4: Compile Contracts

```bash
npm run build
# or
npx hardhat compile
```

This will compile all contracts and create artifacts in the `artifacts/` directory.

## Step 5: Check Your Balance

Before deploying, make sure your wallet has enough tokens for gas fees:

```bash
# This will be checked automatically during deployment
# But you can verify manually by checking your wallet balance
```

## Step 6: Deploy Contracts

### Option 1: Deploy to BlockDAG Network (Recommended)

```bash
npm run deploy:blockdag
# or
npx hardhat run scripts/deploy.js --network blockdag
```

### Option 2: Deploy to Local Hardhat Network (for testing)

```bash
npm run deploy:local
# or
npx hardhat run scripts/deploy.js --network hardhat
```

### Option 3: Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
# or
npx hardhat run scripts/deploy.js --network sepolia
```

### Option 4: Deploy to Mumbai Testnet

```bash
npm run deploy:mumbai
# or
npx hardhat run scripts/deploy.js --network mumbai
```

## Step 7: Copy Contract Addresses

After deployment, you'll see output like this:

```
🎉 Deployment Complete!
📋 Copy these addresses to your frontend/.env:
VITE_AVIATOR_CONTRACT=0x1234567890123456789012345678901234567890
VITE_CRUISE_CONTRACT=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
VITE_COMMUNITY_MARKET_CONTRACT=0x9876543210987654321098765432109876543210
```

## Step 8: Update Frontend Environment

1. Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Add the contract addresses to `frontend/.env`:
   ```env
   VITE_AVIATOR_CONTRACT=0x1234567890123456789012345678901234567890
   VITE_CRUISE_CONTRACT=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
   VITE_COMMUNITY_MARKET_CONTRACT=0x9876543210987654321098765432109876543210
   ```

## Step 9: Verify Deployment

1. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Connect your wallet
3. Check that the contract status indicators show "Connected to Smart Contract"

## Troubleshooting

### Error: "No deployer account found"
- Make sure your `.env` file has `PRIVATE_KEY` set
- Ensure the private key doesn't have `0x` prefix

### Error: "Deployer has no ETH"
- Get testnet tokens from a faucet
- For BlockDAG: Check their official documentation for testnet faucet
- For Sepolia: Use https://sepoliafaucet.com/
- For Mumbai: Use https://faucet.polygon.technology/

### Error: "Network error" or "Connection timeout"
- Check your internet connection
- Verify the RPC URL is correct
- Try a different RPC endpoint

### Error: "Contract deployment failed"
- Check that you have enough gas
- Verify the contract code compiles without errors
- Check network congestion

### Contracts deployed but frontend can't connect
- Verify contract addresses in `frontend/.env` are correct
- Check that you're on the correct network in your wallet
- Ensure the frontend is reading the `.env` file (restart dev server)

## Network Configuration

### BlockDAG Network
- **Chain ID**: 1043
- **RPC URL**: `https://relay.awakening.bdagscan.com`
- **Explorer**: Check BlockDAG documentation

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- **Explorer**: https://sepolia.etherscan.io

### Mumbai Testnet
- **Chain ID**: 80001
- **RPC URL**: `https://rpc-mumbai.maticvigil.com`
- **Explorer**: https://mumbai.polygonscan.com

## Security Best Practices

1. ✅ **Never commit `.env` files** - Add to `.gitignore`
2. ✅ **Use separate wallets** for testing and production
3. ✅ **Keep private keys secure** - Use environment variables, not hardcoded
4. ✅ **Verify contracts** on block explorers after deployment
5. ✅ **Test thoroughly** on testnets before mainnet deployment

## Next Steps

After deployment:
1. ✅ Verify contracts on block explorer
2. ✅ Test all contract functions
3. ✅ Update frontend with contract addresses
4. ✅ Test frontend integration
5. ✅ Document any issues or improvements needed

## Quick Reference

```bash
# Compile
npm run build

# Deploy to BlockDAG
npm run deploy:blockdag

# Deploy to local network
npm run deploy:local

# Run tests
npm test
```

