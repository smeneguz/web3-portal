'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, LogOut } from 'lucide-react';

const WalletConnect: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        return (
            <div className="wallet-connect">
                <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                    <Wallet className="w-5 h-5 text-web3-primary" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-400">Connected as:</p>
                        <p className="font-mono text-white">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                    </div>
                    <button
                        onClick={() => disconnect()}
                        className="btn-secondary flex items-center space-x-2"
                        title="Disconnect wallet"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wallet-connect">
            <div className="text-center p-4">
                <Wallet className="w-12 h-12 text-web3-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-4 text-sm">
                    Connect your wallet to access Web3 features
                </p>
                <ConnectButton />
            </div>
        </div>
    );
};

export default WalletConnect;