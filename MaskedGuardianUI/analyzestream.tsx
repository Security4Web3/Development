'use client';

import React, { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { WriteGuardianContract } from '../MaskedGuardian - Wallet Security Analyst/library/WriteGuardianContract';

export default function AnalyzeStream() {
  const [streamId, setStreamId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  const handleAnalyze = async () => {
    if (!walletClient || !streamId) return;
    try {
      const contract = WriteGuardianContract(walletClient);
      await contract.write.analyzeAndPause(BigInt(streamId));
      setStatus('✅ Stream analyzed and paused if needed');
    } catch (err: any) {
      console.error('Error analyzing stream:', err);
      setStatus('❌ Error or no suspicious activity');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 className="text-xl font-semibold mb-2">Analyze Stream</h2>
      <input
        type="text"
        placeholder="Enter Stream ID"
        value={streamId}
        onChange={(e) => setStreamId(e.target.value)}
        className="border p-2 rounded mr-2"
      />
      <button onClick={handleAnalyze} className="bg-blue-500 text-white px-4 py-2 rounded">
        Analyze & Pause
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
