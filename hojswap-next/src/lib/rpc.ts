import { base, mainnet } from "wagmi/chains";
import { arbitrum, bsc, cronos, optimism, polygon, xrp } from "@/lib/chains";
import type { Chain } from "viem";
import { fallback, http } from "viem";

export const RPC_URLS: Record<number, readonly string[]> = {
  [base.id]: [
    "https://mainnet.base.org",
    "https://base-rpc.publicnode.com",
    "https://base.llamarpc.com",
  ],
  [mainnet.id]: [
    "https://ethereum-rpc.publicnode.com",
    "https://rpc.ankr.com/eth",
    "https://cloudflare-eth.com",
  ],
  [cronos.id]: [
    "https://mainnet.cronos.org",
    "https://cronos-rpc.publicnode.com",
  ],
  [xrp.id]: [
    "https://xrpl.ws",
    "https://xrplcluster.com",
  ],
  [polygon.id]: [
    "https://polygon-rpc.com",
    "https://polygon-bor-rpc.publicnode.com",
    "https://polygon.llamarpc.com",
  ],
  [bsc.id]: [
    "https://bsc-dataseed.binance.org",
    "https://bsc-rpc.publicnode.com",
    "https://binance.llamarpc.com",
  ],
  [arbitrum.id]: [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum-one-rpc.publicnode.com",
    "https://arbitrum.llamarpc.com",
  ],
  [optimism.id]: [
    "https://mainnet.optimism.io",
    "https://optimism-rpc.publicnode.com",
    "https://optimism.llamarpc.com",
  ],
};

export function getRpcUrl(chainId: number) {
  return RPC_URLS[chainId]?.[0] ?? RPC_URLS[base.id]![0];
}

export function getRpcTransport(chainId: number) {
  const urls = RPC_URLS[chainId] ?? RPC_URLS[base.id]!;
  return fallback(urls.map((url) => http(url, { timeout: 12_000 })));
}

export function getViemChain(chainId: number) {
  if (chainId === mainnet.id) return mainnet;
  if (chainId === cronos.id) return cronos as Chain;
  if (chainId === xrp.id) return xrp as Chain;
  if (chainId === polygon.id) return polygon as Chain;
  if (chainId === bsc.id) return bsc as Chain;
  if (chainId === arbitrum.id) return arbitrum as Chain;
  if (chainId === optimism.id) return optimism as Chain;
  return base;
}
