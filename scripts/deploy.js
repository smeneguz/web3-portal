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

// Network-specific deployment parameters
function getDeployParams(networkName) {
  const baseParams = {
    name: "Web3Portal NFT",
    symbol: "WP3",
    baseURI: "https://gateway.pinata.cloud/ipfs/QmYourHashHere/",
  };

  switch (networkName) {
    case 'localhost':
    case 'hardhat':
      return {
        ...baseParams,
        name: "Web3Portal NFT (Local)",
        mintPrice: hre.ethers.parseEther("0.01")
      };
    
    case 'sepolia':
      return {
        ...baseParams,
        name: "Web3Portal NFT (Sepolia)",
        mintPrice: hre.ethers.parseEther("0.001") // Very low price for testnet
      };
    
    case 'amoy':
      return {
        ...baseParams,
        name: "Web3Portal NFT (Amoy)",
        mintPrice: hre.ethers.parseEther("0.001") // Very low price for testnet
      };
    
    case 'polygon':
      return {
        ...baseParams,
        name: "Web3Portal NFT",
        mintPrice: hre.ethers.parseEther("1")
      };
    
    default:
      return {
        ...baseParams,
        mintPrice: hre.ethers.parseEther("0.01")
      };
  }
}

// Get network currency symbol
function getNetworkCurrency(networkName) {
  switch (networkName) {
    case 'polygon':
    case 'amoy':
      return 'MATIC';
    default:
      return 'ETH';
  }
}

async function main() {
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  const currency = getNetworkCurrency(networkName);
  
  console.log("🚀 Starting Web3Portal NFT Contract Deployment...\n");
  console.log(`Deploying to ${networkName} (Chain ID: ${chainId})`);

  try {
    // Get deployment account
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    
    console.log(`Deploying contracts with account: ${deployer.address}`);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ${currency}\n`);

    // Check minimum balance for deployment
    const minBalance = hre.ethers.parseEther("0.005"); // Lower minimum for testnet
    if (balance < minBalance) {
      throw new Error(`Insufficient balance for deployment. Need at least 0.005 ${currency}, have ${hre.ethers.formatEther(balance)} ${currency}`);
    }

    // Get deployment parameters for this network
    const deployParams = getDeployParams(networkName);
    
    console.log("📄 Contract Parameters:");
    console.log(`Name: ${deployParams.name}`);
    console.log(`Symbol: ${deployParams.symbol}`);
    console.log(`Base URI: ${deployParams.baseURI}`);
    console.log(`Mint Price: ${hre.ethers.formatEther(deployParams.mintPrice)} ${currency}\n`);

    // Get the contract factory
    const Web3PortalNFT = await hre.ethers.getContractFactory("Web3PortalNFT");
    
    console.log("⏳ Deploying contract...");
    
    // Deploy with network-specific parameters
    const contract = await Web3PortalNFT.deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.baseURI,
      deployParams.mintPrice
    );

    console.log("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    
    console.log("✅ Contract deployed successfully!");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔗 Transaction Hash: ${deploymentTx.hash}\n`);

    // Wait for confirmations on testnets
    if (networkName !== 'localhost' && networkName !== 'hardhat') {
      console.log("⏳ Waiting for block confirmations...");
      await deploymentTx.wait(2); // Wait for 2 confirmations
      console.log("✅ Transaction confirmed!\n");
    }

    // Get contract info
    const contractInfo = await contract.getContractInfo();
    
    console.log("📊 Contract Information:");
    console.log(`Current Supply: ${contractInfo.currentSupply.toString()}`);
    console.log(`Max Supply: ${contractInfo.maxSupply.toString()}`);
    console.log(`Mint Price: ${hre.ethers.formatEther(contractInfo.currentPrice)} ${currency}`);
    console.log(`Minting Active: ${contractInfo.isMintingActive}`);
    console.log(`Whitelist Active: ${contractInfo.isWhitelistActive}`);
    console.log(`Contract Paused: ${contractInfo.isPaused}\n`);

    // Save deployment info
    const deploymentInfo = {
      network: networkName,
      chainId: chainId,
      contractAddress: contractAddress,
      contractName: deployParams.name,
      contractSymbol: deployParams.symbol,
      baseURI: deployParams.baseURI,
      mintPrice: deployParams.mintPrice.toString(),
      deploymentHash: deploymentTx.hash,
      timestamp: new Date().toISOString(),
      currency: currency,
      contractInfo: {
        currentSupply: contractInfo.currentSupply.toString(),
        maxSupply: contractInfo.maxSupply.toString(),
        currentPrice: contractInfo.currentPrice.toString(),
        isMintingActive: contractInfo.isMintingActive,
        isWhitelistActive: contractInfo.isWhitelistActive,
        isPaused: contractInfo.isPaused
      }
    };

    // Create deployments directory
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info
    const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, bigIntReplacer, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);

    // Update environment variables
    const envPath = path.join(__dirname, "../.env.local");
    let envContent = "";
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    const envKey = `NEXT_PUBLIC_CONTRACT_ADDRESS_${networkName.toUpperCase()}`;
    const envLine = `${envKey}=${contractAddress}`;
    
    if (envContent.includes(envKey)) {
      envContent = envContent.replace(new RegExp(`${envKey}=.*`), envLine);
    } else {
      envContent += `\n${envLine}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`🔧 Environment variable updated: ${envLine}\n`);

    console.log("🎉 Deployment Summary:");
    console.log("==================");
    console.log(`Network: ${networkName}`);
    console.log(`Contract: ${contractAddress}`);
    console.log(`Mint Price: ${hre.ethers.formatEther(deployParams.mintPrice)} ${currency}`);

    console.log("\n📝 Next Steps:");
    console.log("1. ✅ Contract deployed successfully");
    console.log("2. 🔧 Environment variables updated");
    console.log("3. ⚙️ Enable minting: npm run enable-minting:" + networkName);
    console.log("4. 🎮 Test minting functionality");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log("\n💡 Solutions:");
      console.log(`- Get more testnet tokens from faucets`);
      if (networkName === 'sepolia') {
        console.log(`- Sepolia faucet: https://sepoliafaucet.com/`);
      } else if (networkName === 'amoy') {
        console.log(`- Amoy faucet: https://faucet.polygon.technology/`);
      }
    } else if (error.message.includes('Too Many Requests')) {
      console.log("\n💡 Rate limit reached. Using public RPC now.");
      console.log("Try again in a few minutes or use different RPC endpoints.");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });