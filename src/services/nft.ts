import { PublicClient, WalletClient } from 'viem';
import { mainnet, sepolia, polygon, hardhat } from 'viem/chains';
import { WEB3_PORTAL_NFT_ABI } from '@/contracts/abi';
import { calculateMintGas, validateGasParameters } from '@/utils/gasCalculation';

// Types
interface NFT {
    id: string;
    tokenId: number;
    name: string;
    description: string;
    image: string;
    owner: string;
    tokenURI: string;
    contractAddress: string;
}

interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

interface ContractInfo {
    currentSupply: bigint;
    maxSupply: bigint;
    currentPrice: bigint;
    isMintingActive: boolean;
    isWhitelistActive: boolean;
    isPaused: boolean;
}

// Contract addresses for different networks
const getContractAddress = (chainId: number): string | null => {
    const addresses: Record<number, string> = {
        31337: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || '',
        11155111: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '',
        80002: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_AMOY || '', // Changed from 80001 to 80002
        1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || '',
        137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || '',
    };
    return addresses[chainId] || null;
};

// Helper function to get chain config by chainId
const getChainConfig = (chainId: number) => {
    const chains = {
        1: mainnet,
        11155111: sepolia,
        137: polygon,
        80002: polygon, // Use polygon config for Amoy (same as mainnet but testnet)
        31337: hardhat,
    };
    return chains[chainId as keyof typeof chains] || hardhat;
};

// Helper function to fetch metadata from IPFS/HTTP
const fetchMetadata = async (tokenURI: string): Promise<NFTMetadata | null> => {
    try {
        // Handle IPFS URLs
        let url = tokenURI;
        if (tokenURI.startsWith('ipfs://')) {
            url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch metadata from ${url}`);
            return null;
        }
        
        const metadata = await response.json();
        return metadata;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return null;
    }
};

/**
 * Mint NFT using the Web3Portal contract (Viem compatible)
 * @param quantity Number of NFTs to mint
 * @param walletClient Viem wallet client
 * @param publicClient Viem public client
 * @param account User's address
 * @param chainId Network chain ID
 * @returns Transaction hash
 */
export const mintNFT = async (
    quantity: number,
    walletClient: WalletClient,
    publicClient: PublicClient,
    account: `0x${string}`,
    chainId: number
): Promise<string> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        // Get current mint price
        const mintPrice = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'mintPrice',
        }) as bigint;

        const totalCost = mintPrice * BigInt(quantity);

        // Calculate optimal gas using unified system
        const gasEstimation = await calculateMintGas(
            publicClient,
            contractAddress,
            account,
            quantity,
            mintPrice
        );

        // Validate gas and balance
        const userBalance = await publicClient.getBalance({ address: account });
        const gasValidation = validateGasParameters(gasEstimation, userBalance, totalCost);
        
        if (!gasValidation.isValid) {
            throw new Error(gasValidation.reason);
        }

        // Get chain config for the write operation
        const chain = getChainConfig(chainId);

        // Call the mint function with calculated gas
        const hash = await walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'mint',
            args: [BigInt(quantity)],
            value: totalCost,
            account,
            chain,
            gas: gasEstimation.gasWithBuffer, // Use calculated gas from unified system
        });

        console.log('Mint transaction sent:', hash);
        
        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Mint transaction confirmed:', receipt.transactionHash);
        console.log('Gas used:', receipt.gasUsed.toString());
        console.log('Gas estimated:', gasEstimation.gasWithBuffer.toString());
        
        return receipt.transactionHash;
    } catch (error: any) {
        console.error('Minting failed:', error);
        
        // Handle specific contract errors
        if (error.cause?.reason) {
            throw new Error(`Minting failed: ${error.cause.reason}`);
        } else if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
            throw new Error('Transaction rejected by user');
        } else if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient funds for minting');
        } else {
            throw new Error('Minting failed. Please try again.');
        }
    }
};

/**
 * Fetch all NFTs owned by a specific address
 * @param walletAddress Owner's wallet address
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Array of NFT objects
 */
export const getNFTs = async (
    walletAddress: string,
    publicClient: PublicClient,
    chainId: number
): Promise<NFT[]> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        // Get all token IDs owned by the address
        const tokenIds = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'tokensOfOwner',
            args: [walletAddress as `0x${string}`],
        }) as readonly bigint[];
        
        if (!tokenIds || tokenIds.length === 0) {
            return [];
        }

        // Fetch metadata for each token
        const nfts: NFT[] = [];
        
        for (const tokenId of tokenIds) {
            try {
                const tokenURI = await publicClient.readContract({
                    address: contractAddress as `0x${string}`,
                    abi: WEB3_PORTAL_NFT_ABI,
                    functionName: 'tokenURI',
                    args: [tokenId],
                }) as string;

                const metadata = await fetchMetadata(tokenURI);
                
                const nft: NFT = {
                    id: `${contractAddress}-${tokenId}`,
                    tokenId: Number(tokenId),
                    name: metadata?.name || `Web3Portal NFT #${tokenId}`,
                    description: metadata?.description || 'A unique Web3Portal NFT',
                    image: metadata?.image || '',
                    owner: walletAddress,
                    tokenURI,
                    contractAddress,
                };
                
                nfts.push(nft);
            } catch (tokenError) {
                console.error(`Error fetching token ${tokenId}:`, tokenError);
                // Add token with minimal data if metadata fetch fails
                nfts.push({
                    id: `${contractAddress}-${tokenId}`,
                    tokenId: Number(tokenId),
                    name: `Web3Portal NFT #${tokenId}`,
                    description: 'Metadata temporarily unavailable',
                    image: '',
                    owner: walletAddress,
                    tokenURI: '',
                    contractAddress,
                });
            }
        }

        return nfts;
    } catch (error: any) {
        console.error('Error fetching NFTs:', error);
        throw new Error('Failed to fetch NFTs. Please try again.');
    }
};

