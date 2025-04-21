// WriteGuardianContract.ts
import { getContract, type WalletClient } from 'viem';
import type { Abi } from 'viem';
import abiJson from '../contracts/MaskedGuardianABI.json';

const abi = abiJson as Abi;

export function WriteGuardianContract(walletClient: WalletClient) {
  return {
    write: {
      setGuardianStatus: (address: `0x${string}`) =>
        walletClient.writeContract({
          address: '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838',
          abi,
          functionName: 'setBlockedRecipient', // ✅ correct function
          args: [address, true],
          account: walletClient.account?.address as `0x${string}`,
          chain: undefined,
        }),
        

      analyzeAndPause: (streamId: bigint) =>
        walletClient.writeContract({
          address: '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838',
          abi,
          functionName: 'analyzeAndPause', // ✅ now added
          args: [streamId],
          account: walletClient.account?.address as `0x${string}`,
          chain: undefined,
        }),
    },
  };
}

