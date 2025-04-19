'use client';

import { ReactNode } from 'react';
import {
  WagmiConfig,
  chain,
  configureChains,
  createClient,
} from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';

const { chains, provider } = configureChains(
  [chain.sepolia],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'MaskedGuardian',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
