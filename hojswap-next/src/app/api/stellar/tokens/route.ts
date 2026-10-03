import { NextResponse } from "next/server";
import { STELLAR_NETWORK_ID, STELLAR_TOKENS } from "@/lib/stellar";
export async function GET() {
  return NextResponse.json({ tokens: STELLAR_TOKENS, networkId: STELLAR_NETWORK_ID, network: "Stellar Mainnet", source: "configured" });
}
