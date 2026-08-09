import { NextResponse } from "next/server";
import { RLUSD_CURRENCY, RLUSD_ISSUER, XRPL_MAINNET_RPC } from "@/lib/xrpl-native";

async function rpc(command: string, params: Record<string, unknown>) {
  const response = await fetch(XRPL_MAINNET_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: command, params: [{ ...params, ledger_index: "validated" }] }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`XRPL RPC ${response.status}`);
  return response.json() as Promise<{ result?: Record<string, unknown> }>;
}

export async function GET(request: Request) {
  const account = new URL(request.url).searchParams.get("account") ?? "";
  if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(account)) {
    return NextResponse.json({ error: "Invalid XRP Ledger address" }, { status: 400 });
  }
  try {
    const [info, lines] = await Promise.all([
      rpc("account_info", { account, strict: true }),
      rpc("account_lines", { account, peer: RLUSD_ISSUER }),
    ]);
    const accountData = info.result?.account_data as { Balance?: string } | undefined;
    const trustLines = (lines.result?.lines ?? []) as Array<{ account?: string; balance?: string; currency?: string }>;
    const rlusd = trustLines.find((line) => line.account === RLUSD_ISSUER && line.currency === RLUSD_CURRENCY);
    return NextResponse.json({
      xrpBalance: Number(accountData?.Balance ?? 0) / 1_000_000,
      rlusdBalance: Number(rlusd?.balance ?? 0),
      hasRlusdTrustline: Boolean(rlusd),
    });
  } catch (error) {
    console.error("[XRPL ACCOUNT]", error);
    return NextResponse.json({ error: "Unable to load XRP Ledger account" }, { status: 502 });
  }
}
