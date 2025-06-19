const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper function to convert BigInt to string for JSON serialization
function bigIntReplacer(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

async function main() {
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Deploying to ${networkName} (Chain ID: ${chainId})`);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const Web3PortalNFT = await hre.ethers.getContractFactory("Web3PortalNFT");
  
  const deployParams = getDeployParams(networkName);
  console.log("Deploying with parameters:", {
    ...deployParams,
    mintPrice: hre.ethers.formatEther(deployParams.mintPrice) + " " + getNetworkCurrency(networkName)
  });
  
  const contract = await Web3PortalNFT.deploy(
    deployParams.name,
    deployParams.symbol,
    deployParams.baseURI,
    deployParams.mintPrice
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`Web3PortalNFT deployed to: ${contractAddress}`);

  // Salva info deployment con proper BigInt handling
  const deploymentInfo = {
    network: networkName,
    chainId: chainId,
    contractAddress: contractAddress,
    deploymentTime: new Date().toISOString(),
    parameters: {
      name: deployParams.name,
      symbol: deployParams.symbol,
      baseURI: deployParams.baseURI,
      mintPrice: deployParams.mintPrice.toString(), // Convert BigInt to string
      mintPriceFormatted: hre.ethers.formatEther(deployParams.mintPrice) + " " + getNetworkCurrency(networkName)
    },
    deployer: deployer.address
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Use bigIntReplacer for JSON serialization
  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}.json`),
    JSON.stringify(deploymentInfo, bigIntReplacer, 2)
  );

  // Update .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const envKey = `NEXT_PUBLIC_CONTRACT_ADDRESS_${networkName.toUpperCase()}`;
  const envLine = `${envKey}=${contractAddress}`;
  
  if (envContent.includes(envKey)) {
    // Replace existing line
    envContent = envContent.replace(
      new RegExp(`${envKey}=.*`),
      envLine
    );
  } else {
    // Add new line
    envContent += `\n${envLine}`;
  }

  fs.writeFileSync(envPath, envContent);

  // Abilita minting se localhost
  if (networkName === 'localhost') {
    console.log("Enabling minting for localhost...");
    try {
      await contract.toggleMinting();
      console.log("Minting enabled successfully!");
    } catch (error) {
      console.error("Failed to enable minting:", error.message);
    }
  }

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Name: ${deployParams.name}`);
  console.log(`Symbol: ${deployParams.symbol}`);
  console.log(`Mint Price: ${hre.ethers.formatEther(deployParams.mintPrice)} ${getNetworkCurrency(networkName)}`);
  console.log(`Base URI: ${deployParams.baseURI}`);
  
  if (networkName !== 'localhost') {
    console.log(`\nAdd this to your .env.local:`);
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS_${networkName.toUpperCase()}=${contractAddress}`);
  } else {
    console.log(`\nContract added to .env.local automatically`);
  }

  console.log(`\nDeployment info saved to: deployments/${networkName}.json`);
  console.log("🎉 Deployment completed successfully!");
}

function getDeployParams(networkName) {
  const baseParams = {
    name: "Web3Portal NFT",
    symbol: "WP3",
    baseURI: "https://gateway.pinata.cloud/ipfs/YOUR_METADATA_HASH/",
  };

  switch (networkName) {
    case 'localhost':
    case 'hardhat':
      return {
        ...baseParams,
        mintPrice: hre.ethers.parseEther("0.01")
      };
    
    case 'sepolia':
      return {
        ...baseParams,
        name: "Web3Portal NFT (Sepolia)",
        mintPrice: hre.ethers.parseEther("0.001")
      };
    
    case 'mumbai':
      return {
        ...baseParams,
        name: "Web3Portal NFT (Mumbai)",
        mintPrice: hre.ethers.parseEther("0.01")
      };
    
    case 'polygon':
      return {
        ...baseParams,
        mintPrice: hre.ethers.parseEther("1.0")
      };
    
    default:
      return {
        ...baseParams,
        mintPrice: hre.ethers.parseEther("0.01")
      };
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
    console.error("Deployment failed:", error);
    process.exit(1);
  });