import { MintNFT } from '@/components/nft/MintNFT';

export default function MintPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">NFT Minting</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create and own unique digital assets on the blockchain
          </p>
        </div>
        <MintNFT />
      </div>
    </div>
  );
}