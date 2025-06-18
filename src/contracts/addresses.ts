import { ContractAddresses } from './types';

export const CONTRACT_ADDRESSES: ContractAddresses = {
  // Local development
  localhost: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || "",
  hardhat: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || "",
  
  // Testnets
  sepolia: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "",
  goerli: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_GOERLI || "",
  polygonMumbai: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MUMBAI || "",
  
  // Mainnets
  mainnet: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || "",
  polygon: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || "",
};

export const getContractAddress = (chainId: number): string => {
  const chainIdToNetwork: { [key: number]: string } = {
    1: 'mainnet',
    5: 'goerli',
    11155111: 'sepolia',
    137: 'polygon',
    80001: 'polygonMumbai',
    31337: 'localhost', // Changed from 1337 to 31337
    1337: 'localhost'   // Keep both for compatibility
  };
  
  const network = chainIdToNetwork[chainId];
  return network ? CONTRACT_ADDRESSES[network] : "";
};