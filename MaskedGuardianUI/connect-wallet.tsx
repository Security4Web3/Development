'use client';

import React, { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Ensure this only runs client-side

    const providerOptions = {
      walletconnect: {
        package: require('@walletconnect/web3-provider'),
        options: {
          infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // use your real INFURA_ID
        },
      },
    };

    const modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    });

    setWeb3Modal(modal);
  }, []);

  const handleConnect = async () => {
    if (!web3Modal) return;

    const instance = await web3Modal.connect();
    const walletConnector = connectors[0];
    connect({ connector: walletConnector });
  };

  return (
    <div>
      {isConnected ? (
        <>
          <p>Connected as: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
