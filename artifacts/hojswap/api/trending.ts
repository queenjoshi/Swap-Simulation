const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

interface TrendingToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { chainId = "8453" } = req.query; // Default to Base (8453)

    // Map chainId to CoinGecko category
    const categoryMap: { [key: string]: string } = {
      "8453": "base-ecosystem", // Base
      "1": "ethereum-ecosystem", // Ethereum
      "25": "cronos-ecosystem", // Cronos
    };

    const category = categoryMap[String(chainId)] || "base-ecosystem";

    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?` +
        new URLSearchParams({
          vs_currency: "usd",
          category: category,
          order: "volume_desc",
          per_page: "10",
          sparkline: "false",
          locale: "en",
        }).toString(),
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `CoinGecko API error: ${response.statusText}`,
      });
    }

    const data = await response.json();

    // Format the response to include only necessary fields
    const formatted: TrendingToken[] = data.map((token: any) => ({
      id: token.id,
      symbol: token.symbol.toUpperCase(),
      name: token.name,
      image: token.image,
      current_price: token.current_price,
      market_cap_rank: token.market_cap_rank,
      total_volume: token.total_volume,
      price_change_percentage_24h: token.price_change_percentage_24h,
    }));

    // Cache for 5 minutes
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("[TRENDING API] Error:", error);
    return res.status(500).json({
      error: "Failed to fetch trending tokens",
    });
  }
}
