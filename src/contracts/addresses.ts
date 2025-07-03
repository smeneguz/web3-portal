import { ContractAddresses } from './types';

const CONTRACT_ADDRESSES: ContractAddresses = {
  // Localhost Hardhat
  31337: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || '',
  
  // Sepolia Testnet
  11155111: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '',
  
  // Polygon Amoy Testnet (NEW - replaces Mumbai)
  80002: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_AMOY || '',
  
  // Polygon Mainnet
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || '',
};

export function getContractAddress(chainId: number): string | null {
  const address = CONTRACT_ADDRESSES[chainId as keyof ContractAddresses];
  return address && address.length > 0 ? address : null;
}

export function isContractDeployed(chainId: number): boolean {
  const address = getContractAddress(chainId);
  return address !== null && address !== '';
}

export function getSupportedNetworks(): number[] {
  return Object.keys(CONTRACT_ADDRESSES).map(Number);
}