// Define proper TypeScript interfaces
interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

interface ChainConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  nativeCurrency: NativeCurrency;
}

interface ChainsConfig {
  [key: string]: ChainConfig;
}

export const chains: ChainsConfig = {
  ethereum: {
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    chainId: 1,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  polygon: {
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com/",
    chainId: 137,
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  binanceSmartChain: {
    name: "Binance Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    chainId: 56,
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
    },
  },
  sepolia: {
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    chainId: 11155111,
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
    },
  },
  localhost: {
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 31337,
    nativeCurrency: {
      name: "Localhost Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Properly typed function with return type annotation
export const getChainById = (chainId: number): ChainConfig | undefined => {
  return Object.values(chains).find(chain => chain.chainId === chainId);
};

// Additional utility functions
export const getSupportedChainIds = (): number[] => {
  return Object.values(chains).map(chain => chain.chainId);
};

export const isChainSupported = (chainId: number): boolean => {
  return getSupportedChainIds().includes(chainId);
};

export const getChainName = (chainId: number): string => {
  const chain = getChainById(chainId);
  return chain?.name || 'Unknown Network';
};

// Export types for use in other files
export type { ChainConfig, NativeCurrency, ChainsConfig };