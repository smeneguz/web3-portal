import React from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { ChevronDown, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { getChainById, isChainSupported, chains } from '@/utils/chains';
import { isContractDeployed, getContractAddress } from '@/contracts/addresses';

interface NetworkInfo {
  chainId: number;
  name: string;
  currency: string;
  isTestnet: boolean;
  hasContract: boolean;
  isSupported: boolean;
}

export const NetworkSelector: React.FC = () => {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork();
  const [isOpen, setIsOpen] = React.useState(false);

  // Get all available networks with contract info
  const availableNetworks: NetworkInfo[] = React.useMemo(() => {
    return Object.values(chains).map(chainConfig => ({
      chainId: chainConfig.chainId,
      name: chainConfig.name,
      currency: chainConfig.currency.symbol,
      isTestnet: chainConfig.isTestnet,
      hasContract: isContractDeployed(chainConfig.chainId),
      isSupported: isChainSupported(chainConfig.chainId),
    }));
  }, []);

  // Sort networks: with contracts first, then by testnet status
  const sortedNetworks = React.useMemo(() => {
    return [...availableNetworks].sort((a, b) => {
      // Contracts first
      if (a.hasContract && !b.hasContract) return -1;
      if (!a.hasContract && b.hasContract) return 1;
      
      // Then testnets first (for development)
      if (a.isTestnet && !b.isTestnet) return -1;
      if (!a.isTestnet && b.isTestnet) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [availableNetworks]);

  const currentNetwork = chain ? availableNetworks.find(n => n.chainId === chain.id) : null;
  const isCurrentNetworkSupported = currentNetwork?.isSupported ?? false;
  const hasContractOnCurrentNetwork = currentNetwork?.hasContract ?? false;

  const getNetworkStatus = (network: NetworkInfo) => {
    if (!network.hasContract) return 'no-contract';
    if (!network.isSupported) return 'unsupported';
    return 'supported';
  };

  const getStatusIcon = (network: NetworkInfo) => {
    const status = getNetworkStatus(network);
    switch (status) {
      case 'supported':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'no-contract':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'unsupported':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (network: NetworkInfo) => {
    const status = getNetworkStatus(network);
    switch (status) {
      case 'supported':
        return 'border-green-500 bg-green-50';
      case 'no-contract':
        return 'border-gray-300 bg-gray-50';
      case 'unsupported':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const handleNetworkSwitch = async (chainId: number) => {
    if (!switchNetwork) return;
    
    try {
      await switchNetwork(chainId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative">
      {/* Current Network Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all
          ${isCurrentNetworkSupported && hasContractOnCurrentNetwork
            ? 'border-green-500 bg-green-50 text-green-700'
            : !hasContractOnCurrentNetwork
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-yellow-500 bg-yellow-50 text-yellow-700'
          }
          ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
        `}
        disabled={isSwitching}
      >
        {getStatusIcon(currentNetwork || { hasContract: false, isSupported: false } as NetworkInfo)}
        <span className="font-medium">
          {currentNetwork?.name || 'Unknown Network'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Network Status Messages */}
      {!hasContractOnCurrentNetwork && (
        <div className="absolute top-full mt-2 left-0 right-0 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ No contract deployed on this network
        </div>
      )}

      {/* Network Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Select Network</h3>
            <p className="text-sm text-gray-600">Choose a network with deployed contract</p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {sortedNetworks.map((network) => {
              const isActive = currentNetwork?.chainId === network.chainId;
              const contractAddress = getContractAddress(network.chainId);
              
              return (
                <button
                  key={network.chainId}
                  onClick={() => handleNetworkSwitch(network.chainId)}
                  disabled={!network.hasContract || isSwitching}
                  className={`
                    w-full p-4 text-left border-l-4 transition-all
                    ${isActive ? 'bg-blue-50 border-l-blue-500' : getStatusColor(network)}
                    ${network.hasContract && !isSwitching
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(network)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {network.name}
                          {network.isTestnet && (
                            <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                              Testnet
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Currency: {network.currency}
                        </div>
                        {contractAddress && (
                          <div className="text-xs text-gray-500 font-mono">
                            Contract: {contractAddress.slice(0, 10)}...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {isActive && (
                        <span className="text-xs text-blue-600 font-medium">Current</span>
                      )}
                      {!network.hasContract && (
                        <span className="text-xs text-gray-500">No Contract</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Wifi className="w-3 h-3 text-green-500" />
                <span>Contract Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <WifiOff className="w-3 h-3 text-gray-400" />
                <span>No Contract</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NetworkSelector;