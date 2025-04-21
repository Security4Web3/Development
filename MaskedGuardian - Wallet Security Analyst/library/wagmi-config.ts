// wagmi-config.ts
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID!;
const sepoliaRpcUrl = `https://sepolia.infura.io/v3/${infuraId}`;

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});
