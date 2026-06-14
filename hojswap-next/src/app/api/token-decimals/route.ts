import { NextResponse } from "next/server";
import { createPublicClient, http, erc20Abi } from "viem";
import { mainnet, base } from "viem/chains";

const chainMap: Record<number, typeof mainnet | typeof base> = {
  1: mainnet,
  8453: base,
};

const rpcMap: Record<number, string> = {
  1: "https://ethereum-rpc.publicnode.com",
  8453: "https://mainnet.base.org",
  25: "https://mainnet.cronos.org",
};

export async function POST(request: Request) {
  try {
    const { tokenAddress, chainId } = await request.json() as {
      tokenAddress: `0x${string}`;
      chainId: number;
    };

    const chain = chainMap[chainId] ?? mainnet;
    const client = createPublicClient({
      chain,
      transport: http(rpcMap[chainId] ?? rpcMap[1]!),
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
