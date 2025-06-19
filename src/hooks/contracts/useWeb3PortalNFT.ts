import { useState, useEffect, useMemo } from 'react';
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { WEB3_PORTAL_NFT_ABI } from '@/contracts/abi';
import { getContractAddress, isContractDeployed } from '@/contracts/addresses';
import { getChainById, isChainSupported } from '@/utils/chains';
import { ContractInfo, MintResult } from '@/contracts/types';
import { calculateMintGas, validateGasParameters, formatGasInfo, type GasEstimation } from '@/utils/gasCalculation';
import toast from 'react-hot-toast';

export function useWeb3PortalNFT() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const contractAddress = getContractAddress(chainId);
  const chainConfig = getChainById(chainId);
  const isNetworkSupported = isChainSupported(chainId);
  const isContractAvailable = isContractDeployed(chainId);

  // Network validation error
  const networkError = useMemo(() => {
    if (!isConnected) return null;
    
    if (!isNetworkSupported) {
      return new Error(`Network ${chainId} is not supported. Please switch to a supported network.`);
    }
    
    if (!isContractAvailable) {
      return new Error(`Contract not deployed on ${chainConfig?.name || 'this network'}. Please switch to a network with deployed contract.`);
    }
    
    return null;
  }, [chainId, isConnected, isNetworkSupported, isContractAvailable, chainConfig]);

  // Contract info query
  const { 
    data: contractInfo, 
    isLoading: isLoadingContract,
    error: contractError,
    refetch: refetchContractInfo 
  } = useQuery({
    queryKey: ['contractInfo', contractAddress, chainId],
    queryFn: async (): Promise<ContractInfo> => {
      if (!publicClient || !contractAddress) {
        throw new Error('Client or contract address not available');
      }

      const info = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WEB3_PORTAL_NFT_ABI,
        functionName: 'getContractInfo',
      }) as readonly [bigint, bigint, bigint, boolean, boolean, boolean];

      return {
        currentSupply: info[0],
        maxSupply: info[1],
        currentPrice: info[2],
        isMintingActive: info[3],
        isWhitelistActive: info[4],
        isPaused: info[5],
      };
    },
    enabled: !!publicClient && !!contractAddress && !networkError,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // User balance query
  const { 
    data: userBalance, 
    refetch: refetchUserBalance 
  } = useQuery({
    queryKey: ['userBalance', address, contractAddress, chainId],
    queryFn: async (): Promise<number> => {
      if (!publicClient || !contractAddress || !address) return 0;

      const balance = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WEB3_PORTAL_NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      return Number(balance);
    },
    enabled: !!publicClient && !!contractAddress && !!address && !networkError,
  });

  // User tokens query
  const { 
    data: userTokens, 
    refetch: refetchUserTokens 
  } = useQuery({
    queryKey: ['userTokens', address, contractAddress, chainId],
    queryFn: async (): Promise<number[]> => {
      if (!publicClient || !contractAddress || !address) return [];

      const tokens = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WEB3_PORTAL_NFT_ABI,
        functionName: 'tokensOfOwner',
        args: [address],
      }) as readonly bigint[];

      return tokens.map(token => Number(token));
    },
    enabled: !!publicClient && !!contractAddress && !!address && !networkError,
  });

  // Whitelist status query
  const { data: isWhitelisted } = useQuery({
    queryKey: ['isWhitelisted', address, contractAddress, chainId],
    queryFn: async (): Promise<boolean> => {
      if (!publicClient || !contractAddress || !address) return false;

      const whitelisted = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WEB3_PORTAL_NFT_ABI,
        functionName: 'isWhitelisted',
        args: [address],
      }) as boolean;

      return whitelisted;
    },
    enabled: !!publicClient && !!contractAddress && !!address && !networkError,
  });

  // Mint mutation with comprehensive validation and gas optimization
  const mintMutation = useMutation({
    mutationFn: async ({ quantity }: { quantity: number }): Promise<MintResult> => {
      // Pre-flight validations
      if (networkError) throw networkError;
      
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet not connected');
      }

      if (!contractAddress) {
        throw new Error(`Contract not deployed on chain ${chainId}`);
      }

      if (!contractInfo) {
        throw new Error('Contract info not loaded');
      }

      console.log('Starting mint validation...');
      setIsTransactionPending(true);

      try {
        // Validate contract state
        if (contractInfo.isPaused) {
          throw new Error('Contract is currently paused');
        }

        if (!contractInfo.isMintingActive) {
          throw new Error('Minting is not active. Please wait for the owner to enable minting.');
        }

        if (contractInfo.isWhitelistActive && !isWhitelisted) {
          throw new Error('You are not whitelisted for this mint');
        }

        // Validate supply limits
        const remainingSupply = contractInfo.maxSupply - contractInfo.currentSupply;
        if (BigInt(quantity) > remainingSupply) {
          throw new Error(`Only ${remainingSupply} NFTs remaining`);
        }

        // Calculate costs and validate user balance
        const totalCost = contractInfo.currentPrice * BigInt(quantity);
        const userEthBalance = await publicClient.getBalance({ address });
        
        console.log('Pre-flight validation passed');
        console.log(`Total cost: ${formatEther(totalCost)} ${chainConfig?.currency.symbol || 'ETH'}`);

        // NEW: Calculate optimal gas with best practices
        console.log('Calculating optimal gas...');
        const gasEstimation = await calculateMintGas(
          publicClient,
          contractAddress,
          address,
          quantity,
          contractInfo.currentPrice
        );

        // Validate gas parameters
        const gasValidation = validateGasParameters(
          gasEstimation,
          userEthBalance,
          totalCost
        );

        if (!gasValidation.isValid) {
          throw new Error(gasValidation.reason);
        }

        const gasInfo = formatGasInfo(gasEstimation);
        console.log('Gas estimation:', gasInfo);

        // Simulate transaction before execution
        try {
          await publicClient.simulateContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'mint',
            args: [BigInt(quantity)],
            value: totalCost,
            account: address,
            gas: gasEstimation.gasWithBuffer,
          });
          console.log('Transaction simulation successful');
        } catch (simError: any) {
          console.error('Simulation failed:', simError);
          
          // Parse common contract errors
          if (simError.message?.includes('MintingNotActive')) {
            throw new Error('Minting is not active');
          } else if (simError.message?.includes('ExceedsMaxSupply')) {
            throw new Error('Exceeds maximum supply');
          } else if (simError.message?.includes('ExceedsMaxMintPerTx')) {
            throw new Error('Exceeds maximum mint per transaction');
          } else if (simError.message?.includes('ExceedsMaxMintPerWallet')) {
            throw new Error('Exceeds maximum mint per wallet');
          } else if (simError.message?.includes('InsufficientPayment')) {
            throw new Error('Insufficient payment');
          } else if (simError.message?.includes('NotWhitelisted')) {
            throw new Error('Not whitelisted');
          } else {
            throw new Error(`Transaction will fail: ${simError.shortMessage || simError.message}`);
          }
        }

        // Execute transaction with calculated gas
        console.log('Executing mint transaction...');
        
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: WEB3_PORTAL_NFT_ABI,
          functionName: 'mint',
          args: [BigInt(quantity)],
          value: totalCost,
          account: address,
          gas: gasEstimation.gasWithBuffer, // Use calculated gas
        });

        console.log('Transaction sent:', hash);
        toast.success('Transaction sent! Waiting for confirmation...');

        // Wait for confirmation with timeout
        const receipt = await publicClient.waitForTransactionReceipt({ 
          hash,
          timeout: 120_000, // 2 minutes timeout
        });

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed');
        }

        console.log('Transaction confirmed:', receipt.transactionHash);
        console.log('Gas used:', receipt.gasUsed.toString());
        console.log('Gas estimated:', gasInfo.gasWithBuffer);

        // Verify mint was successful and get new tokens
        const newBalance = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: WEB3_PORTAL_NFT_ABI,
          functionName: 'balanceOf',
          args: [address],
        }) as bigint;

        const newTokens = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: WEB3_PORTAL_NFT_ABI,
          functionName: 'tokensOfOwner',
          args: [address],
        }) as readonly bigint[];

        const result: MintResult = {
          hash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          tokenIds: newTokens.map(id => Number(id)),
          newBalance: Number(newBalance)
        };

        console.log('Mint successful:', result);
        return result;

      } catch (error: any) {
        console.error('Mint failed:', error);
        throw error;
      } finally {
        setIsTransactionPending(false);
      }
    },
    onSuccess: (data) => {
      toast.success(`Successfully minted ${data.tokenIds.length} NFT${data.tokenIds.length > 1 ? 's' : ''}!`);
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['contractInfo'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      queryClient.invalidateQueries({ queryKey: ['userTokens'] });
    },
    onError: (error: any) => {
      console.error('Mint error:', error);
      toast.error(error.message || 'Minting failed');
    }
  });

  // Comprehensive validation functions
  const canMint = (): boolean => {
    if (!isConnected || !contractInfo || networkError) return false;
    
    return contractInfo.isMintingActive && 
           !contractInfo.isPaused && 
           (!contractInfo.isWhitelistActive || isWhitelisted === true);
  };

  const getMintButtonText = (quantity: number = 1): string => {
    if (!isConnected) return 'Connect Wallet';
    if (networkError) return 'Network Error';
    if (isLoadingContract) return 'Loading...';
    if (contractError) return 'Contract Error';
    if (!contractAddress) return 'Contract Not Available';
    if (!contractInfo) return 'Loading Contract...';
    
    if (contractInfo.isPaused) return 'Minting Paused';
    if (!contractInfo.isMintingActive) return 'Minting Not Active';
    if (contractInfo.isWhitelistActive && !isWhitelisted) return 'Not Whitelisted';
    if (mintMutation.isPending || isTransactionPending) return 'Minting...';
    
    return `Mint ${quantity} NFT${quantity > 1 ? 's' : ''}`;
  };

  const getMintPrice = (): string => {
    if (!contractInfo) return '0';
    return formatEther(contractInfo.currentPrice);
  };

  const getRemainingSupply = (): number => {
    if (!contractInfo) return 0;
    return Number(contractInfo.maxSupply - contractInfo.currentSupply);
  };

  const getMintProgress = (): number => {
    if (!contractInfo) return 0;
    const current = Number(contractInfo.currentSupply);
    const max = Number(contractInfo.maxSupply);
    return max > 0 ? (current / max) * 100 : 0;
  };

  const getContractStats = () => {
    if (!contractInfo) return null;
    
    return {
      currentSupply: Number(contractInfo.currentSupply),
      maxSupply: Number(contractInfo.maxSupply),
      mintPrice: getMintPrice(),
      remainingSupply: getRemainingSupply(),
      mintProgress: getMintProgress(),
      isMintingActive: contractInfo.isMintingActive,
      isWhitelistActive: contractInfo.isWhitelistActive,
      isPaused: contractInfo.isPaused,
    };
  };

  const getNetworkInfo = () => {
    return {
      chainId,
      chainName: chainConfig?.name || 'Unknown Network',
      currency: chainConfig?.currency || { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
      isTestnet: chainConfig?.isTestnet || false,
      blockExplorer: chainConfig?.blockExplorer || '',
      faucetUrl: chainConfig?.faucetUrl,
    };
  };

  const canUserMint = (quantity: number = 1): { canMint: boolean; reason?: string } => {
    if (!isConnected) {
      return { canMint: false, reason: 'Wallet not connected' };
    }
    
    if (networkError) {
      return { canMint: false, reason: networkError.message };
    }
    
    if (!contractInfo) {
      return { canMint: false, reason: 'Contract info not loaded' };
    }
    
    if (contractInfo.isPaused) {
      return { canMint: false, reason: 'Contract is paused' };
    }
    
    if (!contractInfo.isMintingActive) {
      return { canMint: false, reason: 'Minting is not active' };
    }
    
    if (contractInfo.isWhitelistActive && !isWhitelisted) {
      return { canMint: false, reason: 'You are not whitelisted' };
    }
    
    const remainingSupply = getRemainingSupply();
    if (quantity > remainingSupply) {
      return { canMint: false, reason: `Only ${remainingSupply} NFTs remaining` };
    }
    
    if (quantity < 1 || quantity > 10) {
      return { canMint: false, reason: 'Invalid quantity (1-10 allowed)' };
    }
    
    return { canMint: true };
  };

  // Auto-refresh data when transaction completes
  useEffect(() => {
    if (mintMutation.isSuccess) {
      // Small delay to ensure blockchain state is updated
      setTimeout(() => {
        refetchContractInfo();
        refetchUserBalance();
        refetchUserTokens();
      }, 2000);
    }
  }, [mintMutation.isSuccess, refetchContractInfo, refetchUserBalance, refetchUserTokens]);

  // Auto-refresh data periodically when component is active
  useEffect(() => {
    if (!isConnected || !contractAddress) return;
    
    const interval = setInterval(() => {
      refetchContractInfo();
      if (address) {
        refetchUserBalance();
        refetchUserTokens();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, contractAddress, address, refetchContractInfo, refetchUserBalance, refetchUserTokens]);

  return {
    // Contract data
    contractAddress,
    contractInfo,
    contractStats: getContractStats(),
    mintPrice: getMintPrice(),
    userTokens: userTokens || [],
    userBalance: userBalance || 0,
    isWhitelisted: isWhitelisted || false,
    remainingSupply: getRemainingSupply(),
    
    // Network info
    networkInfo: getNetworkInfo(),
    chainConfig,
    isNetworkSupported,
    isContractAvailable,
    networkError,
    
    // State
    isLoading: isLoadingContract,
    error: contractError || networkError,
    
    // Mint functionality
    mint: mintMutation.mutate,
    canMint: canMint(),
    canUserMint,
    getMintButtonText,
    getMintProgress,
    
    // Transaction state
    isMintPending: mintMutation.isPending || isTransactionPending,
    isMintSuccess: mintMutation.isSuccess,
    isMintError: mintMutation.isError,
    mintError: mintMutation.error,
    mintData: mintMutation.data,
    
    // Utility functions
    refetchContractInfo,
    refetchUserTokens,
    refetchUserBalance,
    resetMint: mintMutation.reset,
    
    // Additional utilities
    getContractStats,
    getNetworkInfo,
    
    // Compatibility with existing code
    getMintPrice,
    getRemainingSupply,
  };
}

// Export types for external use
export type { ContractInfo, MintResult };

// Hook for backwards compatibility with existing components
export const useContractInfo = () => {
  const hook = useWeb3PortalNFT();
  return {
    contractInfo: hook.contractInfo,
    isLoading: hook.isLoading,
    error: hook.error,
    refetch: hook.refetchContractInfo,
  };
};

// Hook for user-specific data
export const useUserNFTData = () => {
  const hook = useWeb3PortalNFT();
  return {
    userTokens: hook.userTokens,
    userBalance: hook.userBalance,
    isLoading: hook.isLoading,
    error: hook.error,
    refetch: () => {
      hook.refetchUserBalance();
      hook.refetchUserTokens();
    },
  };
};