/**
 * Get contract information
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Contract information
 */
export const getContractInfo = async (
    publicClient: PublicClient,
    chainId: number
): Promise<ContractInfo> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        const info = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'getContractInfo',
        }) as readonly [bigint, bigint, bigint, boolean, boolean, boolean];
        
        return {
            currentSupply: info[0],
            maxSupply: info[1],
            currentPrice: info[2],
            isMintingActive: info[3],
            isWhitelistActive: info[4],
            isPaused: info[5],
        };
    } catch (error: any) {
        console.error('Error fetching contract info:', error);
        throw new Error('Failed to fetch contract information');
    }
};

/**
 * Check if an address is whitelisted
 * @param address Address to check
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Whether the address is whitelisted
 */
export const isWhitelisted = async (
    address: string,
    publicClient: PublicClient,
    chainId: number
): Promise<boolean> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        const result = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'isWhitelisted',
            args: [address as `0x${string}`],
        }) as boolean;

        return result;
    } catch (error: any) {
        console.error('Error checking whitelist status:', error);
        return false;
    }
};

/**
 * Get the current mint price
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Mint price in wei
 */
export const getMintPrice = async (
    publicClient: PublicClient,
    chainId: number
): Promise<bigint> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        const price = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'mintPrice',
        }) as bigint;

        return price;
    } catch (error: any) {
        console.error('Error fetching mint price:', error);
        throw new Error('Failed to fetch mint price');
    }
};

/**
 * Get the total supply of minted NFTs
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Total supply
 */
export const getTotalSupply = async (
    publicClient: PublicClient,
    chainId: number
): Promise<number> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        const supply = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'totalSupply',
        }) as bigint;

        return Number(supply);
    } catch (error: any) {
        console.error('Error fetching total supply:', error);
        throw new Error('Failed to fetch total supply');
    }
};

/**
 * Get the balance of NFTs for a specific address
 * @param address Owner's address
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Number of NFTs owned
 */
export const getBalance = async (
    address: string,
    publicClient: PublicClient,
    chainId: number
): Promise<number> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        const balance = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
        }) as bigint;

        return Number(balance);
    } catch (error: any) {
        console.error('Error fetching balance:', error);
        throw new Error('Failed to fetch NFT balance');
    }
};

/**
 * Get NFT by token ID
 * @param tokenId Token ID to fetch
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns NFT object or null if not found
 */
export const getNFTById = async (
    tokenId: number,
    publicClient: PublicClient,
    chainId: number
): Promise<NFT | null> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        // Check if token exists and get owner
        const owner = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
        }) as `0x${string}`;

        const tokenURI = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
        }) as string;

        const metadata = await fetchMetadata(tokenURI);
        
        return {
            id: `${contractAddress}-${tokenId}`,
            tokenId,
            name: metadata?.name || `Web3Portal NFT #${tokenId}`,
            description: metadata?.description || 'A unique Web3Portal NFT',
            image: metadata?.image || '',
            owner,
            tokenURI,
            contractAddress,
        };
    } catch (error: any) {
        if (error.message?.includes('ERC721: invalid token ID') || 
            error.message?.includes('ERC721NonexistentToken')) {
            return null;
        }
        console.error('Error fetching NFT by ID:', error);
        throw new Error('Failed to fetch NFT');
    }
};

/**
 * Get collection statistics
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Collection stats
 */
export const getCollectionStats = async (
    publicClient: PublicClient,
    chainId: number
): Promise<{
    totalSupply: number;
    maxSupply: number;
    mintPrice: string;
    mintedPercentage: number;
}> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    try {
        const [contractInfo, totalSupply] = await Promise.all([
            getContractInfo(publicClient, chainId),
            getTotalSupply(publicClient, chainId),
        ]);

        const maxSupply = Number(contractInfo.maxSupply);
        const mintedPercentage = maxSupply > 0 ? (totalSupply / maxSupply) * 100 : 0;

        return {
            totalSupply,
            maxSupply,
            mintPrice: (Number(contractInfo.currentPrice) / 1e18).toFixed(4), // Convert wei to ETH
            mintedPercentage,
        };
    } catch (error: any) {
        console.error('Error fetching collection stats:', error);
        throw new Error('Failed to fetch collection statistics');
    }
};

/**
 * Batch fetch NFT metadata for multiple token IDs
 * @param tokenIds Array of token IDs
 * @param publicClient Viem public client
 * @param chainId Network chain ID
 * @returns Array of NFT objects
 */
export const batchGetNFTs = async (
    tokenIds: number[],
    publicClient: PublicClient,
    chainId: number
): Promise<NFT[]> => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
    }

    const nfts: NFT[] = [];
    
    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < tokenIds.length; i += batchSize) {
        const batch = tokenIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (tokenId) => {
            try {
                return await getNFTById(tokenId, publicClient, chainId);
            } catch (error) {
                console.error(`Error fetching NFT ${tokenId}:`, error);
                return null;
            }
        });

        const batchResults = await Promise.all(batchPromises);
        
        // Filter out null results and add to main array
        batchResults.forEach(nft => {
            if (nft) nfts.push(nft);
        });

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < tokenIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return nfts;
};

// Export types for use in other parts of the application
export type { NFT, NFTMetadata, ContractInfo };