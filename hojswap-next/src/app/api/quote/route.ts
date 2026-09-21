import { NextResponse } from "next/server";
import { getHojswapRouterAddress, ZERO_ADDRESS } from "@/lib/hojswap-router";
import { calculateRouterSellAmount } from "@/lib/swap-fee";
import type { QuoteResponse } from "@/lib/quote";
import { consumeQuoteRequest } from "@/lib/server-rate-limit";
import { invalidSwapRequest } from "@/lib/swap-request";
import { validateRegistryPair } from "@/lib/token-registry";
import { validateQuoteRoute } from "@/lib/router-preflight";

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

  const invalid = invalidSwapRequest(body, true);
  if (invalid) return NextResponse.json({ error: "invalid_swap", reason: invalid }, { status: 400 });
  try {
    await validateRegistryPair(Number(body.chainId), body.sellToken!, body.buyToken!);
  } catch (error) {
    return NextResponse.json({ error: "registry_check_failed", reason: error instanceof Error ? error.message : "Registry unavailable. Please retry." }, { status: 503 });
  }

  if (!ZEROX_API_KEY) {
    return missingKeyResponse();
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
    if (upstream.ok) {
      try { await validateQuoteRoute(Number(chainId), routerAddress, data, sellToken!); }
      catch (error) {
        return NextResponse.json({ error: "route_preflight_failed", reason: error instanceof Error ? error.message : "Route checks unavailable." }, { status: 503 });
      }
    }

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
