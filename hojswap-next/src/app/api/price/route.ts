import { NextResponse } from "next/server";

const ZEROX_BASE_URL = "https://api.0x.org";
const ZEROX_API_KEY = process.env.ZEROX_API_KEY ?? "";
const HOUSE_WALLET = "0x6736d2eA9807297F0e56967361B9410854B86a5f";
const HOUSE_FEE_BPS = "100";

function missingKeyResponse() {
  return NextResponse.json(
    {
      error: "api_key_missing",
      reason: "The 0x API key is not configured. Set the ZEROX_API_KEY environment variable to enable live swap quotes.",
    },
    { status: 503 }
  );
}

function createMockPriceResponse(sellAmount: string) {
  return {
    sellAmount,
    buyAmount: sellAmount,
    liquidityAvailable: true,
    totalNetworkFee: "0",
  };
}

export async function POST(request: Request) {
  if (!ZEROX_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      return missingKeyResponse();
    }

    try {
      const { sellAmount } = await request.json();
      return NextResponse.json(createMockPriceResponse(sellAmount));
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  }

  try {
    const { sellToken, buyToken, sellAmount, chainId, slippageBps, taker } = await request.json();

    const params = new URLSearchParams({
      chainId: String(chainId),
      sellToken,
      buyToken,
      sellAmount,
      slippageBps: String(slippageBps ?? 100),
      swapFeeRecipient: HOUSE_WALLET,
      swapFeeBps: HOUSE_FEE_BPS,
      swapFeeToken: sellToken,
    });
    if (taker) params.set("taker", taker);

    const url = `${ZEROX_BASE_URL}/swap/permit2/price?${params.toString()}`;
    const upstream = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "0x-api-key": ZEROX_API_KEY,
        "0x-version": "v2",
      },
    });

    const data = await upstream.json();

    if (upstream.status === 401 || upstream.status === 403) {
      return NextResponse.json(
        {
          error: "api_key_invalid",
          reason: "The 0x API key is invalid or has exceeded its quota. Check your ZEROX_API_KEY secret.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("Error fetching 0x price:", err);
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
