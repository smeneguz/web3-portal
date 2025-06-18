// filepath: /Users/silviomeneguzzo/Desktop/Dottorato_Nazionale/personal_projects/web3Portal/web3-portal/src/types/index.ts
export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
}

export interface NFTCollection {
  name: string;
  symbol: string;
  description: string;
  image: string;
  contractAddress: string;
  chainId: number;
  price: string;
  maxSupply: number;
  currentSupply: number;
}

export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  icon: string;
}