const axios = require("axios");
const { ethers } = require("ethers");
require('dotenv').config({ path: '../MaskedGuardianUI/.env.local' });


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

  console.log("📡 Fetching scam address list from Chainabuse...");

  const response = await axios.get('https://api.chainabuse.com/api/v1/reports/search', {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.CHAINABUSE_API_KEY}:${process.env.CHAINABUSE_API_KEY}`).toString('base64')}`
    },
    params: {
      asset: 'ethereum',
      type: 'scam',
      limit: 100  // adjust if needed
    }
  });

  const scamAddresses = response.data.data.map(report => report.address.toLowerCase());
  const uniqueAddresses = [...new Set(scamAddresses)];

  console.log(`🔢 Total scam addresses fetched: ${uniqueAddresses.length}`);

  let count = 0;
  for (const address of uniqueAddresses) {
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
