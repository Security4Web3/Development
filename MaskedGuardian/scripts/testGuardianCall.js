const { ethers } = require("ethers");
require("dotenv").config();

const abi = [
  "function setBlockedRecipient(address recipient, bool blocked) external",
  "function isBlockedRecipient(address recipient) view returns (bool)",
  "function guardian() view returns (address)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const guardianContract = new ethers.Contract(
    process.env.GUARDIAN_CONTRACT,
    abi,
    wallet
  );

  console.log("👤 Guardian address (on-chain):", await guardianContract.guardian());
  console.log("🔑 Wallet address:", wallet.address);

  if ((await guardianContract.guardian()).toLowerCase() !== wallet.address.toLowerCase()) {
    console.log("❌ This wallet is NOT the guardian. Access will be denied.");
    return;
  }

  const testAddress = "0x000000000000000000000000000000000000dEaD";
  console.log(`🚨 Trying to block ${testAddress}...`);

  const tx = await guardianContract.setBlockedRecipient(testAddress, true);
  await tx.wait();

  const isBlocked = await guardianContract.isBlockedRecipient(testAddress);
  console.log(`✅ Blocked: ${isBlocked}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
});
