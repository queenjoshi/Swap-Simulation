import { arbitrum, avalanche, bsc, cronos, optimism, polygon, robinhood, unichain, xrp } from "@/lib/chains";
import { NATIVE_ETH_ADDRESS } from "@/lib/quote";
import { isNative, type Token } from "@/lib/tokens";
import { base, mainnet } from "wagmi/chains";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const BASE_ROUTER = "0x6aCaf964bCf4551CC55Afaf12d6e6a8ef7138875" as const;
const SHARED_ROUTER = "0x2C5F372746330465C3f4084CE6C6aBce22a48B4d" as const;

function configuredRouter(
  environmentValue: string | undefined,
  fallback?: `0x${string}`,
): `0x${string}` | undefined {
  return environmentValue ? (environmentValue as `0x${string}`) : fallback;
}

export const hojswapRouterAbi = [
  {
    type: "event",
    name: "SwapExecuted",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "sellToken", type: "address", indexed: true },
      { name: "buyToken", type: "address", indexed: false },
      { name: "sellAmount", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
      { name: "buyAmount", type: "uint256", indexed: false },
      { name: "swapTarget", type: "address", indexed: false },
    ],
  },
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
  [arbitrum.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_ARBITRUM, SHARED_ROUTER),
  [avalanche.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_AVALANCHE, SHARED_ROUTER),
  [base.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_BASE, BASE_ROUTER),
  [bsc.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_BNB, SHARED_ROUTER),
  [cronos.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_CRONOS, SHARED_ROUTER),
  [mainnet.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_ETHEREUM),
  [optimism.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_OPTIMISM, SHARED_ROUTER),
  [polygon.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_POLYGON, SHARED_ROUTER),
  [robinhood.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_ROBINHOOD, SHARED_ROUTER),
  [unichain.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_UNICHAIN, SHARED_ROUTER),
  [xrp.id]: configuredRouter(process.env.NEXT_PUBLIC_HOJSWAP_ROUTER_XRP),
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
