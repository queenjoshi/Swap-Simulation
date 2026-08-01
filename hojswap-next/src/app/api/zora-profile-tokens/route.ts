import { NextResponse } from "next/server";

const PROFILE = "mr_lightspeed";
const PROFILE_LOGO = "https://scontent-iad4-1.choicecdn.com/-/rs:fit:600:600/f:best/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWEzZXVpN29tamNmaG41enIyNDIzdGdtbG9kYm5kcm03bWQ0aWJ2bTVueGticnlpZmlzNjQ=";
const BASE_CHAIN_ID = 8453;
const PAGE_SIZE = 100;
const MAX_PAGES = 25;
const FETCH_ATTEMPTS = 3;

type ZoraCoin = {
  address?: string;
  chainId?: number;
  name?: string;
  platformBlocked?: boolean;
  symbol?: string;
  mediaContent?: { previewImage?: { small?: string } };
};

type ZoraProfileResponse = {
  profile?: {
    createdCoins?: {
      edges?: Array<{ node?: ZoraCoin }>;
      pageInfo?: { endCursor?: string | null; hasNextPage?: boolean };
    };
  };
};

type ProfileToken = {
  address: `0x${string}`;
  chainId: number;
  decimals: number;
  logo?: string;
  name: string;
  symbol: string;
};

let lastSuccessfulTokens: ProfileToken[] = [];

function isAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

async function fetchProfilePage(url: string) {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Zora API ${response.status}`);
      return await response.json() as ZoraProfileResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Zora API request failed");
      if (attempt < FETCH_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }
  throw lastError ?? new Error("Zora API request failed");
}

export async function GET() {
  try {
    const tokens: ProfileToken[] = [];
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const params = new URLSearchParams({ identifier: PROFILE, count: String(PAGE_SIZE) });
      if (after) params.set("after", after);
      const data = await fetchProfilePage(
        `https://api-sdk.zora.engineering/profileCoins?${params.toString()}`,
      );
      const createdCoins = data.profile?.createdCoins;

      for (const edge of createdCoins?.edges ?? []) {
        const coin = edge.node;
        const address = coin?.address ?? "";
        if (
          !coin || coin.platformBlocked || coin.chainId !== BASE_CHAIN_ID
          || !isAddress(address) || !coin.name || !coin.symbol
        ) continue;
        tokens.push({
          address,
          chainId: BASE_CHAIN_ID,
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
      new Map(tokens.map((token) => [token.address.toLowerCase(), token])).values(),
    );
    if (uniqueTokens.length > 0) lastSuccessfulTokens = uniqueTokens;
    const response = NextResponse.json(uniqueTokens);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("[ZORA PROFILE TOKENS] Error:", error);
    if (lastSuccessfulTokens.length > 0) {
      const response = NextResponse.json(lastSuccessfulTokens);
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=3600");
      response.headers.set("X-Zora-Data", "stale");
      return response;
    }
    return NextResponse.json(
      { error: "Lightspeed tokens are temporarily unavailable" },
      { status: 503 },
    );
  }
}
