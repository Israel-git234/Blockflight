require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const BLOCKDAG_RPC_URL = process.env.BLOCKDAG_RPC_URL || "";

// Check if PRIVATE_KEY is valid (64 hex chars, not a placeholder)
const isValidPrivateKey = PRIVATE_KEY && 
    PRIVATE_KEY !== "your_private_key_here" && 
    PRIVATE_KEY.length === 64 && 
    /^[0-9a-fA-F]+$/.test(PRIVATE_KEY);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: { enabled: true, runs: 200 }
        }
    },
    networks: {
        hardhat: {},
        blockdag: {
            url: BLOCKDAG_RPC_URL || "https://relay.awakening.bdagscan.com",
            chainId: 1043,
            accounts: isValidPrivateKey ? [PRIVATE_KEY] : []
        },
        sepolia: {
            url: "https://sepolia.infura.io/v3/" + (process.env.INFURA_KEY || ""),
            accounts: isValidPrivateKey ? [PRIVATE_KEY] : []
        },
        mumbai: {
            url: "https://rpc-mumbai.maticvigil.com",
            accounts: isValidPrivateKey ? [PRIVATE_KEY] : []
        }
    },
};


