import { arbitrum, avalanche, bsc, optimism, polygon, unichain } from "@/lib/chains";
import { NATIVE_ETH_ADDRESS } from "@/lib/quote";
import { isNative, type Token } from "@/lib/tokens";
import { base, mainnet } from "wagmi/chains";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export const hojswapRouterAbi = [
  {
    type: "function",
    name: "swapExactNative",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "swapTarget", type: "address" },
          { name: "swapCallData", type: "bytes" },
          { name: "buyToken", type: "address" },
          { name: "minBuyAmount", type: "uint256" },
          { name: "recipient", type: "address" },
        ],
      },
    ],
    outputs: [{ name: "buyAmount", type: "uint256" }],
  },
  {
    type: "function",
    name: "swapExactToken",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "sellToken", type: "address" },
          { name: "sellAmount", type: "uint256" },
          { name: "spender", type: "address" },
          { name: "swapTarget", type: "address" },
          { name: "swapCallData", type: "bytes" },
          { name: "buyToken", type: "address" },
          { name: "minBuyAmount", type: "uint256" },
          { name: "recipient", type: "address" },
        ],
      },
    ],
    outputs: [{ name: "buyAmount", type: "uint256" }],
  },
] as const;

const ROUTER_ENV_BY_CHAIN_ID: Record<number, `0x${string}` | undefined> = {
  [arbitrum.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_ARBITRUM as `0x${string}` | undefined,
  [avalanche.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_AVALANCHE as `0x${string}` | undefined,
  [base.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_BASE as `0x${string}` | undefined,
  [bsc.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_BNB as `0x${string}` | undefined,
  [mainnet.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_ETHEREUM as `0x${string}` | undefined,
  [optimism.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_OPTIMISM as `0x${string}` | undefined,
  [polygon.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_POLYGON as `0x${string}` | undefined,
  [unichain.id]: process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_UNICHAIN as `0x${string}` | undefined,
};

export function getHojswapRouterAddress(chainId: number): `0x${string}` | null {
  const address = ROUTER_ENV_BY_CHAIN_ID[chainId];
  if (!address || address === ZERO_ADDRESS) return null;
  return address;
}

export function tokenToRouterAddress(token: Token): `0x${string}` {
  return isNative(token) ? ZERO_ADDRESS : (token.address as `0x${string}`);
}

export function tokenParamToRouterAddress(tokenAddress: string): `0x${string}` {
  return tokenAddress.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase()
    ? ZERO_ADDRESS
    : (tokenAddress as `0x${string}`);
}
