'use client';
import { config } from './web3-provider'; // Adjust the path if needed

import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
} from 'wagmi';
import { readContract } from 'wagmi/actions';
import { WriteGuardianContract } from '../MaskedGuardian - Wallet Security Analyst/library/WriteGuardianContract';
import guardianAbi from '../MaskedGuardian - Wallet Security Analyst/contracts/MaskedGuardianABI.json';

const guardianAddress = '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [guardianStatus, setGuardianStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // <-- NEW

  useEffect(() => {
    setMounted(true); // Mark component as mounted
  }, []);

  useEffect(() => {
    const fetchGuardianStatus = async () => {
      if (!address) return;

      try {
        const result = await readContract(config, {
          address: guardianAddress,
          abi: guardianAbi,
          functionName: 'isBlockedRecipient',

          args: [address],
        });

        setGuardianStatus(result ? '🛡️ Protected' : '⚠️ Unprotected');
      } catch (err) {
        console.error('Error reading guardian status:', err);
        setGuardianStatus('❌ Error');
      }
    };

    if (isConnected) fetchGuardianStatus();
  }, [isConnected, address]);

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

  if (!mounted) return null; // <-- THIS PREVENTS SSR MISMATCH

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
