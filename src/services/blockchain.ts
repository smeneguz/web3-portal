import { ethers } from 'ethers';

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return accounts[0];
        } catch (error) {
            console.error("Error connecting to wallet:", error);
            throw new Error("Wallet connection failed");
        }
    } else {
        throw new Error("No wallet found. Please install a wallet extension.");
    }
};

export const mintNFT = async (contractAddress, tokenURI, walletAddress) => {
    if (!window.ethereum) {
        throw new Error("No wallet found. Please install a wallet extension.");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, [
        // ABI of the mint function
        "function mint(address to, string memory tokenURI) public"
    ], signer);

    try {
        const transaction = await contract.mint(walletAddress, tokenURI);
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error("Error minting NFT:", error);
        throw new Error("NFT minting failed");
    }
};

export const getChainId = async () => {
    if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        return chainId;
    } else {
        throw new Error("No wallet found. Please install a wallet extension.");
    }
};