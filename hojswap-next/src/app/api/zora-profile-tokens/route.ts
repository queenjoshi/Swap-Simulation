import { NextResponse } from "next/server";

const PROFILE = "mr_lightspeed";
const ALLOWED_CHAINS = new Set([8453, 7777777]);

type Coin = {
  address?: string;
  chainId?: number;
  name?: string;
  symbol?: string;
  platformBlocked?: boolean;
  mediaContent?: { previewImage?: { small?: string } };
};

type ProfileResponse = {
  profile?: {
    createdCoins?: {
      edges?: Array<{ node?: Coin }>;
      pageInfo?: { endCursor?: string | null; hasNextPage?: boolean };
    };
  };
};

export async function GET() {
  try {
    const tokens: Array<{
      address: `0x${string}`;
      chainId: number;
      decimals: number;
      logo?: string;
      name: string;
      symbol: string;
    }> = [];
    let after: string | null = null;

    for (let page = 0; page < 25; page += 1) {
      const params = new URLSearchParams({ identifier: PROFILE, count: "100" });
      if (after) params.set("after", after);
      const response = await fetch(`https://api-sdk.zora.engineering/profileCoins?${params}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Zora API ${response.status}`);
      const data = await response.json() as ProfileResponse;
      const created = data.profile?.createdCoins;

      for (const edge of created?.edges ?? []) {
        const coin = edge.node;
        if (!coin?.address || !/^0x[a-fA-F0-9]{40}$/.test(coin.address)) continue;
        if (!coin.chainId || !ALLOWED_CHAINS.has(coin.chainId) || coin.platformBlocked) continue;
        if (!coin.name || !coin.symbol) continue;
        tokens.push({
          address: coin.address as `0x${string}`,
          chainId: coin.chainId,
          decimals: 18,
          logo: coin.mediaContent?.previewImage?.small,
          name: coin.name,
          symbol: coin.symbol,
        });
      }
      if (!created?.pageInfo?.hasNextPage || !created.pageInfo.endCursor) break;
      after = created.pageInfo.endCursor;
    }

    const unique = [...new Map(tokens.map((token) => [`${token.chainId}:${token.address.toLowerCase()}`, token])).values()];
    return NextResponse.json(unique, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("[ZORA PROFILE TOKENS]", error);
    return NextResponse.json({ error: "Zora tokens are temporarily unavailable" }, { status: 503 });
  }
}
