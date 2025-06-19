const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Testing mint functionality...");
  console.log("Contract address:", contractAddress);
  
  try {
    const contract = await hre.ethers.getContractAt("Web3PortalNFT", contractAddress);
    const [signer] = await hre.ethers.getSigners();
    
    console.log("Signer:", signer.address);
    
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
    
    // Get contract info
    const info = await contract.getContractInfo();
    console.log("\nContract Status:");
    console.log("- Minting Active:", info.isMintingActive);
    console.log("- Current Supply:", info.currentSupply.toString());
    console.log("- Max Supply:", info.maxSupply.toString());
    console.log("- Mint Price:", hre.ethers.formatEther(info.currentPrice), "ETH");
    
    if (!info.isMintingActive) {
      console.log("\n⚠️ Minting not active, enabling...");
      const toggleTx = await contract.toggleMinting();
      await toggleTx.wait();
      console.log("✅ Minting enabled");
    }
    
    // Get mint price for calculations
    const mintPrice = info.currentPrice;
    
    // Test mint 1 NFT
    console.log("\n🎯 Testing mint 1 NFT...");
    const currentBalance = await hre.ethers.provider.getBalance(signer.address);
    
    if (currentBalance < mintPrice) {
      throw new Error(`Insufficient balance. Need ${hre.ethers.formatEther(mintPrice)} ETH, have ${hre.ethers.formatEther(currentBalance)} ETH`);
    }
    
    console.log(`Attempting to mint 1 NFT for ${hre.ethers.formatEther(mintPrice)} ETH`);
    
    // Calculate gas for 1 NFT with best practices
    const gasEstimate1 = await contract.mint.estimateGas(1, { value: mintPrice });
    const gasWithBuffer1 = gasEstimate1 + (gasEstimate1 * 20n / 100n); // 20% buffer
    
    console.log(`Gas estimate for 1 NFT: ${gasEstimate1.toString()}`);
    console.log(`Gas with buffer: ${gasWithBuffer1.toString()}`);
    
    const mintTx = await contract.mint(1, { 
      value: mintPrice,
      gasLimit: gasWithBuffer1
    });
    
    console.log("Mint transaction sent:", mintTx.hash);
    const receipt = await mintTx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Mint 1 NFT successful!");
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      const newBalance = await contract.balanceOf(signer.address);
      console.log("New NFT balance:", newBalance.toString());
      
      // Test mint 3 NFTs
      console.log("\n🎯 Testing mint 3 NFTs...");
      const totalCost = mintPrice * 3n; // FIX: Define totalCost properly
      console.log(`Attempting to mint 3 NFTs for ${hre.ethers.formatEther(totalCost)} ETH`);
      
      // Calculate gas for 3 NFTs with best practices
      const gasEstimate3 = await contract.mint.estimateGas(3, { value: totalCost });
      const gasWithBuffer3 = gasEstimate3 + (gasEstimate3 * 20n / 100n); // 20% buffer
      
      console.log(`Gas estimate for 3 NFTs: ${gasEstimate3.toString()}`);
      console.log(`Gas with buffer: ${gasWithBuffer3.toString()}`);
      
      const mint3Tx = await contract.mint(3, { 
        value: totalCost,
        gasLimit: gasWithBuffer3
      });
      
      console.log("Mint 3 transaction sent:", mint3Tx.hash);
      const receipt3 = await mint3Tx.wait();
      
      if (receipt3.status === 1) {
        console.log("✅ Mint 3 NFTs successful!");
        console.log(`Gas used: ${receipt3.gasUsed.toString()}`);
        
        const finalBalance = await contract.balanceOf(signer.address);
        console.log("Final NFT balance:", finalBalance.toString());
        
        const tokens = await contract.tokensOfOwner(signer.address);
        console.log("Token IDs owned:", tokens.map(t => t.toString()).join(", "));
        
        const finalInfo = await contract.getContractInfo();
        console.log("\n📊 Final Contract Status:");
        console.log("- Current Supply:", finalInfo.currentSupply.toString());
        console.log("- Remaining Supply:", (finalInfo.maxSupply - finalInfo.currentSupply).toString());
        
      } else {
        console.error("❌ Mint 3 NFTs failed");
      }
      
    } else {
      console.error("❌ Mint 1 NFT failed");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    
    if (error.data) {
      console.error("❌ Error data:", error.data);
    }
    if (error.reason) {
      console.error("❌ Error reason:", error.reason);
    }
    if (error.code) {
      console.error("❌ Error code:", error.code);
    }
    
    if (error.message.includes('revert')) {
      console.error("❌ Contract reverted. Check contract conditions:");
      console.error("  - Is minting active?");
      console.error("  - Is sufficient ETH sent?");
      console.error("  - Is contract paused?");
      console.error("  - Does exceed max supply?");
    }
  }
}

main()
  .then(() => {
    console.log("\n🎉 Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });