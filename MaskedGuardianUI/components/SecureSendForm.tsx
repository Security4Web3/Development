"use client";

import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { checkAddressWithChainabuse } from "../utils/checkAddressWithChainabuse";
import { ReadGuardianContract } from "../components/contracts";

export default function SecureSendForm() {
  const { address } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const [to, setTo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!address || !to || !amount) {
      setError("Missing required fields.");
      return;
    }

    const contract = ReadGuardianContract();

    try {
      const isBlocked = await contract.read.isBlockedRecipient(to.toLowerCase());
      const isChainAbuse = await checkAddressWithChainabuse(to.toLowerCase());

      if (isBlocked || isChainAbuse) {
        setError("⚠️ Cannot send: address flagged as dangerous.");
        return;
      }

      const tx = await sendTransaction({
        to: to as `0x${string}`, // fixed typing
        value: parseEther(amount),
      });

      console.log("✅ Tx submitted:", tx);
      setError(null);
    } catch (err) {
      console.error("Transaction error:", err);
      setError("Transaction failed.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Secure Send</h2>

      <input
        type="text"
        placeholder="Recipient Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send Securely
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
