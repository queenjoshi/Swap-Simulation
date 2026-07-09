import { base, mainnet } from "wagmi/chains";

export const cronos = {
  id: 25,
  name: "Cronos",
  network: "cronos",
  nativeCurrency: { name: "Cronos", symbol: "CRO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.cronos.org"] },
    public: { http: ["https://mainnet.cronos.org"] },
  },
  blockExplorers: { default: { name: "Cronoscan", url: "https://cronoscan.com" } },
  testnet: false,
} as const;

export const xrp = {
  id: 1440002,
  name: "XRP EVM",
  network: "xrp-evm",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evm-sidechain.xrpl.org/"] },
    public: { http: ["https://evm-sidechain.xrpl.org/"] },
  },
  blockExplorers: { default: { name: "XRP Explorer", url: "https://evm-sidechain.xrpl.org/" } },
  testnet: false,
} as const;

export const polygon = {
  id: 137,
  name: "Polygon",
  network: "polygon",
  nativeCurrency: { name: "Polygon", symbol: "POL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://polygon-rpc.com"] },
    public: { http: ["https://polygon-rpc.com"] },
  },
  blockExplorers: { default: { name: "Polygonscan", url: "https://polygonscan.com" } },
  testnet: false,
} as const;

export const bsc = {
  id: 56,
  name: "BNB Chain",
  network: "bsc",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://bsc-dataseed.binance.org"] },
    public: { http: ["https://bsc-dataseed.binance.org"] },
  },
  blockExplorers: { default: { name: "BscScan", url: "https://bscscan.com" } },
  testnet: false,
} as const;

export const arbitrum = {
  id: 42161,
  name: "Arbitrum",
  network: "arbitrum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://arb1.arbitrum.io/rpc"] },
    public: { http: ["https://arb1.arbitrum.io/rpc"] },
  },
  blockExplorers: { default: { name: "Arbiscan", url: "https://arbiscan.io" } },
  testnet: false,
} as const;

export const optimism = {
  id: 10,
  name: "Optimism",
  network: "optimism",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.optimism.io"] },
    public: { http: ["https://mainnet.optimism.io"] },
  },
  blockExplorers: { default: { name: "Optimism Explorer", url: "https://optimistic.etherscan.io" } },
  testnet: false,
} as const;

export const SUPPORTED_CHAIN_IDS = [base.id, mainnet.id, cronos.id, xrp.id, polygon.id, bsc.id, arbitrum.id, optimism.id] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export const CHAIN_OPTIONS = [
  { id: arbitrum.id, label: "Arbitrum", shortLabel: "Arbitrum", swap: true },
  { id: base.id, label: "Base", shortLabel: "Base", swap: true },
  { id: bsc.id, label: "BNB Chain", shortLabel: "BNB", swap: true },
  { id: cronos.id, label: "Cronos", shortLabel: "Cronos", swap: false },
  { id: mainnet.id, label: "Ethereum", shortLabel: "ETH", swap: true },
  { id: optimism.id, label: "Optimism", shortLabel: "Optimism", swap: true },
  { id: polygon.id, label: "Polygon", shortLabel: "Polygon", swap: true },
  { id: xrp.id, label: "XRP EVM", shortLabel: "XRP", swap: false },
] as const;

export const SWAP_SUPPORTED_CHAIN_IDS: readonly number[] = CHAIN_OPTIONS
  .filter((chain) => chain.swap)
  .map((chain) => chain.id);

export function getChainName(chainId: number) {
  if (chainId === mainnet.id) return "Ethereum";
  if (chainId === base.id) return "Base";
  if (chainId === cronos.id) return "Cronos";
  if (chainId === xrp.id) return "XRP Ledger";
  if (chainId === polygon.id) return "Polygon";
  if (chainId === bsc.id) return "BNB Chain";
  if (chainId === arbitrum.id) return "Arbitrum";
  if (chainId === optimism.id) return "Optimism";
  return "Unknown";
}

export function explorerName(chainId: number) {
  if (chainId === mainnet.id) return "Etherscan";
  if (chainId === base.id) return "Basescan";
  if (chainId === cronos.id) return "Cronoscan";
  if (chainId === xrp.id) return "XRPScan";
  if (chainId === polygon.id) return "Polygonscan";
  if (chainId === bsc.id) return "BscScan";
  if (chainId === arbitrum.id) return "Arbiscan";
  if (chainId === optimism.id) return "Optimism Explorer";
  return "Explorer";
}

export function explorerTxUrl(chainId: number, hash: string) {
  if (chainId === mainnet.id) return `https://etherscan.io/tx/${hash}`;
  if (chainId === base.id) return `https://basescan.org/tx/${hash}`;
  if (chainId === cronos.id) return `https://cronoscan.com/tx/${hash}`;
  if (chainId === xrp.id) return `https://xrpscan.com/tx/${hash}`;
  if (chainId === polygon.id) return `https://polygonscan.com/tx/${hash}`;
  if (chainId === bsc.id) return `https://bscscan.com/tx/${hash}`;
  if (chainId === arbitrum.id) return `https://arbiscan.io/tx/${hash}`;
  if (chainId === optimism.id) return `https://optimistic.etherscan.io/tx/${hash}`;
  return `https://basescan.org/tx/${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string) {
  if (chainId === mainnet.id) return `https://etherscan.io/address/${address}`;
  if (chainId === base.id) return `https://basescan.org/address/${address}`;
  if (chainId === cronos.id) return `https://cronoscan.com/address/${address}`;
  if (chainId === xrp.id) return `https://xrpscan.com/account/${address}`;
  if (chainId === polygon.id) return `https://polygonscan.com/address/${address}`;
  if (chainId === bsc.id) return `https://bscscan.com/address/${address}`;
  if (chainId === arbitrum.id) return `https://arbiscan.io/address/${address}`;
  if (chainId === optimism.id) return `https://optimistic.etherscan.io/address/${address}`;
  return `https://basescan.org/address/${address}`;
}
