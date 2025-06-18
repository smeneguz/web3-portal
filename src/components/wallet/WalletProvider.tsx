'use client';

import { ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { hardhat, mainnet, polygon, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMaskWallet, walletConnectWallet, rainbowWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    hardhat,
    ...(process.env.NODE_ENV === 'development' ? [sepolia] : [mainnet, polygon, sepolia]),
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 31337) {
          return { http: 'http://127.0.0.1:8545' };
        }
        return null;
      },
    }),
    publicProvider(),
  ]
);

// Configure connectors
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ 
        chains, 
        projectId,
        shimDisconnect: true,
      }),
      walletConnectWallet({ 
        chains, 
        projectId,
        options: {
          projectId,
        },
      }),
      rainbowWallet({ 
        chains, 
        projectId,
      }),
      coinbaseWallet({
        appName: 'Web3Portal',
        chains,
      }),
    ],
  },
]);

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// Create query client with proper error typing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Properly type check the error
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Don't retry on wallet connection errors
        if (errorMessage.includes('User rejected') || 
            errorMessage.includes('Extension ID') ||
            errorMessage.includes('User denied') ||
            errorMessage.includes('rejected')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider 
          chains={chains}
          initialChain={hardhat}
          showRecentTransactions={true}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

// Export as default for compatibility
export default WalletProvider;