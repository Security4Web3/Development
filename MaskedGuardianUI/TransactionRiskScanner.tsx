'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Watcher } from '../MaskedGuardian - Wallet Security Analyst/library/TransactionMonitor';
import { ReadGuardianContract } from '../MaskedGuardian - Wallet Security Analyst/library/ReadGuardianContract';

type Alert = {
  address: string;
  timestamp: number;
  type: 'risky' | 'safe';
};

export default function TransactionRiskScanner() {
  const { address } = useAccount();
  const [alerts, setAlerts] = useState<Alert[]>([]);

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
          const type = isBlocked ? 'risky' : 'safe';

          setAlerts((prev) => [
            {
              address: counterpart,
              timestamp: Date.now(),
              type,
            },
            ...prev,
          ]);
        } catch (err) {
          console.error('Error checking scam list:', err);
        }
      });
    };

    startWatching();
  }, [address]);

  return (
    <div className="alert-box">
      <h3>Transaction Warnings</h3>
      {alerts.length === 0 ? (
        <p>✅ No risky activity detected.</p>
      ) : (
        alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`alert-card ${alert.type}`}
            style={{
              border: '1px solid',
              borderColor: alert.type === 'risky' ? '#e53e3e' : '#38a169',
              background: alert.type === 'risky' ? '#fff5f5' : '#f0fff4',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '10px',
            }}
          >
            <strong>{alert.type === 'risky' ? '🚨 RISKY TRANSACTION' : '✅ Verified Transaction'}</strong>
            <p><strong>Address:</strong> {alert.address}</p>
            <button
              onClick={() => navigator.clipboard.writeText(alert.address)}
              style={{
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
