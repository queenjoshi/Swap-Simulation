import { NextResponse } from "next/server";
import { createPublicClient, erc20Abi, http, isAddress } from "viem";
import { getRpcUrl, getViemChain } from "@/lib/rpc";

const DEXSCREENER_CHAIN_BY_ID: Record<number, string> = {
  1: "ethereum", 10: "optimism", 25: "cronos", 56: "bsc", 130: "unichain",
  137: "polygon", 143: "monad", 146: "sonic", 480: "worldchain", 999: "hyperevm",
  4663: "robinhood", 5000: "mantle", 8453: "base", 9745: "plasma",
  42161: "arbitrum", 43114: "avalanche", 57073: "ink", 59144: "linea",
  80094: "berachain", 534352: "scroll", 7777777: "zora",
};

const MIN_LIQUIDITY_USD = 25_000;
const MIN_VOLUME_24H_USD = 10_000;
const MAX_TOKENS = 8;

type Boost = { chainId?: string; tokenAddress?: string; description?: string };
type PairToken = { address?: string; name?: string; symbol?: string };
type Pair = {
  chainId?: string;
  baseToken?: PairToken;
  quoteToken?: PairToken;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  info?: { imageUrl?: string };
};

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

const MEME_TERMS = /\b(meme|memecoin|dog|doge|cat|kitty|inu|shib|pepe|frog|wojak|bonk|floki|chimp|ape|degen)\b/i;

function looksLikeMeme(boost: Boost | undefined, token: PairToken | undefined) {
  return MEME_TERMS.test(`${token?.symbol ?? ""} ${token?.name ?? ""} ${boost?.description ?? ""}`);
}

export async function GET(request: Request) {
  const chainId = Number(new URL(request.url).searchParams.get("chainId"));
  const chainSlug = DEXSCREENER_CHAIN_BY_ID[chainId];
  if (!chainSlug) return NextResponse.json([], { headers: { "Cache-Control": "public, max-age=300" } });

  try {
    const [topResponse, latestResponse] = await Promise.all([
      fetch("https://api.dexscreener.com/token-boosts/top/v1", { next: { revalidate: 300 } }),
      fetch("https://api.dexscreener.com/token-boosts/latest/v1", { next: { revalidate: 300 } }),
    ]);
    if (!topResponse.ok && !latestResponse.ok) throw new Error("Trending feeds are unavailable");

    const boosts = [
      ...(topResponse.ok ? await topResponse.json() as Boost[] : []),
      ...(latestResponse.ok ? await latestResponse.json() as Boost[] : []),
    ];
    const addresses = [...new Set(
      boosts
        .filter((boost) => boost.chainId === chainSlug && boost.tokenAddress && isAddress(boost.tokenAddress))
        .map((boost) => boost.tokenAddress!.toLowerCase()),
    )].slice(0, 30);
    const boostByAddress = new Map(
      boosts
        .filter((boost) => boost.tokenAddress)
        .map((boost) => [boost.tokenAddress!.toLowerCase(), boost]),
    );
    if (addresses.length === 0) return NextResponse.json([], { headers: { "Cache-Control": "public, max-age=300" } });

    const pairsResponse = await fetch(
      `https://api.dexscreener.com/tokens/v1/${chainSlug}/${addresses.join(",")}`,
      { next: { revalidate: 300 } },
    );
    if (!pairsResponse.ok) throw new Error("Trending token markets are unavailable");
    const pairs = await pairsResponse.json() as Pair[];

    const bestPairByAddress = new Map<string, Pair>();
    for (const pair of pairs) {
      for (const token of [pair.baseToken, pair.quoteToken]) {
        const address = token?.address?.toLowerCase();
        if (!address || !addresses.includes(address)) continue;
        const current = bestPairByAddress.get(address);
        if (!current || numberOrZero(pair.liquidity?.usd) > numberOrZero(current.liquidity?.usd)) {
          bestPairByAddress.set(address, pair);
        }
      }
    }

    const candidates = addresses
      .map((address) => {
        const pair = bestPairByAddress.get(address);
        const pairToken = pair?.baseToken?.address?.toLowerCase() === address ? pair.baseToken : pair?.quoteToken;
        return { address, pair, pairToken };
      })
      .filter(({ address, pair, pairToken }) => pair
        && looksLikeMeme(boostByAddress.get(address), pairToken)
        && numberOrZero(pair.liquidity?.usd) >= MIN_LIQUIDITY_USD
        && numberOrZero(pair.volume?.h24) >= MIN_VOLUME_24H_USD)
      .sort((a, b) => numberOrZero(b.pair?.volume?.h24) - numberOrZero(a.pair?.volume?.h24))
      .slice(0, MAX_TOKENS);

    const client = createPublicClient({
      chain: getViemChain(chainId),
      transport: http(getRpcUrl(chainId)),
    });
    const tokens = (await Promise.all(candidates.map(async ({ address, pair, pairToken }) => {
      try {
        const decimals = await client.readContract({
          address: address as `0x${string}`,
          abi: erc20Abi,
          functionName: "decimals",
        });
        if (!pairToken?.symbol || !pairToken.name) return null;
        return {
          symbol: pairToken.symbol,
          name: pairToken.name,
          address,
          decimals: Number(decimals),
          chainId,
          logo: pair?.info?.imageUrl,
          imported: true,
          trending: true,
          liquidityUsd: numberOrZero(pair?.liquidity?.usd),
          volume24hUsd: numberOrZero(pair?.volume?.h24),
          priceChange24h: numberOrZero(pair?.priceChange?.h24),
        };
      } catch {
        return null;
      }
    }))).filter((token) => token !== null);

    return NextResponse.json(tokens, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("[TRENDING TOKENS API]", error);
    return NextResponse.json([], { headers: { "Cache-Control": "public, max-age=60" } });
  }
}
