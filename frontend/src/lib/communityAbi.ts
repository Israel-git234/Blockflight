export const COMMUNITY_MARKET_ABI = [
  { "inputs": [
      {"internalType":"address","name":"initialOwner","type":"address"},
      {"internalType":"address","name":"treasuryAddress","type":"address"}
    ],
    "stateMutability":"nonpayable","type":"constructor"
  },
  { "inputs": [], "name": "houseEdgeBps", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "marketCount", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
  { "inputs": [{"internalType":"uint256","name":"","type":"uint256"}], "name": "markets", "outputs": [
      {"internalType":"address","name":"creator","type":"address"},
      {"internalType":"string","name":"title","type":"string"},
      {"internalType":"string","name":"description","type":"string"},
      {"internalType":"string","name":"category","type":"string"},
      {"internalType":"string","name":"privateGroupId","type":"string"},
      {"internalType":"uint64","name":"endsAt","type":"uint64"},
      {"internalType":"uint32","name":"yesOddsX100","type":"uint32"},
      {"internalType":"uint32","name":"noOddsX100","type":"uint32"},
      {"internalType":"uint256","name":"totalYesWei","type":"uint256"},
      {"internalType":"uint256","name":"totalNoWei","type":"uint256"},
      {"internalType":"bool","name":"resolved","type":"bool"},
      {"internalType":"bool","name":"outcomeYes","type":"bool"}
    ], "stateMutability":"view","type":"function" },
  { "inputs": [
      {"internalType":"string","name":"title","type":"string"},
      {"internalType":"string","name":"description","type":"string"},
      {"internalType":"string","name":"category","type":"string"},
      {"internalType":"string","name":"privateGroupId","type":"string"},
      {"internalType":"uint64","name":"endsAt","type":"uint64"},
      {"internalType":"uint32","name":"yesOddsX100","type":"uint32"},
      {"internalType":"uint32","name":"noOddsX100","type":"uint32"}
    ], "name":"createMarket","outputs":[{"internalType":"uint256","name":"id","type":"uint256"}], "stateMutability":"nonpayable","type":"function" },
  { "inputs": [
      {"internalType":"uint256","name":"id","type":"uint256"},
      {"internalType":"bool","name":"yes","type":"bool"}
    ], "name":"bet","outputs":[], "stateMutability":"payable","type":"function" },
  { "inputs": [
      {"internalType":"uint256","name":"id","type":"uint256"},
      {"internalType":"bool","name":"outcomeYes","type":"bool"}
    ], "name":"resolve","outputs":[], "stateMutability":"nonpayable","type":"function" },
  { "inputs": [
      {"internalType":"uint256","name":"id","type":"uint256"},
      {"internalType":"address","name":"user","type":"address"}
    ], "name":"previewClaim","outputs":[
      {"internalType":"uint256","name":"payoutWei","type":"uint256"},
      {"internalType":"uint256","name":"feeWei","type":"uint256"}
    ], "stateMutability":"view","type":"function" },
  { "inputs": [ {"internalType":"uint256","name":"id","type":"uint256"} ], "name":"claim","outputs":[], "stateMutability":"nonpayable","type":"function" }
]


