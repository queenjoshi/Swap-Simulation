import { isAddress } from "viem";
import { SWAP_SUPPORTED_CHAIN_IDS } from "./chains";

export function invalidSwapRequest(body: unknown, requireTaker = false): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Expected a swap request object.";
  const b = body as Record<string, unknown>;
  if (!Number.isInteger(Number(b.chainId)) || !SWAP_SUPPORTED_CHAIN_IDS.includes(Number(b.chainId))) return "Unsupported swap network.";
  for (const key of ["sellToken", "buyToken"]) {
    if (typeof b[key] !== "string" || !isAddress(b[key] as string) || /^0x0{40}$/i.test(b[key] as string)) return "Invalid token address.";
  }
  if ((b.sellToken as string).toLowerCase() === (b.buyToken as string).toLowerCase()) return "Choose two different tokens.";
  if (typeof b.sellAmount !== "string" || !/^[1-9]\d{0,77}$/.test(b.sellAmount) || BigInt(b.sellAmount) >= 2n ** 256n) return "Amount must be a positive uint256 in token base units.";
  const slippage = Number(b.slippageBps ?? 100);
  if (!Number.isInteger(slippage) || slippage < 1 || slippage > 500) return "Slippage must be between 1 and 500 basis points (5%).";
  if ((requireTaker || b.taker !== undefined) && (typeof b.taker !== "string" || !isAddress(b.taker) || /^0x0{40}$/i.test(b.taker))) return "Connect a valid wallet before requesting an executable quote.";
  return null;
}
