import { NextResponse } from "next/server";
import { XRPL_MAINNET_RPC } from "@/lib/xrpl-native";

export async function GET(request: Request) {
  const hash = new URL(request.url).searchParams.get("hash") ?? "";
  if (!/^[A-Fa-f0-9]{64}$/.test(hash)) {
    return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
  }
  try {
    const response = await fetch(XRPL_MAINNET_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "tx", params: [{ transaction: hash, binary: false }] }),
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json() as {
      result?: { validated?: boolean; meta?: { TransactionResult?: string } | string; error?: string };
    };
    const meta = payload.result?.meta;
    return NextResponse.json({
      found: !payload.result?.error,
      validated: Boolean(payload.result?.validated),
      result: typeof meta === "object" ? meta.TransactionResult : undefined,
    });
  } catch (error) {
    console.error("[XRPL TRANSACTION]", error);
    return NextResponse.json({ error: "Unable to verify XRP Ledger transaction" }, { status: 502 });
  }
}
