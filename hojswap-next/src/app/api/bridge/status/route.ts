import { NextResponse } from "next/server";

const LIFI_STATUS_API = "https://li.quest/v1/status";
const LIFI_API_KEY = process.env.LIFI_API_KEY ?? "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get("txHash");
  const fromChain = searchParams.get("fromChain");
  const toChain = searchParams.get("toChain");

  if (!txHash || !/^0x[0-9a-fA-F]{64}$/.test(txHash) || !fromChain || !toChain) {
    return NextResponse.json({ error: "Invalid bridge status request" }, { status: 400 });
  }

  const params = new URLSearchParams({ txHash, fromChain, toChain });
  const headers: Record<string, string> = { Accept: "application/json" };
  if (LIFI_API_KEY) headers["x-lifi-api-key"] = LIFI_API_KEY;

  try {
    const response = await fetch(`${LIFI_STATUS_API}?${params}`, {
      headers,
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({ error: "Invalid status response" }));
    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Bridge status service unavailable" }, { status: 502 });
  }
}
