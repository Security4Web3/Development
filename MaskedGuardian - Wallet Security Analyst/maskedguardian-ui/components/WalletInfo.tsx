'use client';

import { useAccount } from 'wagmi';

export default function WalletInfo() {
  const { address, isConnected } = useAccount();

  return (
    <div className="p-4 rounded-xl bg-white shadow-md">
      <h2 className="text-lg font-semibold mb-2">🧾 Wallet Info</h2>
      {isConnected ? (
        <p className="break-all">Connected as: {address}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
}
