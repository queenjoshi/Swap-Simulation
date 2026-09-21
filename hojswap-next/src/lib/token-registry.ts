import { createPublicClient, http, isAddress, parseAbi, type Address } from "viem";
import { getRpcUrl, getViemChain } from "./rpc";
import type { Token } from "./tokens";

export function registryAddress(chainId: number): Address | undefined {
  const value = process.env[`TOKEN_REGISTRY_${chainId}`] ?? (chainId === 5042 ? "0x6aCaf964bCf4551CC55Afaf12d6e6a8ef7138875" : undefined);
  if (value && !isAddress(value)) throw new Error("Invalid token registry configuration");
  return value as Address | undefined;
}

export const registryAbi = parseAbi([
  "function getVerifiedTokens() view returns ((address token,string symbol,string name,uint8 decimals,bool active)[])",
  "function isVerifiedToken(address token) view returns (bool)",
]);

export async function registryTokens(chainId: number): Promise<Token[] | null> {
  const address = registryAddress(chainId);
  if (!address) return null;
  const client = createPublicClient({ chain: getViemChain(chainId), transport: http(getRpcUrl(chainId), { timeout: 10000, retryCount: 1 }) });
  if (await client.getChainId() !== chainId) throw new Error("Registry RPC chain mismatch");
  const tokens = await client.readContract({ address, abi: registryAbi, functionName: "getVerifiedTokens" });
  return tokens.filter(t => t.active).map(t => ({ address: t.token, symbol: t.symbol, name: t.name, decimals: t.decimals, chainId }));
}

export async function validateRegistryPair(chainId: number, sell: string, buy: string) {
  const tokens = await registryTokens(chainId);
  if (tokens === null) return;
  const allowed = new Set(tokens.map(t => t.address!.toLowerCase()));
  // Arc native USDC and its ERC-20 representation share a balance: only the ERC-20 route is offered.
  if (chainId !== 5042) allowed.add("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
  if (!allowed.has(sell.toLowerCase()) || !allowed.has(buy.toLowerCase())) {
    throw new Error("Token is not active in this chain's registry. Choose a listed token; removed and unregistered tokens cannot be quoted.");
  }
}
