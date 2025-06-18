import React, { useContext } from 'react';
import { WalletContext } from './WalletProvider';

const WalletConnect: React.FC = () => {
    const { connectWallet, disconnectWallet, walletAddress } = useContext(WalletContext);

    return (
        <div className="wallet-connect">
            {walletAddress ? (
                <div>
                    <p>Connected as: {walletAddress}</p>
                    <button onClick={disconnectWallet}>Disconnect</button>
                </div>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}
        </div>
    );
};

export default WalletConnect;