'use client';
import WalletInfo from '../components/WalletInfo';


export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">🛡️ MaskedGuardian</h1>
      <WalletInfo />
    </main>
  );
}
