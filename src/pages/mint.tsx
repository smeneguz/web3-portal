import { ProductionMintNFT } from '@/components/nft/ProductionMintNFT';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Shield, Globe } from 'lucide-react';

export default function MintPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Web3Portal NFTs</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join the exclusive Web3Portal community by minting unique NFTs. 
            Each token represents membership in our decentralized ecosystem.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            >
              <Sparkles className="w-8 h-8 text-web3-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Unique Artwork</h3>
              <p className="text-sm text-gray-400">
                Each NFT features generative art stored permanently on IPFS
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            >
              <Shield className="w-8 h-8 text-web3-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exclusive Access</h3>
              <p className="text-sm text-gray-400">
                Holders get governance rights and early access to features
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            >
              <Globe className="w-8 h-8 text-web3-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Cross-Chain Ready</h3>
              <p className="text-sm text-gray-400">
                Built for multi-chain compatibility and future expansion
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Production Minting Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ProductionMintNFT />
        </motion.div>

        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Palette className="w-6 h-6 text-web3-primary mr-2" />
                Collection Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Supply:</span>
                  <span className="font-semibold">10,000 NFTs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mint Price:</span>
                  <span className="font-semibold text-web3-primary">0.01 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Standard:</span>
                  <span className="font-semibold">ERC-721</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Metadata:</span>
                  <span className="font-semibold">IPFS Stored</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Shield className="w-6 h-6 text-web3-secondary mr-2" />
                Holder Benefits
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-web3-primary rounded-full mr-3"></div>
                  Governance voting rights
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-web3-secondary rounded-full mr-3"></div>
                  Early access to new features
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-web3-accent rounded-full mr-3"></div>
                  Exclusive community Discord access
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-web3-primary rounded-full mr-3"></div>
                  Future airdrops and rewards
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-web3-secondary rounded-full mr-3"></div>
                  Commercial usage rights
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}