import { ChainConfig } from '@/contracts/types';

export const chains: Record<string, ChainConfig> = {
  localhost: {
    name: 'Hardhat Local',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    currency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc2.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    currency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    faucetUrl: 'https://sepoliafaucet.com',
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    currency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: false,
  },
  polygonMumbai: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    rpcUrl: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    currency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: true,
    faucetUrl: 'https://faucet.polygon.technology',
  },
};

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return Object.values(chains).find(chain => chain.chainId === chainId);
};

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

export const getMainnetChains = (): ChainConfig[] => {
  return Object.values(chains).filter(chain => !chain.isTestnet);
};

export const getTestnetChains = (): ChainConfig[] => {
  return Object.values(chains).filter(chain => chain.isTestnet);
};

export const getDefaultChain = (): ChainConfig => {
  if (process.env.NODE_ENV === 'development') {
    return chains.localhost;
  }
  return chains.polygon;
};