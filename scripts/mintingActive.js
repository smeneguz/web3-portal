const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST;
  
  if (!contractAddress) {
    console.error("Contract address not found in environment variables");
    console.log("Please set NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST in your .env.local file");
    return;
  }

  console.log("Enabling minting on contract:", contractAddress);
  
  try {
    const contract = await hre.ethers.getContractAt("Web3PortalNFT", contractAddress);
    
    // Check current status
    const isActive = await contract.mintingActive();
    console.log("Current minting status:", isActive);
    
    if (!isActive) {
      console.log("Enabling minting...");
      const tx = await contract.toggleMinting();
      await tx.wait();
      console.log("Minting enabled successfully!");
    } else {
      console.log("Minting is already active");
    }
    
    // Display contract information
    const info = await contract.getContractInfo();
    console.log("\nContract Information:");
    console.log("- Current Supply:", info.currentSupply.toString());
    console.log("- Max Supply:", info.maxSupply.toString());
    console.log("- Mint Price:", hre.ethers.formatEther(info.currentPrice), "ETH");
    console.log("- Minting Active:", info.isMintingActive);
    console.log("- Whitelist Active:", info.isWhitelistActive);
    console.log("- Contract Paused:", info.isPaused);
    
  } catch (error) {
    console.error("Error enabling minting:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });