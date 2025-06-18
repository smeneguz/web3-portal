import { useState, useEffect } from 'react';

export function useWalletError() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle global wallet errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message;
      
      // Filter out chrome extension errors that don't affect functionality
      if (errorMessage?.includes('chrome.runtime.sendMessage')) {
        console.warn('Chrome extension communication error (non-critical):', errorMessage);
        return; // Don't show these errors to users
      }
      
      // Handle other wallet-related errors
      if (errorMessage?.includes('wallet') || errorMessage?.includes('metamask')) {
        setError('Wallet connection issue. Please try refreshing the page or switching wallets.');
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      
      // Filter out chrome extension errors
      if (errorMessage?.includes('chrome.runtime.sendMessage')) {
        console.warn('Chrome extension promise rejection (non-critical):', errorMessage);
        event.preventDefault(); // Prevent unhandled rejection error
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const clearError = () => setError(null);

  return { error, clearError };
}