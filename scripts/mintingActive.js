const hre = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  const contractAddress = process.env[`NEXT_PUBLIC_CONTRACT_ADDRESS_${networkName.toUpperCase()}`];
  
  if (!contractAddress) {
    console.error(`Contract address not found for network: ${networkName}`);
    console.log(`Please set NEXT_PUBLIC_CONTRACT_ADDRESS_${networkName.toUpperCase()} in your .env.local file`);
    return;
  }

  console.log(`Enabling minting on ${networkName} network`);
  console.log("Contract address:", contractAddress);
  
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
    console.log("- Mint Price:", hre.ethers.formatEther(info.currentPrice), getNetworkCurrency(networkName));
    console.log("- Minting Active:", info.isMintingActive);
    console.log("- Whitelist Active:", info.isWhitelistActive);
    console.log("- Contract Paused:", info.isPaused);
    
  } catch (error) {
    console.error("Error enabling minting:", error.message);
  }
}

function getNetworkCurrency(networkName) {
  switch (networkName) {
    case 'polygon':
    case 'mumbai':
      return 'MATIC';
    default:
      return 'ETH';
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });