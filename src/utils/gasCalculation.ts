import { PublicClient } from 'viem';
import { WEB3_PORTAL_NFT_ABI } from '@/contracts/abi';

export interface GasEstimation {
  estimatedGas: bigint;
  gasWithBuffer: bigint;
  bufferPercentage: number;
  gasPriceEstimate?: bigint;
  totalGasCost?: bigint;
}

/**
 * Calculate optimal gas limit for mint transactions
 * Uses actual gas estimation + smart buffer calculation
 */
export async function calculateMintGas(
  publicClient: PublicClient,
  contractAddress: string,
  account: string,
  quantity: number,
  mintPrice: bigint
): Promise<GasEstimation> {
  try {
    // Get actual gas estimate from contract
    const estimatedGas = await publicClient.estimateContractGas({
      address: contractAddress as `0x${string}`,
      abi: WEB3_PORTAL_NFT_ABI,
      functionName: 'mint',
      args: [BigInt(quantity)],
      value: mintPrice * BigInt(quantity),
      account: account as `0x${string}`,
    });

    // Calculate buffer based on quantity and complexity
    const bufferPercentage = calculateBufferPercentage(quantity);
    const gasWithBuffer = estimatedGas + (estimatedGas * BigInt(bufferPercentage) / 100n);

    // Get current gas price for cost estimation
    let gasPriceEstimate: bigint | undefined;
    let totalGasCost: bigint | undefined;
    
    try {
      gasPriceEstimate = await publicClient.getGasPrice();
      totalGasCost = gasWithBuffer * gasPriceEstimate;
    } catch (gasPriceError) {
      console.warn('Could not fetch gas price:', gasPriceError);
    }

    return {
      estimatedGas,
      gasWithBuffer,
      bufferPercentage,
      gasPriceEstimate,
      totalGasCost,
    };
  } catch (error: any) {
    console.error('Gas estimation failed:', error);
    
    // Fallback to static calculation if estimation fails
    const fallbackGas = calculateFallbackGas(quantity);
    
    return {
      estimatedGas: fallbackGas,
      gasWithBuffer: fallbackGas,
      bufferPercentage: 25,
    };
  }
}

/**
 * Calculate buffer percentage based on transaction complexity
 */
function calculateBufferPercentage(quantity: number): number {
  // More NFTs = higher complexity = larger buffer needed
  if (quantity === 1) return 15; // 15% buffer for single mint
  if (quantity <= 3) return 20;  // 20% buffer for small batch
  if (quantity <= 5) return 25;  // 25% buffer for medium batch
  return 30; // 30% buffer for large batch
}

/**
 * Fallback gas calculation when estimation fails
 * Based on empirical data from successful transactions
 */
function calculateFallbackGas(quantity: number): bigint {
  const baseGas = 150000n; // Base transaction cost
  const perTokenGas = 75000n; // Cost per additional token
  const bufferGas = 50000n; // Safety buffer
  
  return baseGas + (BigInt(quantity) * perTokenGas) + bufferGas;
}

/**
 * Validate gas parameters before transaction
 */
export function validateGasParameters(
  gasEstimation: GasEstimation,
  userBalance: bigint,
  transactionValue: bigint
): { isValid: boolean; reason?: string } {
  // Check if user has enough ETH for transaction + gas
  const totalRequired = transactionValue + (gasEstimation.totalGasCost || 0n);
  
  if (userBalance < totalRequired) {
    return {
      isValid: false,
      reason: `Insufficient balance for transaction + gas fees. Required: ${totalRequired}, Available: ${userBalance}`
    };
  }

  // Check if gas limit is reasonable (not too high to avoid overpaying)
  const MAX_REASONABLE_GAS = 2000000n; // 2M gas limit
  if (gasEstimation.gasWithBuffer > MAX_REASONABLE_GAS) {
    return {
      isValid: false,
      reason: `Gas limit too high: ${gasEstimation.gasWithBuffer}. Maximum allowed: ${MAX_REASONABLE_GAS}`
    };
  }

  return { isValid: true };
}

/**
 * Format gas information for display
 */
export function formatGasInfo(gasEstimation: GasEstimation): {
  estimatedGas: string;
  gasWithBuffer: string;
  gasCostEth?: string;
  gasCostUsd?: string;
} {
  const result = {
    estimatedGas: gasEstimation.estimatedGas.toString(),
    gasWithBuffer: gasEstimation.gasWithBuffer.toString(),
    gasCostEth: undefined as string | undefined,
    gasCostUsd: undefined as string | undefined,
  };

  if (gasEstimation.totalGasCost) {
    // Convert wei to ETH (divide by 1e18)
    const gasCostEth = Number(gasEstimation.totalGasCost) / 1e18;
    result.gasCostEth = gasCostEth.toFixed(6);
    
    // Estimate USD cost (approximate ETH price)
    const ethPriceUsd = 2000; // You could fetch this from an API
    result.gasCostUsd = (gasCostEth * ethPriceUsd).toFixed(2);
  }

  return result;
}