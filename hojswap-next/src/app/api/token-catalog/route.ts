import { NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { SUPPORTED_CHAIN_IDS } from "@/lib/chains";

const LIFI_TOKENS_API = "https://li.quest/v1/tokens";
const MAX_TOKENS_PER_CHAIN = 2_500;
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
  tags?: string[];
};

type LiFiTokensResponse = { tokens?: Record<string, LiFiToken[]> };

function cleanText(value: string | undefined, maxLength: number) {
  return value?.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength) ?? "";
}

function cleanLogoUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || /dexscreener\.com$/i.test(url.hostname)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function priceUsd(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

// Tokenized equities are financial securities, not crypto assets supported by
// HOJ Swap. Prefer provider classifications, with naming checks as a fallback
// for providers that omit tags on individual listings.
const TOKENIZED_EQUITY_TERMS = /\b(?:stock|stocks|equity|equities|share|shares|xstock|tokenized\s+(?:stock|equity|share))\b/i;
const EQUITY_ISSUER_TERMS = /\b(?:apple|tesla|nvidia|microsoft|amazon|alphabet|google|meta\s+platforms|netflix|coinbase|strategy|microstrategy|berkshire|spdr|vanguard|invesco|nasdaq|s&p\s*500|dow\s+jones)\b/i;

function isTokenizedEquity(token: LiFiToken) {
  const tags = token.tags?.map((tag) => tag.toLowerCase()) ?? [];
  if (tags.some((tag) => /^(?:stock|stocks|equity|equities|share|shares|xstock)$/.test(tag))) return true;
  const description = `${token.symbol ?? ""} ${token.name ?? ""}`;
  return TOKENIZED_EQUITY_TERMS.test(description) || EQUITY_ISSUER_TERMS.test(description);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const chainId = Number(requestUrl.searchParams.get("chainId"));
  const summaryOnly = requestUrl.searchParams.get("summary") === "1";
  if (!Number.isInteger(chainId) || !SUPPORTED_CHAINS.has(chainId)) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    const apiKey = process.env.LIFI_API_KEY?.trim();
    if (apiKey) headers["x-lifi-api-key"] = apiKey;

    const response = await fetch(`${LIFI_TOKENS_API}?chains=${chainId}`, {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`LI.FI tokens ${response.status}`);

    const payload = await response.json() as LiFiTokensResponse;
    const upstreamTokens = payload.tokens?.[String(chainId)] ?? [];
    const seen = new Set<string>();
    const tokens = upstreamTokens
      .filter((token) => {
        const address = token.address?.toLowerCase();
        if (!address || !isAddress(address) || seen.has(address)) return false;
        if (token.chainId !== chainId || !token.symbol || !token.name) return false;
        if (isTokenizedEquity(token)) return false;
        if (!Number.isInteger(token.decimals) || token.decimals! < 0 || token.decimals! > 255) return false;
        seen.add(address);
        return true;
      })
      .slice(0, MAX_TOKENS_PER_CHAIN)
      .map((token) => ({
        symbol: cleanText(token.symbol, 24),
        name: cleanText(token.name, 80),
        address: token.address!.toLowerCase() === ZERO_ADDRESS ? undefined : getAddress(token.address!),
        decimals: token.decimals!,
        chainId,
        logo: cleanLogoUrl(token.logoURI),
        providerListed: true,
        priceUsd: priceUsd(token.priceUSD),
      }));

    if (summaryOnly) {
      return NextResponse.json(
        { count: tokens.length, source: "lifi" },
        { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
      );
    }

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
