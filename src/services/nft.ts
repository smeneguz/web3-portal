import { ethers } from 'ethers';

export const mintNFT = async (walletAddress, tokenURI, contractAddress, provider) => {
    const signer = provider.getSigner(walletAddress);
    const contract = new ethers.Contract(contractAddress, NFT_ABI, signer);

    try {
        const transaction = await contract.mint(walletAddress, tokenURI);
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error("Minting failed:", error);
        throw error;
    }
};

export const fetchNFTs = async (walletAddress, contractAddress, provider) => {
    const contract = new ethers.Contract(contractAddress, NFT_ABI, provider);

    try {
        const balance = await contract.balanceOf(walletAddress);
        const nfts = [];

        for (let i = 0; i < balance.toNumber(); i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
            const tokenURI = await contract.tokenURI(tokenId);
            nfts.push({ tokenId, tokenURI });
        }

        return nfts;
    } catch (error) {
        console.error("Fetching NFTs failed:", error);
        throw error;
    }
};

const NFT_ABI = [
    // Add the relevant ABI details for your NFT contract here
];