'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Palette, Loader2, CheckCircle, AlertCircle, Wallet, X } from 'lucide-react';
import { useWalletError } from '@/hooks/useWalletError';

export function MintNFT() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { error: globalError, clearError } = useWalletError();
  const [mintAmount, setMintAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMint = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate minting process (replace with actual contract interaction)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success
      setMintSuccess(true);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setMintSuccess(false);
        setMintAmount(1);
      }, 5000);
      
    } catch (error) {
      console.error('Minting failed:', error);
      setError('Minting failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <Wallet className="w-16 h-16 text-web3-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Choose from our supported wallets to mint NFTs. We support MetaMask, Rainbow, Coinbase, and many more!
          </p>
          
          <div className="mb-6">
            <ConnectButton />
          </div>

          {/* Show global wallet errors but not chrome extension errors */}
          {globalError && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm">{globalError}</p>
                </div>
                <button onClick={clearError} className="text-yellow-400 hover:text-yellow-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {connectError && !connectError.message.includes('chrome.runtime') && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{connectError.message}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Popular Wallets</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• MetaMask</li>
                <li>• Rainbow Wallet</li>
                <li>• Coinbase Wallet</li>
                <li>• WalletConnect</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">New to Web3?</h4>
              <p className="text-sm text-gray-400 mb-2">
                Get started with a wallet:
              </p>
              <div className="space-y-1">
                <a 
                  href="https://metamask.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-web3-accent hover:underline text-sm"
                >
                  Download MetaMask
                </a>
                <a 
                  href="https://rainbow.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-web3-secondary hover:underline text-sm"
                >
                  Download Rainbow
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <Palette className="w-16 h-16 text-web3-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Mint Your NFT</h2>
          <p className="text-gray-400">
            Create unique digital collectibles on the blockchain
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Number of NFTs to mint
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMintAmount(Math.max(1, mintAmount - 1))}
                className="w-10 h-10 rounded-lg bg-web3-primary/20 text-web3-primary hover:bg-web3-primary hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
                disabled={mintAmount <= 1 || isLoading}
              >
                -
              </button>
              <input
                id="amount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-web3-primary focus:border-transparent"
                min="1"
                max="10"
                disabled={isLoading}
              />
              <button
                onClick={() => setMintAmount(Math.min(10, mintAmount + 1))}
                className="w-10 h-10 rounded-lg bg-web3-primary/20 text-web3-primary hover:bg-web3-primary hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
                disabled={mintAmount >= 10 || isLoading}
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Price: {0.01 * mintAmount} ETH (0.01 ETH per NFT)
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">NFT Collection Details</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Unique generative art pieces</li>
              <li>• Stored on IPFS for permanence</li>
              <li>• ERC-721 standard compliant</li>
              <li>• Limited collection of 10,000</li>
              <li>• Royalties support creator</li>
            </ul>
          </div>

          {mintSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-500 mb-2">Minting Successful!</h3>
              <p className="text-gray-400 mb-4">
                Your NFT{mintAmount > 1 ? 's have' : ' has'} been minted successfully.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  🎉 {mintAmount} NFT{mintAmount > 1 ? 's' : ''} added to your collection!
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleMint}
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Minting in progress...</span>
                </>
              ) : (
                <>
                  <Palette className="w-5 h-5" />
                  <span>Mint {mintAmount} NFT{mintAmount > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Connected Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-xs text-gray-500">
              Network: Ethereum Mainnet
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">Demo Mode</p>
                <p className="text-blue-300 text-xs">
                  This is a demonstration. No real transactions will occur. 
                  In production, this would interact with your smart contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}