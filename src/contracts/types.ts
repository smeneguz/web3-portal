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

export interface ContractAddresses {
  [key: string]: string;
  localhost: string;
  sepolia: string;
  goerli: string;
  polygon: string;
  polygonMumbai: string;
}