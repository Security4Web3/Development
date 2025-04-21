'use client';

import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
} from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from './web3-provider';
import { WriteGuardianContract } from '../MaskedGuardian - Wallet Security Analyst/library/WriteGuardianContract';
import guardianAbi from '../MaskedGuardian - Wallet Security Analyst/contracts/MaskedGuardianABI.json';

const guardianAddress = '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  const [guardianStatus, setGuardianStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [streamId, setStreamId] = useState('');

  useEffect(() => {
    setMounted(true);
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

  const handleAnalyzeStream = async (streamId: string) => {
    if (!walletClient) return;
    try {
      const contract = WriteGuardianContract(walletClient);
      await contract.write.analyzeAndPause(BigInt(streamId));
      alert('✅ Stream analyzed successfully');
    } catch (err) {
      console.error('Guardian scan failed:', err);
      alert('⚠️ Error analyzing stream — check console.');
    }
  };

  const handleSetGuardianStatus = async () => {
    if (!walletClient || !address || !streamId) return;

    try {
      await handleAnalyzeStream(streamId);
      const contract = WriteGuardianContract(walletClient);
      await contract.write.setGuardianStatus(address);
      setGuardianStatus('🛡️ Protected ✅');
    } catch (err) {
      console.error('Error writing guardian status:', err);
      setGuardianStatus('❌ Write Error');
    }
  };

  if (!mounted) return null;

  return (
    <div>
      {isConnected ? (
        <>
          <p><strong>Connected:</strong> {address}</p>
          <p className={guardianStatus?.includes('✅') ? 'status-success' :
                        guardianStatus?.includes('⚠️') ? 'status-warning' :
                        'status-error'}>
            Status: {guardianStatus}
          </p>
         
          <div className="flex space-x-2 mt-3">
            <button onClick={() => disconnect()} className="button">Disconnect</button>
            <button onClick={handleSetGuardianStatus} className="button">Activate Guardian</button>
          </div>
        </>
      ) : (
        <button onClick={handleConnect} className="button">Connect Wallet</button>
      )}
    </div>
  );
}
