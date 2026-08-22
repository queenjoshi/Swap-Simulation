import { base, mainnet, berachain, hyperEvm, ink, linea, mantle, monad, plasma, scroll, sonic, worldchain } from "wagmi/chains";

export { berachain, hyperEvm, ink, linea, mantle, monad, plasma, scroll, sonic, worldchain };

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

export const SUPPORTED_CHAIN_IDS = [base.id, mainnet.id, cronos.id, polygon.id, bsc.id, arbitrum.id, optimism.id, avalanche.id, unichain.id, robinhood.id, zora.id, linea.id, scroll.id, mantle.id, worldchain.id, sonic.id, berachain.id, ink.id, monad.id, hyperEvm.id, plasma.id] as const;
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
  { id: zora.id, label: "Zora", shortLabel: "Zora", swap: false, catalog: true },
  { id: linea.id, label: "Linea", shortLabel: "Linea", swap: true },
  { id: scroll.id, label: "Scroll", shortLabel: "Scroll", swap: true },
  { id: mantle.id, label: "Mantle", shortLabel: "Mantle", swap: true },
  { id: worldchain.id, label: "World Chain", shortLabel: "World", swap: true },
  { id: sonic.id, label: "Sonic", shortLabel: "Sonic", swap: true },
  { id: berachain.id, label: "Berachain", shortLabel: "Bera", swap: true },
  { id: ink.id, label: "Ink", shortLabel: "Ink", swap: true },
  { id: monad.id, label: "Monad", shortLabel: "Monad", swap: true },
  { id: hyperEvm.id, label: "HyperEVM", shortLabel: "HyperEVM", swap: true },
  { id: plasma.id, label: "Plasma", shortLabel: "Plasma", swap: true },
] as const;

export const SWAP_SUPPORTED_CHAIN_IDS: readonly number[] = CHAIN_OPTIONS
  .filter((chain) => chain.swap)
  .map((chain) => chain.id);

export function getChainName(chainId: number) {
  if (chainId === -2 || chainId === 1151111081099710) return "Solana";
  if (chainId === -1) return "XRP Ledger";
  if (chainId === mainnet.id) return "Ethereum";
  if (chainId === base.id) return "Base";
  if (chainId === cronos.id) return "Cronos";
  if (chainId === polygon.id) return "Polygon";
  if (chainId === bsc.id) return "BNB Chain";
  if (chainId === arbitrum.id) return "Arbitrum";
  if (chainId === optimism.id) return "Optimism";
  if (chainId === avalanche.id) return "Avalanche";
  if (chainId === robinhood.id) return "Robinhood Chain";
  if (chainId === unichain.id) return "Unichain";
  if (chainId === zora.id) return "Zora";
  if (chainId === linea.id) return "Linea";
  if (chainId === scroll.id) return "Scroll";
  if (chainId === mantle.id) return "Mantle";
  if (chainId === worldchain.id) return "World Chain";
  if (chainId === sonic.id) return "Sonic";
  if (chainId === berachain.id) return "Berachain";
  if (chainId === ink.id) return "Ink";
  if (chainId === monad.id) return "Monad";
  if (chainId === hyperEvm.id) return "HyperEVM";
  if (chainId === plasma.id) return "Plasma";
  return "Unknown";
}

export function explorerName(chainId: number) {
  if (chainId === -2) return "Solscan";
  if (chainId === -1) return "XRPL Explorer";
  if (chainId === mainnet.id) return "Etherscan";
  if (chainId === base.id) return "Basescan";
  if (chainId === cronos.id) return "Cronoscan";
  if (chainId === polygon.id) return "Polygonscan";
  if (chainId === bsc.id) return "BscScan";
  if (chainId === arbitrum.id) return "Arbiscan";
  if (chainId === optimism.id) return "Optimism Explorer";
  if (chainId === avalanche.id) return "Snowtrace";
  if (chainId === robinhood.id) return "Robinhood Chain Explorer";
  if (chainId === unichain.id) return "Uniscan";
  if (chainId === zora.id) return "Zora Explorer";
  const chain = NEW_EVM_CHAINS.find((candidate) => candidate.id === chainId);
  if (chain) return chain.blockExplorers.default.name;
  return "Explorer";
}

const NEW_EVM_CHAINS = [linea, scroll, mantle, worldchain, sonic, berachain, ink, monad, hyperEvm, plasma] as const;

function newChainExplorerUrl(chainId: number) {
  return NEW_EVM_CHAINS.find((chain) => chain.id === chainId)?.blockExplorers.default.url;
}

export function explorerTxUrl(chainId: number, hash: string) {
  if (chainId === -2) return `https://solscan.io/tx/${hash}`;
  if (chainId === -1) return `https://livenet.xrpl.org/transactions/${hash}`;
  if (chainId === mainnet.id) return `https://etherscan.io/tx/${hash}`;
  if (chainId === base.id) return `https://basescan.org/tx/${hash}`;
  if (chainId === cronos.id) return `https://cronoscan.com/tx/${hash}`;
  if (chainId === polygon.id) return `https://polygonscan.com/tx/${hash}`;
  if (chainId === bsc.id) return `https://bscscan.com/tx/${hash}`;
  if (chainId === arbitrum.id) return `https://arbiscan.io/tx/${hash}`;
  if (chainId === optimism.id) return `https://optimistic.etherscan.io/tx/${hash}`;
  if (chainId === avalanche.id) return `https://snowtrace.io/tx/${hash}`;
  if (chainId === robinhood.id) return `https://robinhoodchain.blockscout.com/tx/${hash}`;
  if (chainId === unichain.id) return `https://uniscan.xyz/tx/${hash}`;
  if (chainId === zora.id) return `https://explorer.zora.energy/tx/${hash}`;
  const explorerUrl = newChainExplorerUrl(chainId);
  if (explorerUrl) return `${explorerUrl}/tx/${hash}`;
  return `https://basescan.org/tx/${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string) {
  if (chainId === mainnet.id) return `https://etherscan.io/address/${address}`;
  if (chainId === base.id) return `https://basescan.org/address/${address}`;
  if (chainId === cronos.id) return `https://cronoscan.com/address/${address}`;
  if (chainId === polygon.id) return `https://polygonscan.com/address/${address}`;
  if (chainId === bsc.id) return `https://bscscan.com/address/${address}`;
  if (chainId === arbitrum.id) return `https://arbiscan.io/address/${address}`;
  if (chainId === optimism.id) return `https://optimistic.etherscan.io/address/${address}`;
  if (chainId === avalanche.id) return `https://snowtrace.io/address/${address}`;
  if (chainId === robinhood.id) return `https://robinhoodchain.blockscout.com/address/${address}`;
  if (chainId === unichain.id) return `https://uniscan.xyz/address/${address}`;
  if (chainId === zora.id) return `https://explorer.zora.energy/address/${address}`;
  const explorerUrl = newChainExplorerUrl(chainId);
  if (explorerUrl) return `${explorerUrl}/address/${address}`;
  return `https://basescan.org/address/${address}`;
}
