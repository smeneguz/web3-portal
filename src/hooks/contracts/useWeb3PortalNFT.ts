import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseEther, formatEther } from 'viem';
import { WEB3_PORTAL_NFT_ABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import toast from 'react-hot-toast';

interface ContractInfo {
  currentSupply: bigint;
  maxSupply: bigint;
  currentPrice: bigint;
  isMintingActive: boolean;
  isWhitelistActive: boolean;
  isPaused: boolean;
}

interface MintResult {
  hash: string;
  blockNumber: bigint;
  gasUsed: bigint;
  tokenIds: number[];
  newBalance: number;
}

export function useWeb3PortalNFT() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const contractAddress = getContractAddress(chainId);

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
    enabled: !!publicClient && !!contractAddress,
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
    enabled: !!publicClient && !!contractAddress && !!address,
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
    enabled: !!publicClient && !!contractAddress && !!address,
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
    enabled: !!publicClient && !!contractAddress && !!address,
  });

  // Mint mutation
  const mintMutation = useMutation({
    mutationFn: async ({ quantity }: { quantity: number }): Promise<MintResult> => {
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
        
        if (userEthBalance < totalCost) {
          const needed = formatEther(totalCost);
          const available = formatEther(userEthBalance);
          throw new Error(`Insufficient funds. Need ${needed} ETH, have ${available} ETH`);
        }

        console.log('Pre-flight validation passed');
        console.log(`Total cost: ${formatEther(totalCost)} ETH`);

        // Simulate transaction before execution
        try {
          await publicClient.simulateContract({
            address: contractAddress as `0x${string}`,
            abi: WEB3_PORTAL_NFT_ABI,
            functionName: 'mint',
            args: [BigInt(quantity)],
            value: totalCost,
            account: address,
          });
          console.log('Transaction simulation successful');
        } catch (simError: any) {
          console.error('Simulation failed:', simError);
          
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

        // Execute the transaction
        console.log('Executing mint transaction...');
        
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: WEB3_PORTAL_NFT_ABI,
          functionName: 'mint',
          args: [BigInt(quantity)],
          value: totalCost,
          account: address,
        });

        console.log('Transaction sent:', hash);
        toast.success('Transaction sent! Waiting for confirmation...');

        // Wait for confirmation with timeout
        const receipt = await publicClient.waitForTransactionReceipt({ 
          hash,
          timeout: 120_000,
        });

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed');
        }

        console.log('Transaction confirmed:', receipt.transactionHash);

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

  // Utility functions
  const canMint = (): boolean => {
    if (!isConnected || !contractInfo) return false;
    
    return contractInfo.isMintingActive && 
           !contractInfo.isPaused && 
           (!contractInfo.isWhitelistActive || isWhitelisted === true);
  };

  const getMintButtonText = (quantity: number = 1): string => {
    if (!isConnected) return 'Connect Wallet';
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
    return (current / max) * 100;
  };

  // Auto-refresh data when transaction completes
  useEffect(() => {
    if (mintMutation.isSuccess) {
      setTimeout(() => {
        refetchContractInfo();
        refetchUserBalance();
        refetchUserTokens();
      }, 2000);
    }
  }, [mintMutation.isSuccess]);

  return {
    // Contract data
    contractAddress,
    contractInfo,
    mintPrice: getMintPrice(),
    userTokens: userTokens || [],
    userBalance: userBalance || 0,
    isWhitelisted: isWhitelisted || false,
    remainingSupply: getRemainingSupply(),
    
    // State
    isLoading: isLoadingContract,
    error: contractError,
    
    // Mint functionality
    mint: mintMutation.mutate,
    canMint: canMint(),
    getMintButtonText,
    getMintProgress,
    
    // Transaction state
    isMintPending: mintMutation.isPending || isTransactionPending,
    isMintSuccess: mintMutation.isSuccess,
    mintError: mintMutation.error,
    mintData: mintMutation.data,
    
    // Utility functions
    refetchContractInfo,
    refetchUserTokens,
    refetchUserBalance,
    resetMint: mintMutation.reset,
  };
}