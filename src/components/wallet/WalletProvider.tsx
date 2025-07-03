import React from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// Suppress ENS errors for localhost development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Suppress unhandled promise rejections for ENS
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    if (
      message.includes('ContractFunctionExecutionError') ||
      message.includes('reverse') ||
      message.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
      message.includes('Internal error') ||
      message.includes('getEnsName') ||
      message.includes('ENS')
    ) {
      event.preventDefault();
      console.log('🔇 Suppressed ENS error (not critical for localhost)');
    }
  });

  // Suppress global errors for ENS
  window.addEventListener('error', (event) => {
    const message = event.error?.message || event.message;
    if (
      message.includes('ContractFunctionExecutionError') ||
      message.includes('reverse') ||
      message.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
      message.includes('Internal error') ||
      message.includes('getEnsName') ||
      message.includes('ENS')
    ) {
      event.preventDefault();
      console.log('🔇 Suppressed ENS error (not critical for localhost)');
    }
  });
}

// ...resto del codice esistente...
const localhost = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local', url: '#' },
  },
  testnet: true,
  // Disable ENS for localhost
  contracts: {},
} as const;

// Amoy testnet configuration
const amoy = {
  id: 80002,
  name: 'Polygon Amoy Testnet',
  network: 'amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://rpc-amoy.polygon.technology'] },
    default: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: {
      name: 'Amoy PolygonScan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  testnet: true,
  // Disable ENS for Amoy
  contracts: {},
} as const;

// Configure chains with custom providers (ENS disabled for local development)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    localhost,      // Development
    sepolia,        // Ethereum testnet
    amoy,          // Polygon testnet
    polygon,       // Polygon mainnet (has ENS through bridge)
    mainnet,       // Ethereum mainnet (native ENS)
  ],
  [
    // Custom providers for better reliability
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case 31337:
            return { 
              http: 'http://127.0.0.1:8545',
              webSocket: 'ws://127.0.0.1:8545',
            };
          case 11155111:
            return { http: 'https://sepolia.gateway.tenderly.co' };
          case 80002:
            return { http: 'https://rpc-amoy.polygon.technology' };
          default:
            return null;
        }
      },
    }),
    publicProvider(),
  ]
);

// Get default wallets
const { connectors } = getDefaultWallets({
  appName: 'Web3Portal',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains,
});

// Create wagmi config with ENS optimization
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// Create a QueryClient instance with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry ENS errors on localhost/testnets
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('reverse') || 
            errorMessage.includes('ENS') ||
            errorMessage.includes('Internal error') ||
            errorMessage.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
            errorMessage.includes('getEnsName')) {
          return false; // Never retry these
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Disable error logging for queries
      onError: (error: any) => {
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('reverse') || 
            errorMessage.includes('ENS') ||
            errorMessage.includes('Internal error') ||
            errorMessage.includes('ContractFunctionExecutionError') ||
            errorMessage.includes('getEnsName')) {
          // Don't log ENS errors
          return;
        }
        // Log other errors normally (but console.error is already overridden)
        console.error('Query error:', error);
      },
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('reverse') || 
            errorMessage.includes('ENS') ||
            errorMessage.includes('Internal error') ||
            errorMessage.includes('ContractFunctionExecutionError') ||
            errorMessage.includes('getEnsName')) {
          return;
        }
        console.error('Mutation error:', error);
      },
    },
  },
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider 
          chains={chains}
          initialChain={localhost} // Start with localhost for development
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
};

export default WalletProvider;