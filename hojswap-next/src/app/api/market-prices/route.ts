import { NextResponse } from "next/server";
import { TOKENS } from "@/lib/tokens";

const COINGECKO_IDS = [
  "ethereum", "usd-coin", "tether", "coinbase-wrapped-btc", "aerodrome-finance", "brett",
  "mog-coin", "toshi", "virtual-protocol", "morpho", "degen-base", "zora", "coinbase-wrapped-staked-eth",
  "euro-coin", "moonwell-artemis", "aixbt", "kaito", "tokenbot", "spx6900", "syrup", "instadapp",
  "cow-protocol", "euler", "layerzero", "wormhole", "axelar", "sushi", "non-playable-coin",
  "ribbita-by-virtuals", "doginme", "ski-mask-dog", "keyboard-cat-base", "basenji",
  "aave", "1inch", "yearn-finance", "balancer", "convex-finance", "gnosis",
  "dai", "bridged-usd-coin-base", "gho", "usds", "echelon-prime",
  "wrapped-steth", "rocket-pool-eth", "shiba-inu", "bone-shibaswap", "treat", "wrapped-bitcoin",
  "chainlink", "uniswap", "pepe", "floki", "ondo-finance", "ethena", "ethena-usde", "pendle",
  "lido-dao", "eigenlayer", "paypal-usd", "curve-dao-token", "compound-governance-token",
  "ethereum-name-service", "the-graph", "rocket-pool", "sky", "maker", "staked-ether", "frax",
  "liquity-usd", "polygon-ecosystem-token", "quickswap", "the-sandbox", "aavegotchi", "binancecoin",
  "dogecoin", "first-digital-usd", "pancakeswap-token", "baby-doge-coin", "venus", "trust-wallet-token",
  "arbitrum", "gmx", "magic", "camelot-token", "radiant-capital", "optimism", "synthetix-network-token",
  "velodrome-finance", "worldcoin-wld", "connect-token-wct", "avalanche-2", "joe", "pangolin",
  "benqi", "coq-inu", "benqi-liquid-staked-avax", "wrapped-avax", "bitcoin-avalanche-bridged-btc-b",
  "yield-yak", "arena-token", "global-dollar",
  "turbo", "apu-s-club", "wojak", "milady-meme-coin", "toby-toadgod", "mister-miggles",
  "russell", "moew", "dino-2", "cheems-token", "why", "polydoge", "arbdoge-ai", "boop-4",
];

const DEXSCREENER_CHAINS: Record<number, string> = {
  1: "ethereum",
  10: "optimism",
  25: "cronos",
  56: "bsc",
  130: "unichain",
  137: "polygon",
  4663: "robinhood",
  42161: "arbitrum",
  43114: "avalanche",
  1440000: "xrplevm",
  7777777: "zora",
  8453: "base",
};

const COINGECKO_PLATFORMS: Record<number, string> = {
  1: "ethereum",
  10: "optimistic-ethereum",
  25: "cronos",
  56: "binance-smart-chain",
  130: "unichain",
  137: "polygon-pos",
  42161: "arbitrum-one",
  43114: "avalanche",
  7777777: "zora-network",
  8453: "base",
};

type MarketRow = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number | null;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  volume24h: number | null;
  fdv: number | null;
  marketCap: number | null;
  sparkline: number[];
};

