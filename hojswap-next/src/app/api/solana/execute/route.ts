import { NextResponse } from "next/server";

const JUPITER_EXECUTE_URL = "https://api.jup.ag/swap/v2/execute";

export async function POST(request: Request) {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Jupiter API key is not configured" }, { status: 503 });
  if (!process.env.SOLANA_REFERRAL_ACCOUNT) {
    return NextResponse.json({ error: "The Jupiter 1% referral account must be initialized before swaps can execute" }, { status: 503 });
  }

  try {
    const body = await request.json() as { signedTransaction?: string; requestId?: string };
    if (!body.signedTransaction || !body.requestId) {
      return NextResponse.json({ error: "Signed transaction and request ID are required" }, { status: 400 });
    }
    const response = await fetch(JUPITER_EXECUTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ signedTransaction: body.signedTransaction, requestId: body.requestId }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const result = await response.json();
    return NextResponse.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error("[SOLANA EXECUTE]", error);
    return NextResponse.json({ error: "Unable to execute Jupiter swap" }, { status: 502 });
  }
}
