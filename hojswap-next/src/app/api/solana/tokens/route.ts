import { NextResponse } from "next/server";
import { SOLANA_CORE_FALLBACK, type SolanaToken } from "@/lib/solana";

const JUPITER_TOKENS_URL = "https://api.jup.ag/tokens/v2/tag?query=verified";
const JUPITER_SEARCH_URL = "https://api.jup.ag/tokens/v2/search";
const OPENSEA_TOKENS_URLS = [
  "https://api.opensea.io/api/v2/tokens/trending?chains=solana&limit=100",
  "https://api.opensea.io/api/v2/tokens/top?chains=solana&limit=100",
];
const CORE_SYMBOLS = new Set(["SOL", "USDC", "USDT", "JUP", "JITOSOL", "MSOL", "JTO", "RAY", "ORCA", "PYTH", "KMNO", "HNT", "WIF", "BONK", "PUMP", "PENGU", "POPCAT", "MEW", "FARTCOIN", "PNUT", "GOAT", "MOODENG", "DRIFT", "TNSR", "MNDE", "BIRB", "MET", "MPLX", "DOOD"]);
const MIN_COMMUNITY_LIQUIDITY_USD = 25_000;
const MIN_OPENSEA_VOLUME_24H_USD = 25_000;

type JupiterToken = {
  id?: string;
  symbol?: string;
  name?: string;
  icon?: string;
  decimals?: number;
  liquidity?: number;
  isVerified?: boolean;
  tags?: string[];
};

type OpenSeaToken = {
  address?: string;
  chain?: string;
  name?: string;
  symbol?: string;
  image_url?: string;
  decimals?: number;
  volume_24h?: number;
  is_verified?: boolean;
};

type OpenSeaResponse = { tokens?: OpenSeaToken[] };

export const dynamic = "force-dynamic";

function isSolanaMint(value: string | undefined): value is string {
  return Boolean(value && value.length >= 32 && value.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value));
}

async function fetchJupiterTokens(query: string): Promise<SolanaToken[]> {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) return [];

  const url = query.length >= 2 ? `${JUPITER_SEARCH_URL}?query=${encodeURIComponent(query)}` : JUPITER_TOKENS_URL;
  const response = await fetch(url, {
    headers: { Accept: "application/json", "x-api-key": apiKey },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Jupiter tokens ${response.status}`);
  const payload = await response.json() as JupiterToken[];

  return payload
    .filter((token) => {
      const symbol = token.symbol?.toUpperCase() ?? "";
      const tags = token.tags ?? [];
      const community = tags.includes("community") && (token.liquidity ?? 0) >= MIN_COMMUNITY_LIQUIDITY_USD;
      const verified = token.isVerified || tags.includes("verified");
      return Boolean(isSolanaMint(token.id) && token.symbol && token.name && verified && (query.length >= 2 || CORE_SYMBOLS.has(symbol) || community));
    })
    .sort((a, b) => {
      const aCore = CORE_SYMBOLS.has(a.symbol?.toUpperCase() ?? "");
      const bCore = CORE_SYMBOLS.has(b.symbol?.toUpperCase() ?? "");
      if (aCore !== bCore) return aCore ? -1 : 1;
      return (b.liquidity ?? 0) - (a.liquidity ?? 0);
    })
    .slice(0, query.length >= 2 ? 50 : 150)
    .map((token) => ({
      mint: token.id!,
      symbol: token.symbol!,
      name: token.name!,
      decimals: token.decimals ?? 9,
      logo: token.icon,
      verified: true,
      tags: token.tags ?? [],
      liquidity: token.liquidity ?? 0,
    }));
}

async function fetchOpenSeaTokens(): Promise<SolanaToken[]> {
  const apiKey = process.env.OPENSEA_API_KEY;
  if (!apiKey) return [];

  const responses = await Promise.allSettled(OPENSEA_TOKENS_URLS.map(async (url) => {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`OpenSea tokens ${response.status}`);
    return response.json() as Promise<OpenSeaResponse>;
  }));

  const byMint = new Map<string, OpenSeaToken>();
  for (const result of responses) {
    if (result.status !== "fulfilled") continue;
    for (const token of result.value.tokens ?? []) {
      if (token.chain === "solana" && isSolanaMint(token.address)) byMint.set(token.address, token);
    }
  }

  return [...byMint.values()]
    .filter((token) => token.name && token.symbol && token.image_url
      && (token.is_verified || (token.volume_24h ?? 0) >= MIN_OPENSEA_VOLUME_24H_USD))
    .sort((a, b) => Number(b.is_verified) - Number(a.is_verified) || (b.volume_24h ?? 0) - (a.volume_24h ?? 0))
    .map((token) => ({
      mint: token.address!,
      symbol: token.symbol!,
      name: token.name!,
      decimals: token.decimals ?? 9,
      logo: token.image_url,
      verified: token.is_verified ?? false,
      tags: token.is_verified ? ["verified", "opensea"] : ["community", "opensea", "trending"],
      liquidity: 0,
    }));
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim().slice(0, 80) ?? "";
  const warnings: string[] = [];
  const [jupiterResult, openSeaResult] = await Promise.allSettled([
    fetchJupiterTokens(query),
    query.length >= 2 ? Promise.resolve([]) : fetchOpenSeaTokens(),
  ]);

  if (jupiterResult.status === "rejected") {
    console.error("[SOLANA TOKENS/JUPITER]", jupiterResult.reason);
    warnings.push("Jupiter token registry is temporarily unavailable");
  }
  if (openSeaResult.status === "rejected") {
    console.error("[SOLANA TOKENS/OPENSEA]", openSeaResult.reason);
    warnings.push("OpenSea token registry is temporarily unavailable");
  }

  const openSeaTokens = openSeaResult.status === "fulfilled" ? openSeaResult.value : [];
  const jupiterTokens = jupiterResult.status === "fulfilled" ? jupiterResult.value : [];
  const merged = new Map(SOLANA_CORE_FALLBACK.map((token) => [token.mint, token]));
  for (const token of openSeaTokens) merged.set(token.mint, { ...merged.get(token.mint), ...token });
  for (const token of jupiterTokens) merged.set(token.mint, { ...merged.get(token.mint), ...token });

  const sources = [openSeaTokens.length > 0 && "opensea", jupiterTokens.length > 0 && "jupiter"].filter(Boolean);
  return NextResponse.json(
    {
      tokens: [...merged.values()],
      source: sources.length > 0 ? sources.join("+") : "fallback",
      ...(warnings.length > 0 ? { warning: warnings.join("; ") } : {}),
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
