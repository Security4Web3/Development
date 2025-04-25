import { ethers } from "ethers";

const GUARDIAN_ABI = [
  "function isBlockedRecipient(address recipient) view returns (bool)"
];

export function ReadGuardianContract() {
  if (!process.env.NEXT_PUBLIC_GUARDIAN_CONTRACT) {
    throw new Error("Guardian contract address missing in .env");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_GUARDIAN_CONTRACT,
    GUARDIAN_ABI,
    provider
  );

  return {
    read: {
      isBlockedRecipient: async (address: string) => {
        return await contract.isBlockedRecipient(address);
      }
    }
  };
}
