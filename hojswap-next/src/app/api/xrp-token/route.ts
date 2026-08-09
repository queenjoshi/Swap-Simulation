import { NextResponse } from "next/server";
import { createPublicClient, erc20Abi, getAddress, http, isAddress } from "viem";
import { hasHammyBaseRoute, XRP_SENTINEL } from "@/lib/hammy-swap";

const client = createPublicClient({ transport: http("https://rpc.xrplevm.org") });

function safeText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new Error(`Token ${field} is not valid text`);
  const text = value.trim();
  if (!text || text.length > maxLength || /[\u0000-\u001f\u007f]/.test(text)) {
    throw new Error(`Token ${field} is invalid`);
  }
  return text;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { address?: unknown };
    if (typeof body.address !== "string" || !isAddress(body.address)) {
      return NextResponse.json({ error: "Enter a valid XRPL EVM contract address" }, { status: 400 });
    }
    const address = getAddress(body.address);
    if (address === XRP_SENTINEL) {
      return NextResponse.json({ error: "Native XRP is already listed" }, { status: 400 });
    }
    const code = await client.getCode({ address });
    if (!code || code === "0x") {
      return NextResponse.json({ error: "This address has no contract bytecode on XRPL EVM" }, { status: 400 });
    }

    const [nameValue, symbolValue, decimalsValue, hasRoute] = await Promise.all([
      client.readContract({ address, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
      hasHammyBaseRoute(address),
    ]);
    const decimals = Number(decimalsValue);
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error("Token decimals are unsafe");
    if (!hasRoute) {
      return NextResponse.json({ error: "No liquid Hammy route exists for this token" }, { status: 422 });
    }

    return NextResponse.json({
      token: {
        address,
        name: safeText(nameValue, "name", 80),
        symbol: safeText(symbolValue, "symbol", 20),
        decimals,
        chainId: 1_440_000,
        imported: true,
      },
      warning: "This token is permissionlessly imported and is not verified by HOJSwap. Confirm the contract address and understand that malicious or taxed tokens can cause loss.",
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to inspect this token",
    }, { status: 400 });
  }
}
