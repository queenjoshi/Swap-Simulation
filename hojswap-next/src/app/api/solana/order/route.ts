import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";

const JUPITER_ORDER_URL = "https://api.jup.ag/ultra/v1/order";

function validPublicKey(value: string) {
  try {
    return new PublicKey(value).toBase58() === value;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Jupiter API key is not configured" }, { status: 503 });

  try {
    const body = await request.json() as { inputMint?: string; outputMint?: string; amount?: string; taker?: string };
    if (!body.inputMint || !body.outputMint || !body.taker || !validPublicKey(body.inputMint) || !validPublicKey(body.outputMint) || !validPublicKey(body.taker)) {
      return NextResponse.json({ error: "Invalid Solana address or token mint" }, { status: 400 });
    }
    if (!body.amount || !/^\d+$/.test(body.amount) || BigInt(body.amount) <= 0n) {
      return NextResponse.json({ error: "Invalid swap amount" }, { status: 400 });
    }

    const referralAccount = process.env.SOLANA_REFERRAL_ACCOUNT;
    const params = new URLSearchParams({
      inputMint: body.inputMint,
      outputMint: body.outputMint,
      amount: body.amount,
      taker: body.taker,
    });
    if (referralAccount && validPublicKey(referralAccount)) {
      params.set("referralAccount", referralAccount);
      params.set("referralFee", "100");
    }

    const response = await fetch(`${JUPITER_ORDER_URL}?${params}`, {
      headers: { Accept: "application/json", "x-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const order = await response.json() as Record<string, unknown>;
    if (!response.ok || order.error) {
      return NextResponse.json({ error: String(order.error ?? `Jupiter returned ${response.status}`) }, { status: response.status || 502 });
    }
    return NextResponse.json({ ...order, feeReady: Boolean(referralAccount), houseFeeBps: 100 });
  } catch (error) {
    console.error("[SOLANA ORDER]", error);
    return NextResponse.json({ error: "Unable to create Jupiter order" }, { status: 502 });
  }
}
