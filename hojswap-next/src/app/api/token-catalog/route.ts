import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { SUPPORTED_CHAIN_IDS } from "@/lib/chains";

const LIFI_TOKENS_API = "https://li.quest/v1/tokens";
const MAX_TOKENS_PER_CHAIN = 1_500;
const SUPPORTED_CHAINS = new Set<number>(SUPPORTED_CHAIN_IDS);
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type LiFiToken = {
  address?: string;
  chainId?: number;
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string;
  priceUSD?: string;
};

type LiFiTokensResponse = { tokens?: Record<string, LiFiToken[]> };

function cleanText(value: string | undefined, maxLength: number) {
  return value?.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength) ?? "";
}

export async function GET(request: Request) {
  const chainId = Number(new URL(request.url).searchParams.get("chainId"));
  if (!Number.isInteger(chainId) || !SUPPORTED_CHAINS.has(chainId)) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    const apiKey = process.env.LIFI_API_KEY?.trim();
    if (apiKey) headers["x-lifi-api-key"] = apiKey;

    const response = await fetch(`${LIFI_TOKENS_API}?chains=${chainId}`, {
      headers,
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`LI.FI tokens ${response.status}`);

    const payload = await response.json() as LiFiTokensResponse;
    const upstreamTokens = payload.tokens?.[String(chainId)] ?? [];
    const seen = new Set<string>();
    const tokens = upstreamTokens
      .filter((token) => {
        const address = token.address?.toLowerCase();
        if (!address || address === ZERO_ADDRESS || !isAddress(address) || seen.has(address)) return false;
        if (token.chainId !== chainId || !token.symbol || !token.name) return false;
        if (!Number.isInteger(token.decimals) || token.decimals! < 0 || token.decimals! > 255) return false;
        seen.add(address);
        return true;
      })
      .slice(0, MAX_TOKENS_PER_CHAIN)
      .map((token) => ({
        symbol: cleanText(token.symbol, 24),
        name: cleanText(token.name, 80),
        address: token.address!.toLowerCase(),
        decimals: token.decimals!,
        chainId,
        logo: token.logoURI?.startsWith("https://") ? token.logoURI : undefined,
        providerListed: true,
      }));

    return NextResponse.json(
      { tokens, count: tokens.length, source: "lifi" },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
    );
  } catch (error) {
    console.error("[TOKEN CATALOG API]", error);
    return NextResponse.json(
      { tokens: [], count: 0, source: "fallback", warning: "Provider token catalog is temporarily unavailable" },
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  }
}
