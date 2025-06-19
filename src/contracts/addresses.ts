import { ContractAddresses } from './types';

const CONTRACT_ADDRESSES: ContractAddresses = {
  // Localhost Hardhat
  31337: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || '',
  
  // Sepolia Testnet
  11155111: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '',
  
  // Polygon Mumbai Testnet
  80001: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MUMBAI || '',
  
  // Polygon Mainnet
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || '',
};

export function getContractAddress(chainId: number): string | null {
  const address = CONTRACT_ADDRESSES[chainId];
  
  if (!address) {
    console.warn(`No contract address configured for chain ID: ${chainId}`);
    return null;
  }
  
  return address;
}

export function isContractDeployed(chainId: number): boolean {
  return !!getContractAddress(chainId);
}

export function getSupportedNetworks(): number[] {
  return Object.keys(CONTRACT_ADDRESSES)
    .map(Number)
    .filter(chainId => CONTRACT_ADDRESSES[chainId]);
}