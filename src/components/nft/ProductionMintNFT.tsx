'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Palette, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Wallet, 
  ExternalLink, 
  Copy, 
  Image as ImageIcon,
  TrendingUp,
  Users,
  Clock,
  Zap,
  RefreshCw,
  Shield,
  AlertTriangle,
  Activity,
  Award,
  Globe,
  Lock
} from 'lucide-react';
import { useWeb3PortalNFT } from '@/hooks/contracts/useWeb3PortalNFT';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductionMintNFT Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-6xl mx-auto">
          <div className="card text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Component Error</h2>
            <p className="text-gray-400 mb-6">
              There was an issue loading the minting interface. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProductionMintNFTContent() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const {
    contractAddress,
    contractInfo,
    mintPrice,
    userTokens,
    userBalance,
    isWhitelisted,
    remainingSupply,
    isLoading,
    error,
    mint,
    canMint,
    getMintButtonText,
    getMintProgress,
    isMintPending,
    isMintSuccess,
    mintError,
    mintData,
    refetchContractInfo,
    resetMint,
  } = useWeb3PortalNFT();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset success state after showing it
  useEffect(() => {
    if (isMintSuccess && mintData) {
      setTimeout(() => {
        resetMint();
      }, 5000);
    }
  }, [isMintSuccess, mintData, resetMint]);

  const handleMint = async () => {
    if (!canMint) {
      toast.error('Minting is not available right now');
      return;
    }
    
    if (selectedQuantity < 1 || selectedQuantity > 10) {
      toast.error('Quantity must be between 1 and 10');
      return;
    }

    try {
      await mint({ quantity: selectedQuantity });
    } catch (error: any) {
      console.error('Mint error:', error);
    }
  };

  const handleRefresh = () => {
    refetchContractInfo();
    toast.success('Contract info refreshed');
  };

  const copyContractAddress = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      toast.success('Contract address copied to clipboard');
    }
  };

  const openContractInfo = () => {
    if (contractAddress) {
      toast('Contract deployed on localhost network', {
        icon: 'ℹ️',
        style: {
          background: '#1f2937',
          color: '#60a5fa',
          border: '1px solid #3b82f6',
        },
      });
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto">
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-web3-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Loading Contract...</h2>
          <p className="text-gray-400">Please wait while we load the contract information.</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Contract Error</h2>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Show connection prompt
  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-12">
          <Wallet className="w-16 h-16 text-web3-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet to start minting Web3Portal NFTs
          </p>
          <ConnectButton />
          
          {/* Information cards while not connected */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card bg-gray-800/30">
              <ImageIcon className="w-8 h-8 text-web3-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Unique Digital Art</h3>
              <p className="text-sm text-gray-400">
                Each NFT features unique generative artwork stored permanently on IPFS
              </p>
            </div>
            <div className="card bg-gray-800/30">
              <Shield className="w-8 h-8 text-web3-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Limited Collection</h3>
              <p className="text-sm text-gray-400">
                Only 10,000 NFTs will ever be minted. Secure your spot in the collection
              </p>
            </div>
            <div className="card bg-gray-800/30">
              <Award className="w-8 h-8 text-web3-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exclusive Benefits</h3>
              <p className="text-sm text-gray-400">
                NFT holders get access to exclusive features and community governance
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (isMintSuccess && mintData) {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-green-500 mb-4">Mint Successful!</h2>
          <p className="text-gray-400 mb-6 text-lg">
            Successfully minted {mintData.tokenIds.length} NFT{mintData.tokenIds.length > 1 ? 's' : ''}
          </p>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-green-400 font-semibold mb-2">New Token IDs:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {mintData.tokenIds.map(tokenId => (
                <span key={tokenId} className="px-3 py-1 bg-green-500/20 rounded-full text-green-300 font-mono text-sm">
                  #{tokenId}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigator.clipboard.writeText(mintData.hash)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Transaction Hash</span>
            </button>
            <button
              onClick={() => resetMint()}
              className="btn-primary flex items-center space-x-2"
            >
              <Palette className="w-4 h-4" />
              <span>Mint More NFTs</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Toaster position="top-right" />
      
      {/* Main Mint Panel */}
      <div className="lg:col-span-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Palette className="w-8 h-8 text-web3-primary" />
              <div>
                <h2 className="text-2xl font-bold">Mint Web3Portal NFT</h2>
                <p className="text-gray-400">Join the exclusive community</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              title="Refresh contract info"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Contract Status Warning */}
          {contractInfo && !contractInfo.isMintingActive && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Minting Not Active</p>
                  <p className="text-gray-400 text-sm mt-1">
                    The contract owner needs to enable minting before NFTs can be minted.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mint Progress */}
          {contractInfo && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-300">Collection Progress</span>
                <span className="text-sm text-web3-primary font-bold">
                  {Number(contractInfo.currentSupply)} / {Number(contractInfo.maxSupply)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-web3-primary to-web3-secondary h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getMintProgress()}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {getMintProgress().toFixed(1)}% minted
              </p>
            </div>
          )}

          {/* Statistics Grid */}
          {contractInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="stat-card">
                <TrendingUp className="w-6 h-6 text-web3-primary mb-2" />
                <div className="text-xl font-bold">{mintPrice}</div>
                <div className="text-sm text-gray-400">ETH per NFT</div>
              </div>
              
              <div className="stat-card">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-xl font-bold">{remainingSupply}</div>
                <div className="text-sm text-gray-400">Remaining</div>
              </div>
              
              <div className="stat-card">
                <Activity className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-xl font-bold">{userBalance}</div>
                <div className="text-sm text-gray-400">Your NFTs</div>
              </div>
              
              <div className="stat-card">
                <Clock className="w-6 h-6 text-purple-400 mb-2" />
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    contractInfo.isMintingActive && !contractInfo.isPaused 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`} />
                  <div className="text-sm font-bold">
                    {contractInfo.isMintingActive && !contractInfo.isPaused ? 'Live' : 'Offline'}
                  </div>
                </div>
                <div className="text-sm text-gray-400">Status</div>
              </div>
            </div>
          )}

          {/* Whitelist Status */}
          {contractInfo?.isWhitelistActive && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-4 mb-6 border ${
                  isWhitelisted 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-yellow-500/10 border-yellow-500/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {isWhitelisted ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">Whitelisted Access</p>
                        <p className="text-green-300 text-sm">You can mint during the whitelist phase</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-yellow-400 font-medium">Whitelist Phase Active</p>
                        <p className="text-yellow-300 text-sm">Public minting will begin after whitelist phase</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Quantity to mint 
              <span className="text-gray-500 ml-2">(Maximum 10 per transaction)</span>
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                className="w-12 h-12 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-web3-primary flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={selectedQuantity <= 1 || isMintPending}
              >
                -
              </button>
              
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full text-center bg-gray-800 border border-gray-600 rounded-lg py-3 text-white font-bold text-lg focus:ring-2 focus:ring-web3-primary focus:border-transparent"
                  disabled={isMintPending}
                />
              </div>
              
              <button
                onClick={() => setSelectedQuantity(Math.min(10, selectedQuantity + 1))}
                className="w-12 h-12 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-web3-primary flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={selectedQuantity >= 10 || isMintPending}
              >
                +
              </button>
            </div>
            
            <div className="text-center mt-3">
              <p className="text-lg">
                Total: <span className="text-web3-primary font-bold">
                  {(parseFloat(mintPrice) * selectedQuantity).toFixed(4)} ETH
                </span>
              </p>
              <p className="text-sm text-gray-400">
                Approximately ${((parseFloat(mintPrice) * selectedQuantity) * 2000).toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Mint Button */}
          <motion.button
            whileHover={{ scale: canMint ? 1.02 : 1 }}
            whileTap={{ scale: canMint ? 0.98 : 1 }}
            onClick={handleMint}
            disabled={!canMint || isMintPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-4 text-lg font-bold"
          >
            {isMintPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Processing Transaction...</span>
              </>
            ) : (
              <>
                <Palette className="w-6 h-6" />
                <span>{getMintButtonText(selectedQuantity)}</span>
              </>
            )}
          </motion.button>

          {/* Error Display */}
          <AnimatePresence>
            {mintError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Transaction Failed</p>
                    <p className="text-red-300 text-sm mt-1">{mintError.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction Pending State */}
          <AnimatePresence>
            {isMintPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <div>
                    <p className="text-blue-400 font-medium">Transaction in Progress</p>
                    <p className="text-gray-400 text-sm">
                      Please wait while your NFT is being minted. Do not close this page.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Wallet Information */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-bold mb-4">Wallet Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-400">NFTs Owned</span>
              <span className="text-sm font-bold text-web3-primary">{userBalance}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-400">Your Address</span>
              <span className="text-xs font-mono text-white">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-400">Network</span>
              <span className="text-sm text-web3-primary">Localhost</span>
            </div>
            
            {contractInfo?.isWhitelistActive && (
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-400">Whitelist Status</span>
                <span className={`text-sm font-bold ${isWhitelisted ? 'text-green-400' : 'text-red-400'}`}>
                  {isWhitelisted ? 'Approved' : 'Not Listed'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contract Information */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <h3 className="text-lg font-bold mb-4">Contract Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-400">Contract Address</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-white">
                  {contractAddress ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` : 'Loading...'}
                </span>
                {contractAddress && (
                  <>
                    <button
                      onClick={copyContractAddress}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy contract address"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={openContractInfo}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="View contract information"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {contractInfo && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Total Supply</span>
                  <span className="text-sm font-bold">{Number(contractInfo.maxSupply)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Minted</span>
                  <span className="text-sm font-bold">{Number(contractInfo.currentSupply)}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Your NFTs Preview */}
        {userTokens && userTokens.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-bold mb-4">Your Collection ({userTokens.length})</h3>
            <div className="grid grid-cols-3 gap-2">
              {userTokens.slice(0, 9).map((tokenId) => (
                <div key={tokenId} className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 hover:border-web3-primary transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 font-mono">#{tokenId}</p>
                  </div>
                </div>
              ))}
              {userTokens.length > 9 && (
                <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700">
                  <p className="text-xs text-gray-400">+{userTokens.length - 9}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Collection Features */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <h3 className="text-lg font-bold mb-4">Collection Features</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300">ERC-721 standard compliant</span>
            </li>
            <li className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-gray-300">Metadata stored on IPFS</span>
            </li>
            <li className="flex items-center space-x-3">
              <Palette className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-gray-300">Unique generative artwork</span>
            </li>
            <li className="flex items-center space-x-3">
              <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-gray-300">Limited supply guarantee</span>
            </li>
            <li className="flex items-center space-x-3">
              <Award className="w-4 h-4 text-web3-accent flex-shrink-0" />
              <span className="text-gray-300">Community governance rights</span>
            </li>
            <li className="flex items-center space-x-3">
              <Zap className="w-4 h-4 text-web3-secondary flex-shrink-0" />
              <span className="text-gray-300">Future utility and rewards</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export function ProductionMintNFT() {
  return (
    <ErrorBoundary>
      <ProductionMintNFTContent />
    </ErrorBoundary>
  );
}