# 🧪 BlockFlight Testing Checklist

## Pre-Testing Setup

### 1. Environment Configuration ✅
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Deploy contracts to BlockDAG testnet (or local network)
- [ ] Add contract addresses to `frontend/.env`:
  ```
  VITE_AVIATOR_CONTRACT=0x...
  VITE_CRUISE_CONTRACT=0x...
  VITE_COMMUNITY_MARKET_CONTRACT=0x...
  ```

### 2. Dependencies
- [ ] Run `npm install` in both root and `frontend/` directories
- [ ] Verify all packages are installed correctly

### 3. Build & Start
- [ ] Run `npm run dev` in `frontend/` directory
- [ ] Verify no console errors on startup
- [ ] Check that wallet connection works

## Feature Testing

### MarketAviator ✅
- [ ] **Contract Connection**: Verify contract status indicator shows "Connected to Smart Contract"
- [ ] **Place Bet**: 
  - [ ] Enter bet amount
  - [ ] Click "Start & Place Bet"
  - [ ] Verify transaction appears in wallet
  - [ ] Confirm transaction in wallet
  - [ ] Check loading state during transaction
  - [ ] Verify success notification appears
  - [ ] Check transaction appears in TransactionHistory
- [ ] **Cash Out**:
  - [ ] Wait for multiplier to increase
  - [ ] Click "Cash-out"
  - [ ] Verify transaction flow
  - [ ] Check payout is correct
- [ ] **Error Handling**:
  - [ ] Test with insufficient funds
  - [ ] Test transaction rejection
  - [ ] Verify error messages are user-friendly
- [ ] **Simulation Mode**:
  - [ ] Toggle "Use Smart Contract" off
  - [ ] Verify simulation still works
  - [ ] Toggle back on and verify contract works

### CommunityMarket ✅
- [ ] **Contract Connection**: Verify contract status indicator
- [ ] **Create Market**:
  - [ ] Fill in market details
  - [ ] Click "Create Prediction"
  - [ ] Verify transaction flow
  - [ ] Check market appears in list
- [ ] **Place Bet**:
  - [ ] Select a market
  - [ ] Enter wager amount
  - [ ] Click "Bet YES" or "Bet NO"
  - [ ] Verify transaction flow
  - [ ] Check bet is recorded
- [ ] **Error Handling**: Test various error scenarios
- [ ] **Transaction History**: Verify transactions appear

### CruiseMode ✅
- [ ] **Contract Connection**: Verify contract status indicator
- [ ] **Stake**:
  - [ ] Enter stake amount
  - [ ] Select duration
  - [ ] Click "Start Cruise"
  - [ ] Verify transaction flow
  - [ ] Check stake appears in active stakes
- [ ] **Unstake/Claim**:
  - [ ] Wait for lock period (or test early unstake if allowed)
  - [ ] Click "Claim Now"
  - [ ] Verify transaction flow
  - [ ] Check payout is correct
- [ ] **Error Handling**: Test various error scenarios
- [ ] **Transaction History**: Verify transactions appear

## UX Testing

### Transaction Feedback ✅
- [ ] Loading states appear during transactions
- [ ] Toast notifications show for success/error
- [ ] Transaction status indicator shows pending transactions
- [ ] Transaction history displays all transactions
- [ ] Error messages are clear and actionable

### Mobile Responsiveness ✅
- [ ] Test on mobile device or browser dev tools
- [ ] Verify buttons are touch-friendly
- [ ] Check navigation works on mobile
- [ ] Verify layouts adapt to small screens

### Error Handling ✅
- [ ] Network errors show helpful messages
- [ ] Contract errors are parsed correctly
- [ ] User rejections are handled gracefully
- [ ] Recovery suggestions appear when appropriate

## Integration Testing

### Wallet Connection
- [ ] Connect wallet successfully
- [ ] Switch networks (if applicable)
- [ ] Disconnect and reconnect
- [ ] Verify account changes are detected

### Contract Interactions
- [ ] All contract calls work correctly
- [ ] Transaction hashes are tracked
- [ ] Receipts are confirmed
- [ ] State updates after transactions

### Market Data
- [ ] Price data loads correctly
- [ ] Volatility calculations work
- [ ] Market indicators update
- [ ] Fallback works if API fails

## Known Issues to Watch For

1. **Contract Addresses**: If contracts aren't deployed, features will fall back to simulation mode
2. **Network Issues**: BlockDAG network might have different RPC requirements
3. **Gas Estimation**: Some transactions might fail if gas estimation is off
4. **Event Parsing**: Market ID extraction from events might need adjustment

## Post-Testing

- [ ] Document any bugs found
- [ ] Note any UX improvements needed
- [ ] Check console for warnings/errors
- [ ] Verify all features work in both contract and simulation modes

