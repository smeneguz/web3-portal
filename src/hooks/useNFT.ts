import { useState, useEffect } from 'react';
import { usePublicClient, useAccount, useNetwork } from 'wagmi';
import { 
    getNFTs, 
    getContractInfo, 
    getCollectionStats,
    batchGetNFTs,
    type NFT, 
    type ContractInfo 
} from '../services/nft';

interface UseNFTReturn {
    nfts: NFT[];
    contractInfo: ContractInfo | null;
    collectionStats: {
        totalSupply: number;
        maxSupply: number;
        mintPrice: string;
        mintedPercentage: number;
    } | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    fetchNFTs: () => Promise<void>;
    fetchContractInfo: () => Promise<void>;
    fetchCollectionStats: () => Promise<void>;
}

const useNFT = (): UseNFTReturn => {
    const [nfts, setNFTs] = useState<NFT[]>([]);
    const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
    const [collectionStats, setCollectionStats] = useState<{
        totalSupply: number;
        maxSupply: number;
        mintPrice: string;
        mintedPercentage: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const { address } = useAccount();
    const { chain } = useNetwork();
    const publicClient = usePublicClient();

    const fetchNFTs = async () => {
        if (!address || !publicClient || !chain?.id) {
            setNFTs([]);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const fetchedNFTs = await getNFTs(address, publicClient, chain.id);
            setNFTs(fetchedNFTs);
        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else {
                setError(new Error('Failed to fetch NFTs'));
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchContractInfo = async () => {
        if (!publicClient || !chain?.id) return;

        try {
            const info = await getContractInfo(publicClient, chain.id);
            setContractInfo(info);
        } catch (err) {
            console.error('Failed to fetch contract info:', err);
        }
    };

    const fetchCollectionStats = async () => {
        if (!publicClient || !chain?.id) return;

        try {
            const stats = await getCollectionStats(publicClient, chain.id);
            setCollectionStats(stats);
        } catch (err) {
            console.error('Failed to fetch collection stats:', err);
        }
    };

    const refetch = async () => {
        await Promise.all([
            fetchNFTs(), 
            fetchContractInfo(), 
            fetchCollectionStats()
        ]);
    };

    useEffect(() => {
        fetchNFTs();
    }, [address, publicClient, chain?.id]);

    useEffect(() => {
        if (publicClient && chain?.id) {
            fetchContractInfo();
            fetchCollectionStats();
        }
    }, [publicClient, chain?.id]);

    return { 
        nfts, 
        contractInfo,
        collectionStats,
        loading, 
        error, 
        refetch,
        fetchNFTs,
        fetchContractInfo,
        fetchCollectionStats
    };
};

export default useNFT;