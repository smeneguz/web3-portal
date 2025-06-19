export interface ContractInfo {
  currentSupply: bigint;
  maxSupply: bigint;
  currentPrice: bigint;
  isMintingActive: boolean;
  isWhitelistActive: boolean;
  isPaused: boolean;
}

export interface MintTxParams {
  to: string;
  quantity: number;
  value: bigint;
}

export interface MintResult {
  hash: string;
  blockNumber: bigint;
  gasUsed: bigint;
  tokenIds: number[];
  newBalance: number;
}

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  currency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  isTestnet: boolean;
  faucetUrl?: string;
}

export type ContractAddresses = {
  [key: number]: string;
}

export interface NFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  owner: string;
  tokenURI: string;
  contractAddress: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
  topics: string[];
  homepage?: string;
}