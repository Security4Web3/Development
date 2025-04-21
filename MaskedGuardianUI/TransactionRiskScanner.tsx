'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Watcher } from '../MaskedGuardian - Wallet Security Analyst/library/TransactionMonitor';
import { ReadGuardianContract } from '../MaskedGuardian - Wallet Security Analyst/library/ReadGuardianContract';

type RiskAlert = {
  address: string;
  timestamp: number;
  hash: string;
};

function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
}

export default function TransactionRiskScanner() {
  const { address } = useAccount();
  const [threats, setThreats] = useState<RiskAlert[]>([]);

  useEffect(() => {
    if (!address) return;

    const startWatching = async () => {
      Watcher(address, async (tx) => {
        const contract = ReadGuardianContract();
        const from = tx.from?.toLowerCase?.();
        const to = tx.to?.toLowerCase?.();
        const me = address.toLowerCase();
        const counterpart = to === me ? from : to;

        if (!counterpart || counterpart === '0x0000000000000000000000000000000000000000') {
          console.warn('⚠️ Skipped tx: counterpart address invalid or missing.', tx);
          return;
        }

        try {
          const isBlocked = await contract.read.isBlockedRecipient(counterpart);
          if (isBlocked) {
            setThreats((prev) => [
              {
                address: counterpart,
                timestamp: Date.now(),
                hash: tx.hash,
              },
              ...prev,
            ]);
          }
        } catch (err) {
          console.error('Error checking scam list:', err);
        }
      });
    };

    startWatching();
  }, [address]);

  return (
    <div className="alert-box">
      <h3>🧠 Live Threat Feed</h3>
      {threats.length === 0 ? (
        <p>✅ No threats detected yet.</p>
      ) : (
        threats.map((alert, idx) => (
          <div
            key={idx}
            className="threat-card"
            style={{
              border: '1px solid #e53e3e',
              background: '#fff5f5',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px',
            }}
          >
            <strong style={{ color: '#c53030' }}>🚨 RISKY TRANSACTION DETECTED</strong>
            <p><strong>To:</strong> {alert.address}</p>
            <p>
              <strong>Tx Hash:</strong>{' '}
              <a href={`https://sepolia.etherscan.io/tx/${alert.hash}`} target="_blank" rel="noreferrer">
                {alert.hash}
              </a>
            </p>
            <p><strong>Detected:</strong> {getRelativeTime(alert.timestamp)}</p>
            <p style={{ fontWeight: 'bold', color: '#b83280' }}>⚠️ Threat Level: High Risk</p>
            <button
              onClick={() => navigator.clipboard.writeText(alert.address)}
              style={{
                marginTop: '8px',
                padding: '5px 10px',
                fontSize: '0.8rem',
                background: '#eee',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Copy Address
            </button>
          </div>
        ))
      )}
    </div>
  );
}
