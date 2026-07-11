import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '8453'; // Default to Base

    // Map chainId to CoinGecko category with fallback
    const categoryMap: { [key: string]: string[] } = {
      '8453': ['base-ecosystem'],
      '1': ['ethereum-ecosystem', 'defi'], // Ethereum - with fallback to DeFi
      '25': ['cronos-ecosystem', 'defi'], // Cronos - with fallback to DeFi
      '137': ['polygon-ecosystem', 'defi'],
      '56': ['binance-smart-chain', 'defi'],
      '42161': ['arbitrum-ecosystem', 'defi'],
      '10': ['optimism-ecosystem', 'defi'],
      '43114': ['avalanche-ecosystem', 'defi'],
      '130': ['unichain-ecosystem', 'defi'],
    };

    const categories = categoryMap[chainId] || ['base-ecosystem'];

    let data = null;

    // Try each category until one works
    for (const category of categories) {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        category: category,
        order: 'volume_desc',
        per_page: '10',
        sparkline: 'false',
      });

      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (res.ok) {
        const responseData = await res.json();
        if (responseData && responseData.length > 0) {
          data = responseData;
          break; // Successfully got data
        }
      }
    }

    // If no data found, return empty array
    if (!data || data.length === 0) {
      const response = NextResponse.json([]);
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }

    // Format the response
    const formatted = data.map((token: any) => ({
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
    const response = NextResponse.json(formatted);
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch (error) {
    console.error('[TRENDING API] Error:', error);
    // Return empty array on error instead of 500
    const response = NextResponse.json([]);
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  }
}
