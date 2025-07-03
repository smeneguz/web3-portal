export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  faucetUrl?: string;
}

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
    rpcUrl: 'https://sepolia.gateway.tenderly.co',
    blockExplorer: 'https://sepolia.etherscan.io',
    currency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    faucetUrl: 'https://sepoliafaucet.com',
  },
  amoy: {
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    currency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: true,
    faucetUrl: 'https://faucet.polygon.technology',
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
  // In development, prefer localhost if contract is deployed, otherwise use sepolia
  if (process.env.NODE_ENV === 'development') {
    return chains.localhost;
  }
  return chains.polygon;
};

export const getChainsWithContracts = (): ChainConfig[] => {
  // Import here to avoid circular dependency
  const { isContractDeployed } = require('@/contracts/addresses');
  return Object.values(chains).filter(chain => isContractDeployed(chain.chainId));
};