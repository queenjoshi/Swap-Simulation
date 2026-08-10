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
  id: 1440000,
  name: "XRP EVM",
  network: "xrp-evm",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xrplevm.org"] },
    public: { http: ["https://rpc.xrplevm.org"] },
  },
  blockExplorers: { default: { name: "XRPL EVM Explorer", url: "https://explorer.xrplevm.org" } },
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

export const avalanche = {
  id: 43114,
  name: "Avalanche",
  network: "avalanche",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    public: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
  },
  blockExplorers: { default: { name: "Snowtrace", url: "https://snowtrace.io" } },
  testnet: false,
} as const;

export const unichain = {
  id: 130,
  name: "Unichain",
  network: "unichain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.unichain.org"] },
    public: { http: ["https://mainnet.unichain.org"] },
  },
  blockExplorers: { default: { name: "Uniscan", url: "https://uniscan.xyz" } },
  testnet: false,
} as const;

export const robinhood = {
  id: 4663,
  name: "Robinhood Chain",
  network: "robinhood",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
    public: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Robinhood Chain Explorer", url: "https://robinhoodchain.blockscout.com" },
  },
  testnet: false,
} as const;

export const zora = {
  id: 7777777,
  name: "Zora",
  network: "zora",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.zora.energy"] },
    public: { http: ["https://rpc.zora.energy"] },
  },
  blockExplorers: {
    default: { name: "Zora Explorer", url: "https://explorer.zora.energy" },
  },
  testnet: false,
} as const;

export const SUPPORTED_CHAIN_IDS = [base.id, mainnet.id, cronos.id, xrp.id, polygon.id, bsc.id, arbitrum.id, optimism.id, avalanche.id, unichain.id, robinhood.id, zora.id] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export const CHAIN_OPTIONS = [
  { id: arbitrum.id, label: "Arbitrum", shortLabel: "Arbitrum", swap: true },
  { id: avalanche.id, label: "Avalanche", shortLabel: "Avalanche", swap: true },
  { id: base.id, label: "Base", shortLabel: "Base", swap: true },
  { id: bsc.id, label: "BNB Chain", shortLabel: "BNB", swap: true },
  { id: cronos.id, label: "Cronos", shortLabel: "Cronos", swap: false },
  { id: mainnet.id, label: "Ethereum", shortLabel: "ETH", swap: true },
  { id: optimism.id, label: "Optimism", shortLabel: "Optimism", swap: true },
  { id: polygon.id, label: "Polygon", shortLabel: "Polygon", swap: true },
  { id: robinhood.id, label: "Robinhood Chain", shortLabel: "Robinhood", swap: true },
  { id: unichain.id, label: "Unichain", shortLabel: "Unichain", swap: true },
  {
    id: xrp.id,
    label: "XRP EVM",
    shortLabel: "XRP",
    swap: true,
  },
  { id: zora.id, label: "Zora", shortLabel: "Zora", swap: false, catalog: true },
] as const;

export const SWAP_SUPPORTED_CHAIN_IDS: readonly number[] = CHAIN_OPTIONS
  .filter((chain) => chain.swap)
  .map((chain) => chain.id);

export function getChainName(chainId: number) {
  if (chainId === mainnet.id) return "Ethereum";
  if (chainId === base.id) return "Base";
  if (chainId === cronos.id) return "Cronos";
  if (chainId === xrp.id) return "XRPL EVM";
  if (chainId === polygon.id) return "Polygon";
  if (chainId === bsc.id) return "BNB Chain";
  if (chainId === arbitrum.id) return "Arbitrum";
  if (chainId === optimism.id) return "Optimism";
  if (chainId === avalanche.id) return "Avalanche";
  if (chainId === robinhood.id) return "Robinhood Chain";
  if (chainId === unichain.id) return "Unichain";
  if (chainId === zora.id) return "Zora";
  return "Unknown";
}

export function explorerName(chainId: number) {
  if (chainId === mainnet.id) return "Etherscan";
  if (chainId === base.id) return "Basescan";
  if (chainId === cronos.id) return "Cronoscan";
  if (chainId === xrp.id) return "XRPL EVM Explorer";
  if (chainId === polygon.id) return "Polygonscan";
  if (chainId === bsc.id) return "BscScan";
  if (chainId === arbitrum.id) return "Arbiscan";
  if (chainId === optimism.id) return "Optimism Explorer";
  if (chainId === avalanche.id) return "Snowtrace";
  if (chainId === robinhood.id) return "Robinhood Chain Explorer";
  if (chainId === unichain.id) return "Uniscan";
  if (chainId === zora.id) return "Zora Explorer";
  return "Explorer";
}

export function explorerTxUrl(chainId: number, hash: string) {
  if (chainId === mainnet.id) return `https://etherscan.io/tx/${hash}`;
  if (chainId === base.id) return `https://basescan.org/tx/${hash}`;
  if (chainId === cronos.id) return `https://cronoscan.com/tx/${hash}`;
  if (chainId === xrp.id) return `https://explorer.xrplevm.org/tx/${hash}`;
  if (chainId === polygon.id) return `https://polygonscan.com/tx/${hash}`;
  if (chainId === bsc.id) return `https://bscscan.com/tx/${hash}`;
  if (chainId === arbitrum.id) return `https://arbiscan.io/tx/${hash}`;
  if (chainId === optimism.id) return `https://optimistic.etherscan.io/tx/${hash}`;
  if (chainId === avalanche.id) return `https://snowtrace.io/tx/${hash}`;
  if (chainId === robinhood.id) return `https://robinhoodchain.blockscout.com/tx/${hash}`;
  if (chainId === unichain.id) return `https://uniscan.xyz/tx/${hash}`;
  if (chainId === zora.id) return `https://explorer.zora.energy/tx/${hash}`;
  return `https://basescan.org/tx/${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string) {
  if (chainId === mainnet.id) return `https://etherscan.io/address/${address}`;
  if (chainId === base.id) return `https://basescan.org/address/${address}`;
  if (chainId === cronos.id) return `https://cronoscan.com/address/${address}`;
  if (chainId === xrp.id) return `https://explorer.xrplevm.org/address/${address}`;
  if (chainId === polygon.id) return `https://polygonscan.com/address/${address}`;
  if (chainId === bsc.id) return `https://bscscan.com/address/${address}`;
  if (chainId === arbitrum.id) return `https://arbiscan.io/address/${address}`;
  if (chainId === optimism.id) return `https://optimistic.etherscan.io/address/${address}`;
  if (chainId === avalanche.id) return `https://snowtrace.io/address/${address}`;
  if (chainId === robinhood.id) return `https://robinhoodchain.blockscout.com/address/${address}`;
  if (chainId === unichain.id) return `https://uniscan.xyz/address/${address}`;
  if (chainId === zora.id) return `https://explorer.zora.energy/address/${address}`;
  return `https://basescan.org/address/${address}`;
}
