import { NextResponse } from "next/server";

const PROFILE = "mr_lightspeed";
const PROFILE_LOGO = "/tokens/mr-lightspeed.jpg";
const PROFILE_CHAIN_IDS = new Set([8453, 7777777]);
const PAGE_SIZE = 100;
const MAX_PAGES = 25;

type ZoraCoin = {
  address?: string;
  chainId?: number;
  name?: string;
  platformBlocked?: boolean;
  symbol?: string;
  mediaContent?: {
    previewImage?: {
      small?: string;
    };
  };
};

type ZoraProfileResponse = {
  profile?: {
    createdCoins?: {
      edges?: Array<{ node?: ZoraCoin }>;
      pageInfo?: {
        endCursor?: string | null;
        hasNextPage?: boolean;
      };
    };
  };
};

function isAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

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

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const params = new URLSearchParams({
        identifier: PROFILE,
        count: String(PAGE_SIZE),
      });
      if (after) params.set("after", after);

      const response = await fetch(
        `https://api-sdk.zora.engineering/profileCoins?${params.toString()}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        },
      );
      if (!response.ok) throw new Error(`Zora API ${response.status}`);

      const data = await response.json() as ZoraProfileResponse;
      const createdCoins = data.profile?.createdCoins;

      for (const edge of createdCoins?.edges ?? []) {
        const coin = edge.node;
        const address = coin?.address ?? "";
        if (
          !coin
          || coin.platformBlocked
          || !coin.chainId
          || !PROFILE_CHAIN_IDS.has(coin.chainId)
          || !isAddress(address)
          || !coin.name
          || !coin.symbol
        ) continue;

        tokens.push({
          address,
          chainId: coin.chainId,
          decimals: 18,
          logo: coin.mediaContent?.previewImage?.small ?? PROFILE_LOGO,
          name: coin.name,
          symbol: coin.symbol,
        });
      }

      if (!createdCoins?.pageInfo?.hasNextPage || !createdCoins.pageInfo.endCursor) break;
      after = createdCoins.pageInfo.endCursor;
    }

    const uniqueTokens = Array.from(
      new Map(tokens.map((token) => [`${token.chainId}:${token.address.toLowerCase()}`, token])).values(),
    );
    const response = NextResponse.json(uniqueTokens);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("[ZORA PROFILE TOKENS] Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
