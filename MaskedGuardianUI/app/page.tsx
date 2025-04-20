import React from 'react';
import ConnectWallet from '../connect-wallet';
import AnalyzeStream from '../analyzestream';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-2xl font-bold mb-4">🧠 MaskedGuardian Wallet Analyst</h1>
      <ConnectWallet />
      <AnalyzeStream />
    </main>
  );
}
