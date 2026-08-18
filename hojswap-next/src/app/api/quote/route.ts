import { NextResponse } from "next/server";
import { getHojswapRouterAddress, ZERO_ADDRESS } from "@/lib/hojswap-router";
import { HOUSE_WALLET, calculateRouterSellAmount } from "@/lib/swap-fee";
import type { QuoteResponse } from "@/lib/quote";
import { consumeQuoteRequest } from "@/lib/server-rate-limit";

const ZEROX_BASE_URL = "https://api.0x.org";
const ZEROX_API_KEY = process.env.ZEROX_API_KEY ?? "";

function missingKeyResponse() {
  return NextResponse.json(
    {
      error: "api_key_missing",
      reason: "The 0x API key is not configured. Set the ZEROX_API_KEY environment variable to enable live swap quotes.",
    },
    { status: 503 }
  );
}

function atomicRouterRequiredResponse() {
  return NextResponse.json(
    {
      error: "atomic_router_required",
      reason: "Swaps are disabled on this network until the House fee and swap can execute atomically through HojswapRouterV2.",
    },
    { status: 503 },
  );
}

function createMockQuoteResponse(sellAmount: string, sellToken: string, buyToken: string) {
  return {
    sellAmount,
    buyAmount: sellAmount,
    sellToken,
    buyToken,
    minBuyAmount: sellAmount,
    liquidityAvailable: true,
    transaction: { to: HOUSE_WALLET, data: "0x", value: "0" },
  };
}

type SwapRequestBody = {
  sellToken?: string;
  buyToken?: string;
  sellAmount?: string;
  chainId?: string | number;
  slippageBps?: string | number;
  taker?: string;
};

function attachRouterMetadata(data: QuoteResponse, routerAddress: `0x${string}`, sellAmount: string, routerSellAmount: string) {
  const spender = data?.issues?.allowance?.spender;
  return {
    ...data,
    hojswapRouter: {
      enabled: true,
      address: routerAddress,
      spender: spender ?? ZERO_ADDRESS,
      sellAmount,
      routerSellAmount,
    },
  };
}

export async function POST(request: Request) {
  if (!consumeQuoteRequest(request)) {
    return NextResponse.json({ error: "rate_limited", reason: "Too many quote requests. Try again shortly." }, { status: 429 });
  }

  let body: SwapRequestBody;
  try {
    body = await request.json() as SwapRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!ZEROX_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      return missingKeyResponse();
    }

    try {
      const { sellToken, buyToken, sellAmount } = body;
      return NextResponse.json(createMockQuoteResponse(String(sellAmount), String(sellToken), String(buyToken)));
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  }

  try {
    const { sellToken, buyToken, sellAmount, chainId, slippageBps, taker } = body;
    const routerAddress = getHojswapRouterAddress(Number(chainId));
    if (!routerAddress) return atomicRouterRequiredResponse();
    const swapSellAmount = calculateRouterSellAmount(String(sellAmount));

    const params = new URLSearchParams({
      chainId: String(chainId),
      sellToken: String(sellToken),
      buyToken: String(buyToken),
      sellAmount: swapSellAmount,
      slippageBps: String(slippageBps ?? 100),
    });
    params.set("taker", routerAddress);
    params.set("recipient", routerAddress);
    params.set("skipValidation", "true");
    if (taker) params.set("txOrigin", taker);

    const endpoint = "allowance-holder";
    const url = `${ZEROX_BASE_URL}/swap/${endpoint}/quote?${params.toString()}`;
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

    return NextResponse.json(
      upstream.ok ? attachRouterMetadata(data, routerAddress, String(sellAmount), swapSellAmount) : data,
      { status: upstream.status },
    );
  } catch (err) {
    console.error("Error fetching 0x quote:", err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}
