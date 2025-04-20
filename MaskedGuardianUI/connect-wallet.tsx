'use client';

import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
  usePublicClient,
} from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from './web3-provider'; // adjust path if needed


import guardianAbi from '../MaskedGuardian - Wallet Security Analyst/contracts/MaskedGuardianABI.json';
import { WriteGuardianContract } from '../MaskedGuardian - Wallet Security Analyst/library/WriteGuardianContract';

const guardianAddress = '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [guardianStatus, setGuardianStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuardianStatus = async () => {
      if (!address || !publicClient) return;

      try {
        const result = await readContract(config, {
          address: guardianAddress,
          abi: guardianAbi,
          functionName: 'getGuardianStatus',
          args: [address],
          account: address,
        });
        

        setGuardianStatus(result ? '🛡️ Protected' : '⚠️ Unprotected');
      } catch (err) {
        console.error('Error reading guardian status:', err);
        setGuardianStatus('❌ Error');
      }
    };

    if (isConnected) fetchGuardianStatus();
  }, [isConnected, publicClient, address]);

  const handleConnect = async () => {
    const connector = connectors.find((c) => c.id === 'injected') || connectors[0];
    connect({ connector });
  };

  const handleSetGuardianStatus = async () => {
    if (!walletClient || !address) return;

    try {
      const contract = WriteGuardianContract(walletClient);
      await contract.write.setGuardianStatus(address);
      setGuardianStatus('🛡️ Protected ✅');
    } catch (err) {
      console.error('Error writing guardian status:', err);
      setGuardianStatus('❌ Write Error');
    }
  };

  return (
    <div>
      {isConnected ? (
        <>
          <p>Connected as: {address}</p>
          <p>Status: {guardianStatus}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
          <br />
          <button onClick={handleSetGuardianStatus}>Activate Guardian</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
