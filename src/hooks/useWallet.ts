import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = async () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  if (!mounted) {
    return {
      address: null,
      isConnected: false,
      connectWallet,
      disconnectWallet
    };
  }

  return {
    address,
    isConnected,
    connectWallet,
    disconnectWallet
  };
};