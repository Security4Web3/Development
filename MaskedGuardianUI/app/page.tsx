import ConnectWallet from '../connect-wallet';
import React from 'react';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">Welcome to MaskedGuardian</h1>
      <ConnectWallet />
    </main>
  );
}
