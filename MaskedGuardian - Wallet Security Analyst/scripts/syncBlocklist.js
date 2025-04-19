const axios = require("axios");
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const guardianAbi = [
    "function setBlockedRecipient(address recipient, bool blocked) external",
    "function isBlockedRecipient(address recipient) view returns (bool)"
  ];

  const guardian = new ethers.Contract(
    process.env.GUARDIAN_CONTRACT,
    guardianAbi,
    wallet
  );

  console.log("📡 Fetching scam address list from ScamSniffer...");

  const url = "https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json";
  const response = await axios.get(url);
  const scamAddresses = response.data;

  console.log(`🔢 Total scam addresses fetched: ${scamAddresses.length}`);

  let count = 0;
  for (const address of scamAddresses) {
    if (!ethers.isAddress(address)) continue;

    try {
      const isAlreadyBlocked = await guardian.isBlockedRecipient(address);
      if (isAlreadyBlocked) {
        console.log(`⚠️ Already blocked: ${address}`);
        continue;
      }

      console.log(`🚨 Blocking ${address}`);
      const tx = await guardian.setBlockedRecipient(address, true);
      await tx.wait();
      count++;
    } catch (err) {
      console.warn(`⚠️ Error blocking ${address}: ${err.message}`);
    }
  }

  console.log(`✅ Done! Blocked ${count} new scam addresses.`);
}

main().catch((err) => {
  console.error("❌ Script error:", err.message);
});
