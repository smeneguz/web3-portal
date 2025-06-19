const hre = require("hardhat");

async function main() {
  console.log("🔄 Resetting localhost environment...\n");
  
  try {
    // 1. Check current state
    const [deployer] = await hre.ethers.getSigners();
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    
    console.log("📊 Current State:");
    console.log(`Block Number: ${currentBlock}`);
    console.log(`Deployer: ${deployer.address}`);
    // FIX: Use provider.getBalance instead of deployer.getBalance
    console.log(`Deployer Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);
    
    // 2. Deploy fresh contract
    console.log("🚀 Deploying fresh contract...");
    const Web3PortalNFT = await hre.ethers.getContractFactory("Web3PortalNFT");
    
    const contract = await Web3PortalNFT.deploy(
      "Web3Portal NFT",
      "WP3", 
      "https://gateway.pinata.cloud/ipfs/YOUR_METADATA_HASH/",
      hre.ethers.parseEther("0.01")
    );
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`✅ Contract deployed: ${contractAddress}`);
    
    // 3. Enable minting
    console.log("⚙️ Enabling minting...");
    await contract.toggleMinting();
    console.log("✅ Minting enabled");
    
    // 4. Transfer ETH to target wallet
    const targetAddress = "0xb67FcF3CB3541AF19139CE9bd8e3Fecf9B2db0d9";
    console.log(`💰 Transferring 10 ETH to ${targetAddress}...`);
    
    const transferTx = await deployer.sendTransaction({
      to: targetAddress,
      value: hre.ethers.parseEther("10")
    });
    
    await transferTx.wait();
    console.log("✅ ETH transferred");
    
    // 5. Verify everything
    console.log("\n📋 Final State:");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Target Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(targetAddress))} ETH`);
    
    const info = await contract.getContractInfo();
    console.log(`Minting Active: ${info.isMintingActive}`);
    console.log(`Current Supply: ${info.currentSupply.toString()}`);
    console.log(`Max Supply: ${info.maxSupply.toString()}`);
    console.log(`Mint Price: ${hre.ethers.formatEther(info.currentPrice)} ETH`);
    
    console.log("\n🎉 Localhost environment reset complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Reset your MetaMask account");
    console.log("2. Delete and re-add localhost network in MetaMask");
    console.log("3. Test minting in the frontend");
    console.log(`4. Contract Address: ${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });