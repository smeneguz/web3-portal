'use client';

import { ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import { 
  injectedWallet, 
  metaMaskWallet, 
  coinbaseWallet, 
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  ledgerWallet,
  argentWallet,
  imTokenWallet,
  omniWallet,
  braveWallet
} from '@rainbow-me/rainbowkit/wallets';

interface WalletProviderProps {
  children: ReactNode;
}

// Configure chains with fallback
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, goerli],
  [
    alchemyProvider({ 
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || 'demo' 
    }),
    publicProvider()
  ]
);

// Get project ID with fallback
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'e7de1aa32a4ea8116d29ba2d922140d1';

// Configure connectors with comprehensive wallet support
const connectors = connectorsForWallets([
  {
    groupName: 'Popular',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      coinbaseWallet({ appName: 'Web3 Portal', chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
  {
    groupName: 'More Options',
    wallets: [
      trustWallet({ projectId, chains }),
      braveWallet({ chains }),
      ledgerWallet({ projectId, chains }),
      argentWallet({ projectId, chains }),
      imTokenWallet({ projectId, chains }),
      omniWallet({ projectId, chains }),
    ],
  },
]);

// Create wagmi config with error handling
const wagmiConfig = createConfig({
  autoConnect: false, // Disable auto-connect to prevent extension errors
  connectors,
  publicClient,
  webSocketPublicClient,
});

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains}
        appInfo={{
          appName: 'Web3 Portal',
          learnMoreUrl: 'https://github.com/silviomeneguzzo/web3-portal',
        }}
        showRecentTransactions={true}
        modalSize="compact"
        theme={darkTheme({
          accentColor: '#6366f1',
          accentColorForeground: 'white',
          borderRadius: 'medium',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}