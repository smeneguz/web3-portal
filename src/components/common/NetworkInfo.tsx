import React from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { getContractAddress } from '../../contracts/addresses';
import { chains } from '../../utils/chains';

interface NetworkInfoProps {
  showContractAddress?: boolean;
  showExplorerLink?: boolean;
  compact?: boolean;
}

const NetworkInfo: React.FC<NetworkInfoProps> = ({
  showContractAddress = true,
  showExplorerLink = true,
  compact = false
}) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  if (!isConnected || !chain) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-gray-600 text-sm">
          🔌 Not connected to any network
        </div>
      </div>
    );
  }

  const networkInfo = Object.values(chains).find(c => c.chainId === chain.id);
  const contractAddress = getContractAddress(chain.id);

  const getNetworkIcon = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return '🔧';
      case 11155111:
        return '🔷';
      case 80002:
        return '🟣';
      case 137:
        return '🔵';
      default:
        return '🌐';
    }
  };

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return 'bg-gray-50 border-gray-200';
      case 11155111:
        return 'bg-blue-50 border-blue-200';
      case 80002:
        return 'bg-purple-50 border-purple-200';
      case 137:
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getNetworkColor(chain.id)}`}>
        <span className="mr-2">{getNetworkIcon(chain.id)}</span>
        <span className="font-medium">{networkInfo?.name || 'Unknown'}</span>
        {contractAddress ? (
          <span className="ml-2 text-green-600">✅</span>
        ) : (
          <span className="ml-2 text-red-600">❌</span>
        )}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${getNetworkColor(chain.id)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-xl mr-3">{getNetworkIcon(chain.id)}</span>
          <div>
            <h3 className="font-semibold text-gray-900">
              {networkInfo?.name || 'Unknown Network'}
            </h3>
            <p className="text-sm text-gray-600">
              Chain ID: {chain.id}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {networkInfo?.isTestnet ? '🧪 Testnet' : '🌐 Mainnet'}
          </div>
          <div className="text-sm text-gray-600">
            {networkInfo?.currency.symbol}
          </div>
        </div>
      </div>

      {showContractAddress && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Contract Status:
          </div>
          {contractAddress ? (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm">✅ Deployed</span>
                <code className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                  {truncateAddress(contractAddress)}
                </code>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-red-800 text-sm">❌ Not deployed</span>
                <span className="text-xs text-red-600">
                  Deploy contract first
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {showExplorerLink && networkInfo?.blockExplorer && (
        <div>
          <a
            href={networkInfo.blockExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <span className="mr-1">🔍</span>
            View on Explorer
          </a>
        </div>
      )}

      {networkInfo?.isTestnet && networkInfo?.faucetUrl && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <a
            href={networkInfo.faucetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
          >
            <span className="mr-1">🚰</span>
            Get test tokens
          </a>
        </div>
      )}
    </div>
  );
};

export default NetworkInfo;
