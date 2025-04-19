'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Load Infura API key from environment
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID!;
const sepoliaRpcUrl = `https://sepolia.infura.io/v3/${infuraId}`;

// 2. Create wagmi config
const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});

// 3. React Query client
const queryClient = new QueryClient();

// 4. Web3Provider wrapper
export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
