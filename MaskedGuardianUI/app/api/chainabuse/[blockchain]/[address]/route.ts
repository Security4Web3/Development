import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(
  req: NextRequest,
  { params }: { params: { blockchain: string; address: string } }
) {
  const { blockchain, address } = params;
  const apiKey = process.env.CHAINABUSE_API_KEY;

  console.log("📡 Checking address:", address);
  console.log("🔗 Blockchain:", blockchain);
  console.log("🔑 Using API key:", apiKey ? "✅ Loaded" : "❌ Missing");

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
    });
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiKey}`).toString('base64');
    const response = await axios.get(
      `https://api.chainabuse.com/api/v1/reports/screen/address/${blockchain}/${address}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error("❌ Chainabuse API error:", err.response?.data || err.message);
    return new Response(
      JSON.stringify({ error: "Chainabuse fetch failed" }),
      { status: err.response?.status || 500 }
    );
  }
}
