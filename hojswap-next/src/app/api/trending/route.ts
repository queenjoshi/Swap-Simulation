import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '8453'; // Default to Base

    // Map chainId to CoinGecko category
    const categoryMap: { [key: string]: string } = {
      '8453': 'base-ecosystem',
      '1': 'ethereum-ecosystem',
      '25': 'cronos-ecosystem',
    };

    const category = categoryMap[chainId] || 'base-ecosystem';

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

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from CoinGecko' },
        { status: res.status }
      );
    }

    const data = await res.json();

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
    return NextResponse.json(
      { error: 'Failed to fetch trending tokens' },
      { status: 500 }
    );
  }
}
