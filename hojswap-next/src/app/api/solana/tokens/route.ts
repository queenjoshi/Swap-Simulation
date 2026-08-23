import { NextResponse } from "next/server";
import { SOLANA_CORE_FALLBACK, type SolanaToken } from "@/lib/solana";

const JUPITER_TOKENS_URL = "https://api.jup.ag/tokens/v2/tag?query=verified";
const JUPITER_SEARCH_URL = "https://api.jup.ag/tokens/v2/search";
const CORE_SYMBOLS = new Set(["SOL", "USDC", "USDT", "JUP", "JITOSOL", "MSOL", "JTO", "RAY", "ORCA", "PYTH", "KMNO", "HNT", "WIF", "BONK", "PUMP", "PENGU", "POPCAT", "MEW", "FARTCOIN", "PNUT", "GOAT", "MOODENG", "DRIFT", "TNSR", "MNDE", "BIRB", "MET", "MPLX", "DOOD"]);
const MIN_COMMUNITY_LIQUIDITY_USD = 25_000;

type JupiterToken = {
  id?: string;
  symbol?: string;
  name?: string;
  icon?: string;
  decimals?: number;
  liquidity?: number;
  isVerified?: boolean;
  tags?: string[];
  organicScore?: number;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ tokens: SOLANA_CORE_FALLBACK, source: "fallback", warning: "Jupiter API key is not configured" });
  }

  try {
    const query = new URL(request.url).searchParams.get("query")?.trim().slice(0, 80) ?? "";
    const url = query.length >= 2 ? `${JUPITER_SEARCH_URL}?query=${encodeURIComponent(query)}` : JUPITER_TOKENS_URL;
    const response = await fetch(url, {
      headers: { Accept: "application/json", "x-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Jupiter tokens ${response.status}`);
    const payload = await response.json() as JupiterToken[];

    const tokens = payload
      .filter((token) => {
        const symbol = token.symbol?.toUpperCase() ?? "";
        const tags = token.tags ?? [];
        const community = tags.includes("community") && (token.liquidity ?? 0) >= MIN_COMMUNITY_LIQUIDITY_USD;
        const verified = token.isVerified || tags.includes("verified");
        return Boolean(token.id && token.symbol && token.name && verified && (query.length >= 2 || CORE_SYMBOLS.has(symbol) || community));
      })
      .sort((a, b) => {
        const aCore = CORE_SYMBOLS.has(a.symbol?.toUpperCase() ?? "");
        const bCore = CORE_SYMBOLS.has(b.symbol?.toUpperCase() ?? "");
        if (aCore !== bCore) return aCore ? -1 : 1;
        return (b.liquidity ?? 0) - (a.liquidity ?? 0);
      })
      .slice(0, query.length >= 2 ? 50 : 150)
      .map<SolanaToken>((token) => ({
        mint: token.id!,
        symbol: token.symbol!,
        name: token.name!,
        decimals: token.decimals ?? 9,
        logo: token.icon,
        verified: true,
        tags: token.tags ?? [],
        liquidity: token.liquidity ?? 0,
      }));

    const merged = new Map(SOLANA_CORE_FALLBACK.map((token) => [token.mint, token]));
    for (const token of tokens) merged.set(token.mint, { ...merged.get(token.mint), ...token });
    return NextResponse.json({ tokens: [...merged.values()], source: "jupiter" });
  } catch (error) {
    console.error("[SOLANA TOKENS]", error);
    return NextResponse.json({ tokens: SOLANA_CORE_FALLBACK, source: "fallback", warning: "Jupiter token registry is temporarily unavailable" });
  }
}
