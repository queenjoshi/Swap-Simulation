import { createPublicClient, http, isAddress, parseAbi } from "viem";
import { getRpcUrl, getViemChain } from "./rpc";
import type { QuoteResponse } from "./quote";

export async function validateQuoteRoute(chainId: number, router: `0x${string}`, quote: QuoteResponse, sellToken: string) {
  if (!quote.liquidityAvailable) throw new Error("No executable liquidity is available for this pair.");
  const target = quote.transaction?.to;
  const native = sellToken.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const spender = native ? "0x0000000000000000000000000000000000000000" : quote.issues?.allowance?.spender;
  if (!target || !isAddress(target) || !spender || !isAddress(spender) || !/^0x(?:[0-9a-f]{2}){4,}$/i.test(quote.transaction?.data ?? "")) throw new Error("The provider returned an incomplete transaction.");
  const client = createPublicClient({ chain: getViemChain(chainId), transport: http(getRpcUrl(chainId), { timeout: 10000, retryCount: 1 }) });
  if (await client.getChainId() !== chainId) throw new Error("RPC chain mismatch.");
  const abi = parseAbi(["function paused() view returns (bool)", "function approvedRouterSpenders(address,address) view returns (bool)"]);
  const [paused, approved] = await Promise.all([
    client.readContract({ address: router, abi, functionName: "paused" }),
    client.readContract({ address: router, abi, functionName: "approvedRouterSpenders", args: [target, spender] }),
  ]);
  if (paused) throw new Error("The HOJ router is paused.");
  if (!approved) throw new Error("Route target/spender is not approved by the HOJ router. The owner must review this pair before trading.");
}