type DexPair = {
  chainId?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string | null;
  priceChange?: { h1?: number; h6?: number; h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  fdv?: number | null;
  marketCap?: number | null;
  info?: { imageUrl?: string };
};

function numberOrNull(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalTokenLogo(token: (typeof TOKENS)[number]) {
  return "logo" in token && typeof token.logo === "string" && token.logo.length > 0
    ? token.logo
    : undefined;
}

function chunks<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}

async function fetchCoinGecko(): Promise<MarketRow[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: COINGECKO_IDS.join(","),
    order: "volume_desc",
    per_page: "250",
    page: "1",
    sparkline: "true",
    price_change_percentage: "1h,24h,7d,30d",
  });
  const apiKey = process.env.COINGECKO_API_KEY ?? process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params}`, {
    headers: {
      Accept: "application/json",
      ...(apiKey ? { "x-cg-demo-api-key": apiKey } : {}),
    },
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error(`CoinGecko returned ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((coin: Record<string, any>) => ({
    id: String(coin.id),
    symbol: String(coin.symbol ?? "").toUpperCase(),
    name: String(coin.name ?? coin.symbol ?? "Token"),
    image: typeof coin.image === "string" ? coin.image : undefined,
    price: numberOrNull(coin.current_price),
    change1h: numberOrNull(coin.price_change_percentage_1h_in_currency),
    change24h: numberOrNull(coin.price_change_percentage_24h_in_currency),
    change7d: numberOrNull(coin.price_change_percentage_7d_in_currency),
    change30d: numberOrNull(coin.price_change_percentage_30d_in_currency),
    volume24h: numberOrNull(coin.total_volume),
    fdv: numberOrNull(coin.fully_diluted_valuation),
    marketCap: numberOrNull(coin.market_cap),
    sparkline: Array.isArray(coin.sparkline_in_7d?.price)
      ? coin.sparkline_in_7d.price.filter((value: unknown) => Number.isFinite(value))
      : [],
  }));
}

