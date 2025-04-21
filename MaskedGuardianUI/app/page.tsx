'use client';

import React from 'react';
import ConnectWallet from '../connect-wallet';
import TransactionRiskScanner from '../TransactionRiskScanner';
import './ui.css';

export default function Page() {
  return (
    <main className="page">
      <h1>🔒 MaskedGuardian</h1>

      <div className="card">
        <h2>1. Connect Wallet</h2>
        <ConnectWallet />
      </div>

      <div className="card">
        <h2>2. Transaction Risk Scanner</h2>
        <TransactionRiskScanner />
      </div>
    </main>
  );
}
