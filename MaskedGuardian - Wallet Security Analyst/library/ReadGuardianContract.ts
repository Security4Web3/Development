// ReadGuardianContract.ts

import { readContract } from 'wagmi/actions';
import abiJson from '../contracts/MaskedGuardianABI.json';
import type { Abi } from 'viem';
import { config } from './wagmi-config'; // make sure wagmi-config.ts exists in root or update path

export const guardianAddress = '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838';
export const guardianAbi = abiJson as Abi;

export function ReadGuardianContract() {
  return {
    read: {
      isBlockedRecipient: async (address: string) =>
        readContract(config, {
          address: guardianAddress,
          abi: guardianAbi,
          functionName: 'isBlockedRecipient',
          args: [address],
        }),
    },
  };
}
