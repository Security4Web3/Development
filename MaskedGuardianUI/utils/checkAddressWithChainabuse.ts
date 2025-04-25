export async function checkAddressWithChainabuse(address: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/chainabuse/ethereum/${address}`);
      const data = await res.json();
      return data?.reports?.length > 0;
    } catch (err) {
      console.error("Chainabuse check failed:", err);
      return false;
    }
  }
  