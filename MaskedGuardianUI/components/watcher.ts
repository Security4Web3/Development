import { WebSocketProvider, JsonRpcProvider, TransactionResponse } from "ethers";

const SEPOLIA_WSS = `wss://sepolia.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`;
const SEPOLIA_HTTPS = `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`;

export default function Watcher(
  userAddress: string,
  onOutboundPending: (tx: TransactionResponse) => void,
  onInboundConfirmed: (tx: TransactionResponse) => void
) {
  const wsProvider = new WebSocketProvider(SEPOLIA_WSS);
  const rpcProvider = new JsonRpcProvider(SEPOLIA_HTTPS);
  const normalizedUser = userAddress.toLowerCase();

  // OUTBOUND: Watch pending transactions
  wsProvider.on("pending", async (txHash: string) => {
    try {
      const tx = await rpcProvider.getTransaction(txHash);  // <-- FETCH real tx
      if (!tx) return;

      if (tx.from?.toLowerCase() === normalizedUser) {
        onOutboundPending(tx);  // <-- Now a real TransactionResponse
      }
    } catch (err) {
      console.warn("⚠️ Error handling pending tx:", err);
    }
  });

  // INBOUND: Watch confirmed transactions (in blocks)
  wsProvider.on("block", async (blockNumber: number) => {
    try {
      const block = await rpcProvider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      for (const tx of block.transactions as unknown as TransactionResponse[]) {
        if (tx.to?.toLowerCase() === normalizedUser) {
          onInboundConfirmed(tx);
        }
      }
    } catch (err) {
      console.warn("⚠️ Error processing block:", err);
    }
  });
}
