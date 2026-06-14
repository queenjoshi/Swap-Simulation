import { NextResponse } from "next/server";

const LIFI_API = "https://li.quest/v1";
const LIFI_API_KEY = process.env.LIFI_API_KEY ?? "";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromChain = searchParams.get("fromChain");
    const toChain = searchParams.get("toChain");
    const fromToken = searchParams.get("fromToken");
    const toToken = searchParams.get("toToken");
    const fromAmount = searchParams.get("fromAmount");
    const fromAddress = searchParams.get("fromAddress");

    if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !fromAddress) {
      return NextResponse.json({ error: "Missing required query params" }, { status: 400 });
    }

    const params = new URLSearchParams({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      slippage: "0.005",
      order: "CHEAPEST",
      integrator: "hojswap",
    });

    const headers: Record<string, string> = { Accept: "application/json" };
    if (LIFI_API_KEY) {
      headers["x-lifi-api-key"] = LIFI_API_KEY;
    }

    const upstream = await fetch(`${LIFI_API}/quote?${params.toString()}`, { headers });
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching bridge quote:", err);
    return NextResponse.json({ error: "Failed to fetch bridge quote", message: err?.message }, { status: 500 });
  }
}
