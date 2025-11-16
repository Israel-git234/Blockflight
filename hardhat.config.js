require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const BLOCKDAG_RPC_URL = process.env.BLOCKDAG_RPC_URL || "";

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
            url: "https://relay.awakening.bdagscan.com",
            chainId: 1043,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
        },
        sepolia: {
            url: "https://sepolia.infura.io/v3/" + (process.env.INFURA_KEY || ""),
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
        },
        mumbai: {
            url: "https://rpc-mumbai.maticvigil.com",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
        }
    },
};


