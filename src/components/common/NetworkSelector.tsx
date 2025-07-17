import React, { useState, useEffect } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { getContractAddress, getSupportedNetworks } from '../../contracts/addresses';
import { chains } from '../../utils/chains';

interface NetworkSelectorProps {
  onNetworkChange?: (chainId: number) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ onNetworkChange }) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork();
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);

  const supportedNetworks = getSupportedNetworks();

  useEffect(() => {
    if (chain) {
      setSelectedNetwork(chain.id);
    }
  }, [chain]);

  const handleNetworkChange = (chainId: number) => {
    if (switchNetwork) {
      switchNetwork(chainId);
    }
    setSelectedNetwork(chainId);
    if (onNetworkChange) {
      onNetworkChange(chainId);
    }
  };

  const getNetworkInfo = (chainId: number) => {
    const chainKey = Object.keys(chains).find(key => chains[key].chainId === chainId);
    return chainKey ? chains[chainKey] : null;
  };

  const getContractStatus = (chainId: number) => {
    const address = getContractAddress(chainId);
    return address ? '✅ Deployed' : '❌ Not deployed';
  };

  const getNetworkIcon = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return '🔧'; // Hardhat local
      case 11155111:
        return '🔷'; // Sepolia
      case 80002:
        return '🟣'; // Polygon Amoy
      case 137:
        return '🔵'; // Polygon
      default:
        return '🌐';
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-yellow-600 mr-2">⚠️</div>
          <p className="text-yellow-800">Connect your wallet to see network options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🌐</span>
        Network Selector
      </h3>
      
      <div className="space-y-3">
        {supportedNetworks.map((chainId: number) => {
          const networkInfo = getNetworkInfo(chainId);
          const isCurrentNetwork = chain?.id === chainId;
          const contractStatus = getContractStatus(chainId);
          
          if (!networkInfo) return null;
          
          return (
            <div
              key={chainId}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                isCurrentNetwork
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleNetworkChange(chainId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getNetworkIcon(chainId)}</span>
                  <div>
                    <div className="font-medium">{networkInfo.name}</div>
                    <div className="text-sm text-gray-600">
                      Chain ID: {chainId}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-sm mb-1">
                    {contractStatus}
                  </div>
                  {isCurrentNetwork && (
                    <div className="text-xs text-blue-600 font-medium">
                      Current
                    </div>
                  )}
                </div>
              </div>
              
              {networkInfo.isTestnet && (
                <div className="mt-2 text-xs text-gray-500">
                  🧪 Testnet - {networkInfo.faucetUrl && (
                    <a 
                      href={networkInfo.faucetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Get test tokens
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {isSwitching && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Switching network...</span>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <div>💡 Tips:</div>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Use localhost for development</li>
          <li>Test on Sepolia or Amoy before mainnet</li>
          <li>Make sure you have the right tokens for each network</li>
        </ul>
      </div>
    </div>
  );
};

export default NetworkSelector;
