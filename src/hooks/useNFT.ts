import { useState, useEffect } from 'react';
import { mintNFT, getNFTs } from '../services/nft';

const useNFT = () => {
    const [nfts, setNFTs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNFTs = async () => {
        setLoading(true);
        try {
            const fetchedNFTs = await getNFTs();
            setNFTs(fetchedNFTs);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const mint = async (data) => {
        setLoading(true);
        try {
            await mintNFT(data);
            fetchNFTs(); // Refresh the NFT list after minting
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNFTs();
    }, []);

    return { nfts, loading, error, mint };
};

export default useNFT;