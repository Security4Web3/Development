"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Watcher from "./components/watcher";
import { ReadGuardianContract } from "./components/contracts";
import { checkAddressWithChainabuse } from "./utils/checkAddressWithChainabuse";

export default function TransactionRiskScanner() {
  const { address } = useAccount();
  const [threats, setThreats] = useState<
    { address: string; timestamp: number; hash: string }[]
  >([]);

  useEffect(() => {
    if (!address) return;

    const startWatching = async () => {
      const contract = ReadGuardianContract();

      Watcher(
        address,
        async (tx) => {
          // Outbound pending transaction
          const to = tx.to?.toLowerCase?.();
          const me = address.toLowerCase();

          if (!to || to === "0x0000000000000000000000000000000000000000") {
            console.warn("⚠️ Skipped tx: invalid recipient.");
            return;
          }

          console.log("🚀 Outbound transaction detected:", to);

          let isBlocked = false;
          let isChainAbuse = false;

          try {
            isBlocked = await contract.read.isBlockedRecipient(to);
          } catch (err) {
            console.warn("🛑 Guardian contract read failed:", err);
          }

          try {
            isChainAbuse = await checkAddressWithChainabuse(to);
          } catch (err) {
            console.warn("🛑 ChainAbuse API check failed:", err);
          }

          console.log("🔒 isBlocked?", isBlocked);
          console.log("🧪 isChainAbuse?", isChainAbuse);

          if (isBlocked || isChainAbuse) {
            console.log("🚨 Threat detected on outbound tx, pushing to feed");
            setThreats((prev) => [
              {
                address: to,
                timestamp: Date.now(),
                hash: tx.hash,
              },
              ...prev,
            ]);
          } else {
            console.log("✅ Outbound tx safe — no threat detected");
          }
        },
        (tx) => {
          // Inbound confirmed transaction
          console.log("📩 Inbound tx confirmed from:", tx.from);
          // (Optional) you can display notifications here if you want
        }
      );
    };

    startWatching();
  }, [address]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🚨 Live Threat Feed</h2>
      {threats.length === 0 ? (
        <p className="text-gray-500">No threats detected yet.</p>
      ) : (
        <ul className="space-y-2">
          {threats.map((threat, idx) => (
            <li
              key={`${threat.address}-${idx}`}
              className="bg-red-100 p-3 rounded-lg shadow"
            >
              <p>
                <strong>Scam Address:</strong> {threat.address}
              </p>
              <p>
                <strong>Tx Hash:</strong>{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${threat.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {threat.hash.slice(0, 10)}...
                </a>
              </p>
              <p className="text-sm text-gray-500">
                Detected: {new Date(threat.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
