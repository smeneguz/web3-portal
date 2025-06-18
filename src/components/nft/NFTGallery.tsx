import React from 'react';
import { useNFT } from '../../hooks/useNFT';

const NFTGallery: React.FC = () => {
    const { nfts, loading, error } = useNFT();

    if (loading) {
        return <div>Loading NFTs...</div>;
    }

    if (error) {
        return <div>Error loading NFTs: {error.message}</div>;
    }

    return (
        <div className="nft-gallery">
            <h2>Your NFT Gallery</h2>
            <div className="nft-grid">
                {nfts.map((nft) => (
                    <div key={nft.id} className="nft-card">
                        <img src={nft.image} alt={nft.name} />
                        <h3>{nft.name}</h3>
                        <p>{nft.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NFTGallery;