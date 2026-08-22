import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      status: "awaiting_onchain_integration",
      totalBurnedShib: "0",
      burnTransactionCount: 0,
      lastBurnAt: null,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
