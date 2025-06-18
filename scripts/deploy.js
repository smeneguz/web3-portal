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
  console.log("🚀 Starting Web3Portal NFT Contract Deployment...\n");

  // Get the contract factory
  const Web3PortalNFT = await hre.ethers.getContractFactory("Web3PortalNFT");
  
  // Get deployment account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.getBalance();
  
  console.log("📋 Deployment Details:");
  console.log(`Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId})`);
  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.utils.formatEther(balance)} ETH\n`);

  // Contract parameters
  const contractName = "Web3Portal NFT";
  const contractSymbol = "WP3";
  const baseURI = "https://gateway.pinata.cloud/ipfs/QmYourHashHere/";
  const mintPrice = hre.ethers.utils.parseEther("0.01");

  console.log("📄 Contract Parameters:");
  console.log(`Name: ${contractName}`);
  console.log(`Symbol: ${contractSymbol}`);
  console.log(`Base URI: ${baseURI}`);
  console.log(`Initial Mint Price: ${hre.ethers.utils.formatEther(mintPrice)} ETH\n`);

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const contract = await Web3PortalNFT.deploy(
    contractName,
    contractSymbol,
    baseURI,
    mintPrice
  );

  console.log("⏳ Waiting for deployment transaction to be mined...");
  await contract.deployed();

  console.log("✅ Contract deployed successfully!");
  console.log(`📍 Contract Address: ${contract.address}`);
  console.log(`🔗 Transaction Hash: ${contract.deployTransaction.hash}\n`);

  // Get contract info
  try {
    const contractInfo = await contract.getContractInfo();
    
    console.log("📊 Contract Info:");
    console.log(`Current Supply: ${contractInfo.currentSupply.toString()}`);
    console.log(`Max Supply: ${contractInfo.maxSupply.toString()}`);
    console.log(`Mint Price: ${hre.ethers.utils.formatEther(contractInfo.currentPrice)} ETH`);
    console.log(`Minting Active: ${contractInfo.isMintingActive}`);
    console.log(`Whitelist Active: ${contractInfo.isWhitelistActive}`);
    console.log(`Paused: ${contractInfo.isPaused}\n`);

    // Save deployment info to files
    const deploymentInfo = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      contractAddress: contract.address,
      contractName: contractName,
      contractSymbol: contractSymbol,
      baseURI: baseURI,
      mintPrice: mintPrice.toString(), // Convert BigInt to string
      deploymentHash: contract.deployTransaction.hash,
      deploymentBlock: contract.deployTransaction.blockNumber,
      timestamp: new Date().toISOString(),
      contractInfo: {
        currentSupply: contractInfo.currentSupply.toString(),
        maxSupply: contractInfo.maxSupply.toString(),
        currentPrice: contractInfo.currentPrice.toString(),
        isMintingActive: contractInfo.isMintingActive,
        isWhitelistActive: contractInfo.isWhitelistActive,
        isPaused: contractInfo.isPaused
      }
    };

    // Save to deployments folder
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, bigIntReplacer, 2));

    // Update contract addresses in .env.local
    const envPath = path.join(__dirname, "../.env.local");
    let envContent = "";
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    const envKey = `NEXT_PUBLIC_CONTRACT_ADDRESS_${hre.network.name.toUpperCase()}`;
    const envLine = `${envKey}=${contract.address}`;
    
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

    console.log("💾 Deployment info saved to:");
    console.log(`📁 ${deploymentFile}`);
    console.log(`📁 ${envPath}`);
    console.log(`🔧 Environment variable: ${envLine}\n`);

    // Save ABI to src/contracts
    const contractsDir = path.join(__dirname, "../src/contracts");
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    const artifactPath = path.join(__dirname, "../artifacts/contracts/Web3PortalNFT.sol/Web3PortalNFT.json");
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      
      // Save ABI
      const abiPath = path.join(contractsDir, "Web3PortalNFT.json");
      fs.writeFileSync(abiPath, JSON.stringify({
        abi: artifact.abi,
        contractName: contractName,
        contractAddress: contract.address,
        network: hre.network.name,
        deploymentHash: contract.deployTransaction.hash
      }, null, 2));

      console.log(`📄 Contract ABI saved to: ${abiPath}`);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("1. ✅ Contract is deployed and ready");
    console.log("2. 🔧 Environment variables updated");
    console.log("3. 🎯 Start your Next.js app: npm run dev");
    console.log("4. 🎮 Test minting functionality");
    console.log("\n⚠️  Remember to:");
    console.log("- Enable minting: contract.toggleMinting()");
    console.log("- Set proper metadata URIs");
    console.log("- Configure whitelist if needed");

  } catch (error) {
    console.error("❌ Error getting contract info:", error.message);
    console.log("✅ Contract deployed but info retrieval failed");
    console.log(`📍 Contract Address: ${contract.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });