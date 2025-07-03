import { PublicClient } from 'viem';
import { WEB3_PORTAL_NFT_ABI } from '@/contracts/abi';

// Constants for gas calculation
const GAS_CONSTANTS = {
  FALLBACK_BASE_GAS: 150_000n,
  FALLBACK_PER_TOKEN_GAS: 75_000n,
  FALLBACK_BUFFER_GAS: 50_000n,
  MAX_REASONABLE_GAS: 2_000_000n,
  BUFFER_DIVISOR: 100n,
} as const;

const BUFFER_PERCENTAGES = {
  SINGLE_MINT: 15,
  SMALL_BATCH: 20,
  MEDIUM_BATCH: 25,
  LARGE_BATCH: 30,
} as const;

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
    const gasWithBuffer = estimatedGas + (estimatedGas * BigInt(bufferPercentage) / GAS_CONSTANTS.BUFFER_DIVISOR);

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
 * More NFTs = higher complexity = larger buffer needed
 */
function calculateBufferPercentage(quantity: number): number {
  if (quantity === 1) return BUFFER_PERCENTAGES.SINGLE_MINT;
  if (quantity <= 3) return BUFFER_PERCENTAGES.SMALL_BATCH;
  if (quantity <= 5) return BUFFER_PERCENTAGES.MEDIUM_BATCH;
  return BUFFER_PERCENTAGES.LARGE_BATCH;
}

/**
 * Fallback gas calculation when estimation fails
 * Based on empirical data from successful transactions
 */
function calculateFallbackGas(quantity: number): bigint {
  const { FALLBACK_BASE_GAS, FALLBACK_PER_TOKEN_GAS, FALLBACK_BUFFER_GAS } = GAS_CONSTANTS;
  
  return FALLBACK_BASE_GAS + (BigInt(quantity) * FALLBACK_PER_TOKEN_GAS) + FALLBACK_BUFFER_GAS;
}

/**
 * Validate gas parameters before transaction
 * Ensures user has sufficient balance and gas limit is reasonable
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
  if (gasEstimation.gasWithBuffer > GAS_CONSTANTS.MAX_REASONABLE_GAS) {
    return {
      isValid: false,
      reason: `Gas limit too high: ${gasEstimation.gasWithBuffer}. Maximum allowed: ${GAS_CONSTANTS.MAX_REASONABLE_GAS}`
    };
  }

  return { isValid: true };
}

/**
 * Format gas information for display
 * Converts BigInt values to human-readable strings
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
    const gasCostEth = formatWeiToEth(gasEstimation.totalGasCost);
    result.gasCostEth = gasCostEth;
    
    // Estimate USD cost (this should ideally fetch from a price API)
    const ethPriceUsd = 2000; // Placeholder - consider using a real price feed
    result.gasCostUsd = (parseFloat(gasCostEth) * ethPriceUsd).toFixed(2);
  }

  return result;
}

/**
 * Convert Wei to ETH with proper formatting
 */
function formatWeiToEth(weiValue: bigint): string {
  const ethValue = Number(weiValue) / 1e18;
  return ethValue.toFixed(6);
}