import axios from "axios";

export async function fetchChainabuseAddresses(): Promise<string[]> {
  const authKey = btoa(`${process.env.NEXT_PUBLIC_CHAINABUSE_API_KEY}:${process.env.NEXT_PUBLIC_CHAINABUSE_API_KEY}`);

  const res = await axios.get('https://api.chainabuse.com/api/v1/reports/search', {
    headers: {
      Authorization: `Basic ${authKey}`,
    },
    params: {
      asset: 'ethereum',
      type: 'scam',
      limit: 100,
    },
  });

  const addresses: string[] = res.data.data
    .map((entry: any) => typeof entry?.address === 'string' ? entry.address.toLowerCase() : null)
    .filter((addr: string | null): addr is string => !!addr);

  return [...new Set(addresses)];
}
