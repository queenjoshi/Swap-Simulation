import { NextResponse } from "next/server";

const COINGECKO_IDS = [
  "ethereum", "usd-coin", "tether", "coinbase-wrapped-btc", "aerodrome-finance", "brett",
  "mog-coin", "toshi", "virtual-protocol", "morpho", "degen-base", "zora", "coinbase-wrapped-staked-eth",
  "euro-coin", "moonwell-artemis", "aixbt", "kaito", "tokenbot", "spx6900", "syrup", "instadapp",
  "cow-protocol", "euler", "layerzero", "wormhole", "axelar", "sushi", "non-playable-coin",
  "ribbita-by-virtuals", "aave", "dai", "bridged-usd-coin-base", "gho", "usds", "echelon-prime",
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
];

export async function GET() {
  try {
    const params = new URLSearchParams({
      vs_currency: "usd",
      ids: COINGECKO_IDS.join(","),
      order: "volume_desc",
      per_page: "250",
      page: "1",
      sparkline: "true",
      price_change_percentage: "1h,24h,7d,30d",
    });
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return NextResponse.json({ error: "CoinGecko price feed unavailable" }, { status: response.status });
    }
    const data = await response.json();
    const rows = data.map((coin: any) => ({
      id: coin.id,
      symbol: String(coin.symbol ?? "").toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price ?? null,
      change1h: coin.price_change_percentage_1h_in_currency ?? null,
      change24h: coin.price_change_percentage_24h_in_currency ?? null,
      change7d: coin.price_change_percentage_7d_in_currency ?? null,
      change30d: coin.price_change_percentage_30d_in_currency ?? null,
      volume24h: coin.total_volume ?? null,
      fdv: coin.fully_diluted_valuation ?? null,
      marketCap: coin.market_cap ?? null,
      sparkline: coin.sparkline_in_7d?.price ?? [],
    }));
    const result = NextResponse.json(rows);
    result.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return result;
  } catch (error) {
    console.error("[MARKET PRICES] Error:", error);
    return NextResponse.json({ error: "Market data unavailable" }, { status: 500 });
  }
}
