const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3PortalNFT", function () {
  let Web3PortalNFT;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const NAME = "Web3Portal NFT";
  const SYMBOL = "WP3";
  const BASE_URI = "https://gateway.pinata.cloud/ipfs/test/";
  const MINT_PRICE = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    Web3PortalNFT = await ethers.getContractFactory("Web3PortalNFT");
    contract = await Web3PortalNFT.deploy(NAME, SYMBOL, BASE_URI, MINT_PRICE);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await contract.name()).to.equal(NAME);
      expect(await contract.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct mint price", async function () {
      expect(await contract.mintPrice()).to.equal(MINT_PRICE);
    });

    it("Should start with minting inactive", async function () {
      expect(await contract.mintingActive()).to.equal(false);
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await contract.toggleMinting(); // Enable minting
    });

    it("Should mint tokens successfully", async function () {
      await contract.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await contract.balanceOf(addr1.address)).to.equal(1);
      expect(await contract.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should fail when minting is not active", async function () {
      await contract.toggleMinting(); // Disable minting
      await expect(
        contract.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWithCustomError(contract, "MintingNotActive");
    });

    it("Should fail with insufficient payment", async function () {
      await expect(
        contract.connect(addr1).mint(1, { value: ethers.parseEther("0.005") })
      ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
    });

    it("Should respect max mint per transaction", async function () {
      const quantity = 11; // Exceeds MAX_MINT_PER_TX (10)
      await expect(
        contract.connect(addr1).mint(quantity, { value: MINT_PRICE * BigInt(quantity) })
      ).to.be.revertedWithCustomError(contract, "ExceedsMaxMintPerTx");
    });
  });

  describe("Whitelist", function () {
    beforeEach(async function () {
      await contract.toggleMinting();
      await contract.toggleWhitelist();
    });

    it("Should allow whitelisted users to mint", async function () {
      await contract.updateWhitelist([addr1.address], true);
      await contract.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await contract.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should block non-whitelisted users", async function () {
      await expect(
        contract.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWithCustomError(contract, "NotWhitelisted");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to free mint", async function () {
      await contract.toggleMinting();
      await contract.freeMint(addr1.address, 5);
      expect(await contract.balanceOf(addr1.address)).to.equal(5);
    });

    it("Should allow owner to batch mint", async function () {
      const recipients = [addr1.address, addr2.address];
      const quantities = [3, 2];
      
      await contract.batchMint(recipients, quantities);
      expect(await contract.balanceOf(addr1.address)).to.equal(3);
      expect(await contract.balanceOf(addr2.address)).to.equal(2);
    });

    it("Should allow owner to withdraw funds", async function () {
      await contract.toggleMinting();
      await contract.connect(addr1).mint(1, { value: MINT_PRICE });
      
      const initialBalance = await owner.provider.getBalance(owner.address);
      await contract.withdraw();
      const finalBalance = await owner.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("View Functions", function () {
    it("Should return contract info correctly", async function () {
      const info = await contract.getContractInfo();
      expect(info.maxSupply).to.equal(10000);
      expect(info.currentPrice).to.equal(MINT_PRICE);
    });

    it("Should return tokens of owner", async function () {
      await contract.toggleMinting();
      await contract.freeMint(addr1.address, 3);
      
      const tokens = await contract.tokensOfOwner(addr1.address);
      expect(tokens.length).to.equal(3);
    });
  });
});