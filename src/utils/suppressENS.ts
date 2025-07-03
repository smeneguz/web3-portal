// Aggressive ENS error suppression for localhost development
export function suppressENSErrors() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Override console.error immediately and aggressively
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(' ');
    
    // Block ALL ENS-related errors
    if (
      message.includes('ContractFunctionExecutionError') ||
      message.includes('ContractFunctionRevertedError') ||
      message.includes('reverse') ||
      message.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
      message.includes('Internal error') ||
      message.includes('getEnsName') ||
      message.includes('ENS') ||
      message.includes('viem') ||
      message.includes('readContract') ||
      message.includes('getContractError')
    ) {
      // Completely silence these
      return;
    }
    
    // Show other errors
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    
    if (
      message.includes('ENS') ||
      message.includes('reverse') ||
      message.includes('getEnsName') ||
      message.includes('Contract')
    ) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  // Block unhandled rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    
    if (
      message.includes('ContractFunctionExecutionError') ||
      message.includes('ContractFunctionRevertedError') ||
      message.includes('reverse') ||
      message.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
      message.includes('Internal error') ||
      message.includes('getEnsName') ||
      message.includes('ENS') ||
      message.includes('viem')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Block global errors
  window.addEventListener('error', (event) => {
    const message = event.error?.message || event.message;
    
    if (
      message.includes('ContractFunctionExecutionError') ||
      message.includes('ContractFunctionRevertedError') ||
      message.includes('reverse') ||
      message.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
      message.includes('Internal error') ||
      message.includes('getEnsName') ||
      message.includes('ENS') ||
      message.includes('viem')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  console.log('🔇 Aggressive ENS error suppression enabled');
}

// Auto-execute
suppressENSErrors();