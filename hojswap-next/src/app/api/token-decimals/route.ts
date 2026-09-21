import { NextResponse } from "next/server";
import { createPublicClient, http, erc20Abi, isAddress } from "viem";
import { SUPPORTED_CHAIN_IDS } from "@/lib/chains";
import { getRpcUrl, getViemChain } from "@/lib/rpc";

export async function POST(request: Request) {
  try {
    const { tokenAddress, chainId } = await request.json() as {
      tokenAddress: `0x${string}`;
      chainId: number;
    };

    if (!SUPPORTED_CHAIN_IDS.some((id) => id === chainId) || !isAddress(tokenAddress)) {
      return NextResponse.json({ error: "Invalid token address or unsupported chain" }, { status: 400 });
    }
    const client = createPublicClient({
      chain: getViemChain(chainId),
      transport: http(getRpcUrl(chainId)),
    });

    const decimals = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });

    return NextResponse.json({ decimals: Number(decimals) });
  } catch (err) {
    console.error("Error fetching token decimals:", err);
    return NextResponse.json({ error: "Failed to fetch token decimals" }, { status: 500 });
  }
}
