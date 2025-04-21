import axios from 'axios';

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY!;
const network = 'sepolia'; // change to 'mainnet' for Ethereum mainnet

export async function getTransactionHistory(address: string) {
  const url = `https://api-${network}.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
  const res = await axios.get(url);
  return res.data.result;
}

export function Watcher(address: string, callback: (tx: any) => void) {
  let lastTxHash = '';

  setInterval(async () => {
    try {
      const txs = await getTransactionHistory(address);
      if (txs.length && txs[0].hash !== lastTxHash) {
        lastTxHash = txs[0].hash;
        callback(txs[0]);
      }
    } catch (err) {
      console.error('Error polling txs:', err);
    }
  }, 10000); // check every 10 seconds
}
