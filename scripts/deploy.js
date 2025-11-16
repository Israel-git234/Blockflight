const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    if (!deployer) {
        console.error("No deployer account found. Check your .env file and private key.");
        process.exit(1);
    }
    
    const treasury = process.env.TREASURY || deployer.address;

    console.log("Deployer:", deployer.address);
    console.log("Treasury:", treasury);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
        console.error("Deployer has no ETH. Get testnet ETH from a faucet first.");
        process.exit(1);
    }

    console.log("Deploying AviatorGame...");
    const AviatorGame = await hre.ethers.getContractFactory("AviatorGame");
    const aviator = await AviatorGame.deploy(deployer.address, treasury);
    await aviator.waitForDeployment();
    console.log("AviatorGame deployed to:", await aviator.getAddress());

    console.log("Deploying CruiseMode...");
    const CruiseMode = await hre.ethers.getContractFactory("CruiseMode");
    const cruise = await CruiseMode.deploy(deployer.address, treasury);
    await cruise.waitForDeployment();
    console.log("CruiseMode deployed to:", await cruise.getAddress());

    console.log("Deploying CommunityMarket...");
    const CommunityMarket = await hre.ethers.getContractFactory("CommunityMarket");
    const community = await CommunityMarket.deploy(deployer.address, treasury);
    await community.waitForDeployment();
    console.log("CommunityMarket deployed to:", await community.getAddress());
    
    console.log("\n🎉 Deployment Complete!");
    console.log("📋 Copy these addresses to your frontend/.env:");
    console.log(`VITE_AVIATOR_CONTRACT=${await aviator.getAddress()}`);
    console.log(`VITE_CRUISE_CONTRACT=${await cruise.getAddress()}`);
    console.log(`VITE_COMMUNITY_MARKET_CONTRACT=${await community.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