async function fetchCoinGeckoContracts(): Promise<MarketRow[]> {
  const apiKey = process.env.COINGECKO_API_KEY ?? process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  const requests = Object.entries(
    TOKENS.reduce<Record<string, typeof TOKENS>>((groups, token) => {
      const platform = COINGECKO_PLATFORMS[token.chainId];
      if (!platform || !token.address) return groups;
      (groups[platform] ??= []).push(token);
      return groups;
    }, {}),
  ).flatMap(([platform, tokens]) =>
    chunks(
      Array.from(new Map(tokens.map((token) => [token.address!.toLowerCase(), token])).values()),
      30,
    ).map(async (tokenChunk) => {
      const params = new URLSearchParams({
        contract_addresses: tokenChunk.map((token) => token.address).join(","),
        vs_currencies: "usd",
        include_market_cap: "true",
        include_24hr_vol: "true",
        include_24hr_change: "true",
        precision: "full",
      });
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/${platform}?${params}`,
        {
          headers: {
            Accept: "application/json",
            ...(apiKey ? { "x-cg-demo-api-key": apiKey } : {}),
          },
          next: { revalidate: 60 },
        },
      );
      if (!response.ok) throw new Error(`CoinGecko contracts ${platform} returned ${response.status}`);
      return {
        platform,
        tokens: tokenChunk,
        prices: await response.json() as Record<string, Record<string, unknown>>,
      };
    }),
  );

  const settled = await Promise.allSettled(requests);
  const rows: MarketRow[] = [];
  for (const result of settled) {
    if (result.status === "rejected") continue;
    for (const token of result.value.tokens) {
      const address = token.address!.toLowerCase();
      const quote = result.value.prices[address];
      if (!quote || numberOrNull(quote.usd) == null) continue;
      rows.push({
        id: `coingecko-contract:${result.value.platform}:${address}`,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        image: optionalTokenLogo(token),
        price: numberOrNull(quote.usd),
        change1h: null,
        change24h: numberOrNull(quote.usd_24h_change),
        change7d: null,
        change30d: null,
        volume24h: numberOrNull(quote.usd_24h_vol),
        fdv: null,
        marketCap: numberOrNull(quote.usd_market_cap),
        sparkline: [],
      });
    }
  }
  return rows;
}

async function fetchDexScreener(): Promise<MarketRow[]> {
  const requests = Object.entries(
    TOKENS.reduce<Record<string, typeof TOKENS>>((groups, token) => {
      const chain = DEXSCREENER_CHAINS[token.chainId];
      if (!chain || !token.address) return groups;
      (groups[chain] ??= []).push(token);
      return groups;
    }, {}),
  ).flatMap(([chain, tokens]) =>
    chunks(
      Array.from(new Map(tokens.map((token) => [token.address!.toLowerCase(), token])).values()),
      30,
    ).map(async (tokenChunk) => {
      const addresses = tokenChunk.map((token) => token.address).join(",");
      const response = await fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${addresses}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (!response.ok) throw new Error(`DEX Screener ${chain} returned ${response.status}`);
      return { chain, tokens: tokenChunk, pairs: await response.json() as DexPair[] };
    }),
  );

  const settled = await Promise.allSettled(requests);
  const rows: MarketRow[] = [];
  for (const result of settled) {
    if (result.status === "rejected" || !Array.isArray(result.value.pairs)) continue;
    for (const token of result.value.tokens) {
      const address = token.address!.toLowerCase();
      const bestPair = result.value.pairs
        .filter((pair) => pair.baseToken?.address?.toLowerCase() === address && numberOrNull(pair.priceUsd) != null)
        .sort((a, b) => (numberOrNull(b.liquidity?.usd) ?? 0) - (numberOrNull(a.liquidity?.usd) ?? 0))[0];
      if (!bestPair) continue;
      rows.push({
        id: `dex:${result.value.chain}:${address}`,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        image: bestPair.info?.imageUrl,
        price: numberOrNull(bestPair.priceUsd),
        change1h: numberOrNull(bestPair.priceChange?.h1),
        change24h: numberOrNull(bestPair.priceChange?.h24),
        change7d: null,
        change30d: null,
        volume24h: numberOrNull(bestPair.volume?.h24),
        fdv: numberOrNull(bestPair.fdv),
        marketCap: numberOrNull(bestPair.marketCap),
        sparkline: [],
      });
    }
  }
  return rows;
}

function mergeRows(primary: MarketRow[], fallback: MarketRow[]) {
  const merged = new Map(primary.map((row) => [row.symbol.toUpperCase(), row]));
  for (const row of fallback) {
    const key = row.symbol.toUpperCase();
    const current = merged.get(key);
    if (!current) {
      merged.set(key, row);
      continue;
    }
    merged.set(key, {
      ...row,
      ...current,
      image: current.image ?? row.image,
      price: current.price ?? row.price,
      change1h: current.change1h ?? row.change1h,
      change24h: current.change24h ?? row.change24h,
      change7d: current.change7d ?? row.change7d,
      change30d: current.change30d ?? row.change30d,
      volume24h: current.volume24h ?? row.volume24h,
      fdv: current.fdv ?? row.fdv,
      marketCap: current.marketCap ?? row.marketCap,
      sparkline: current.sparkline.length ? current.sparkline : row.sparkline,
    });
  }
  return [...merged.values()];
}

export async function GET() {
  const [coinGecko, coinGeckoContracts, dexScreener] = await Promise.allSettled([
    fetchCoinGecko(),
    fetchCoinGeckoContracts(),
    fetchDexScreener(),
  ]);
  const coinGeckoRows = coinGecko.status === "fulfilled" ? coinGecko.value : [];
  const contractRows = coinGeckoContracts.status === "fulfilled" ? coinGeckoContracts.value : [];
  const dexRows = dexScreener.status === "fulfilled" ? dexScreener.value : [];
  const rows = mergeRows(mergeRows(coinGeckoRows, contractRows), dexRows);

  if (!rows.length) {
    console.error("[MARKET PRICES] All providers unavailable", {
      coinGecko: coinGecko.status === "rejected" ? String(coinGecko.reason) : "empty",
      coinGeckoContracts: coinGeckoContracts.status === "rejected"
        ? String(coinGeckoContracts.reason)
        : "empty",
      dexScreener: dexScreener.status === "rejected" ? String(dexScreener.reason) : "empty",
    });
    return NextResponse.json({ error: "Market data temporarily unavailable" }, { status: 503 });
  }

  const result = NextResponse.json(rows);
  result.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  result.headers.set("X-Market-Sources", [
    coinGeckoRows.length ? "coingecko" : null,
    contractRows.length ? "coingecko-contracts" : null,
    dexRows.length ? "dexscreener" : null,
  ].filter(Boolean).join(","));
  return result;
}
