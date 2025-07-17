import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useNetwork } from 'wagmi';
import useNFT from '../../hooks/useNFT';

const NFTGallery: React.FC = () => {
    const { nfts, contractInfo, loading, error, refetch } = useNFT();
    const { chain } = useNetwork();

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-web3-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your NFT collection...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="card text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading NFTs</h2>
                    <p className="text-gray-400 mb-6">{error.message}</p>
                    <button 
                        onClick={refetch}
                        className="btn-primary flex items-center space-x-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        );
    }

    if (nfts.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="card text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No NFTs Found</h2>
                    <p className="text-gray-400 mb-6">
                        You don't have any Web3Portal NFTs in your collection yet. Start by minting your first NFT!
                    </p>
                    <a href="/mint" className="btn-primary inline-flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Mint Your First NFT</span>
                    </a>
                </div>
            </div>
        );
    }

    const getExplorerUrl = (tokenId: number) => {
        if (!chain) return '#';
        
        const baseUrls: Record<number, string> = {
            1: 'https://etherscan.io',
            11155111: 'https://sepolia.etherscan.io',
            80002: 'https://amoy.polygonscan.com',
            137: 'https://polygonscan.com',
            31337: '#', // localhost - no explorer
        };
        
        const baseUrl = baseUrls[chain.id];
        if (!baseUrl || baseUrl === '#') return '#';
        
        return `${baseUrl}/token/${nfts[0]?.contractAddress}?a=${tokenId}`;
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Your <span className="gradient-text">NFT Gallery</span>
                </h1>
                <p className="text-gray-400">
                    Explore your collection of unique Web3Portal digital assets
                </p>
                
                {/* Collection Stats */}
                {contractInfo && (
                    <div className="flex items-center space-x-6 mt-4 text-sm">
                        <div>
                            <span className="text-gray-400">Your NFTs: </span>
                            <span className="font-bold text-web3-primary">{nfts.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Total Supply: </span>
                            <span className="font-bold">{Number(contractInfo.currentSupply)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Collection Size: </span>
                            <span className="font-bold">{Number(contractInfo.maxSupply)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {nfts.map((nft, index) => (
                    <motion.div
                        key={nft.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="card overflow-hidden hover:border-web3-primary/50 transition-all duration-300 group"
                    >
                        {/* NFT Image */}
                        <div className="aspect-square bg-gray-800 rounded-lg mb-4 overflow-hidden relative">
                            {nft.image ? (
                                <img 
                                    src={nft.image} 
                                    alt={nft.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`${nft.image ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            
                            {/* Token ID Badge */}
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
                                <span className="text-xs text-white font-mono">#{nft.tokenId}</span>
                            </div>
                        </div>
                        
                        {/* NFT Info */}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2 truncate">
                                {nft.name}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                {nft.description || 'No description available'}
                            </p>
                            
                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    Token #{nft.tokenId}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getExplorerUrl(nft.tokenId) !== '#' && (
                                        <a
                                            href={getExplorerUrl(nft.tokenId)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-web3-primary hover:text-web3-secondary text-sm font-medium flex items-center space-x-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Explorer</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 text-center">
                <p className="text-gray-400 mb-4">
                    Showing {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} in your collection
                </p>
                <div className="flex items-center justify-center space-x-4">
                    <button 
                        onClick={refetch}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Collection</span>
                    </button>
                    <a 
                        href="/mint"
                        className="btn-primary flex items-center space-x-2"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Mint More NFTs</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NFTGallery;