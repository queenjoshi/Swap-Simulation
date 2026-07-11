import { getAddress } from "viem";
import { base, mainnet } from "wagmi/chains";
import { arbitrum, avalanche, bsc, cronos, optimism, polygon, unichain, xrp } from "@/lib/chains";

export type Token = {
  symbol: string;
  name: string;
  address?: `0x${string}`;
  decimals?: number;
  chainId: number;
};

export const HOUSE_WALLET: `0x${string}` = getAddress(
  "0x6736d2eA9807297F0e56967361B9410854B86a5f",
);

export const USDC_BASE: `0x${string}` = getAddress(
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
);

export const USDC_ETHEREUM: `0x${string}` = getAddress(
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
);

export const USDT_ETHEREUM: `0x${string}` = getAddress(
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
);

export const SHIB_ETHEREUM: `0x${string}` = getAddress(
  "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
);

export const TOKENS: Token[] = [
  // ─── Base ────────────────────────────────────────────────
  {
    symbol: "ETH",
    name: "Ether",
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: USDC_BASE,
    chainId: base.id,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: getAddress("0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"),
    chainId: base.id,
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x4200000000000000000000000000000000000006"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    address: getAddress("0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf"),
    chainId: base.id,
    decimals: 8,
  },
  {
    symbol: "QUEENJOSHI",
    name: "Queen Joshi",
    address: getAddress("0x1f2f727f043e5f92371f853084242a3584c70aa5"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "KINGJOSHI",
    name: "King Joshi",
    address: getAddress("0x8a668278adb0638df48411dc9971e1ad29516483"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "SHIB",
    name: "SchismaticShib",
    address: getAddress("0xFCa95aeb5bF44aE355806A5ad14659c940dC6BF7"),
    chainId: base.id,
    decimals: 9,
  },
  {
    symbol: "AERO",
    name: "Aerodrome Finance",
    address: getAddress("0x940181a94a35a4569e4529a3cdfb74e38fd98631"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "BRETT",
    name: "Brett",
    address: getAddress("0x532f27101965dd16442e59d40670faf5ebb142e4"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "MOG",
    name: "Mog Coin",
    address: getAddress("0x2Da56AcB9Ea78330f947bD57C54119Debda7AF71"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "TOSHI",
    name: "Toshi",
    address: getAddress("0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2b4"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "VIRTUAL",
    name: "Virtuals Protocol",
    address: getAddress("0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "DEGEN",
    name: "Degen",
    address: getAddress("0x4ed4e862860bed7a9570b96d89af5e1b0efefed"),
    chainId: base.id,
    decimals: 18,
  },

  // ─── Ethereum mainnet ────────────────────────────────────
  {
    symbol: "ETH",
    name: "Ether",
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: USDT_ETHEREUM,
    chainId: mainnet.id,
    decimals: 6,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: USDC_ETHEREUM,
    chainId: mainnet.id,
    decimals: 6,
  },
  {
    symbol: "SHIB",
    name: "Shiba Inu",
    address: SHIB_ETHEREUM,
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "BONE",
    name: "BONE",
    address: getAddress("0x9813037ee2218799597d83D4a5B6F3b6778218d9"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "TREAT",
    name: "Treat146b",
    address: getAddress("0xfbd5fd3f85e9f4c5e8b40eec9f8b8ab1caaa146b"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "OSCAR",
    name: "Oscar",
    address: getAddress("0xeBb66a88cEdd12bfE3a289df6DFEe377F2963F12"),
    chainId: mainnet.id,
    decimals: 9,
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    address: getAddress("0xb8c77482e45f1f44de1745f52c74426c631bdd52"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "MAME",
    name: "Mame Inu",
    address: getAddress("0x38c8e615bb97cb1dcd7c19473d8bc9a65638bccb"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: getAddress("0x6B175474E89094C44Da98b954EedeAC495271d0F"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: getAddress("0x514910771AF9Ca656af840dff83E8264EcF986CA"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "AAVE",
    name: "Aave",
    address: getAddress("0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    address: getAddress("0x6982508145454Ce325dDbE47a25d4ec3d2311933"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "FLOKI",
    name: "FLOKI",
    address: getAddress("0xcf0c122c6b73ff809c693db761e7baebe62b6a2e"),
    chainId: mainnet.id,
    decimals: 9,
  },

  // ─── Cronos ─────────────────────────────────────────────
  {
    symbol: "CRO",
    name: "Cronos",
    chainId: cronos.id,
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ethereum (Cronos)",
    address: getAddress("0xe44Fd7fCb2b1581822D0c862B68222998a0c299a"),
    chainId: cronos.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin (Cronos)",
    address: getAddress("0xc21223249CA28397B4B6541dfFaEcC539BfF0c59"),
    chainId: cronos.id,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD (Cronos)",
    address: getAddress("0x66e428c3f67a68878562e79A0234c1F83c208770"),
    chainId: cronos.id,
    decimals: 6,
  },
  {
    symbol: "KIND",
    name: "Kindred",
    address: getAddress("0xb65E00EA8A113a819628A240d4c1702dB5cc7aaE"),
    chainId: cronos.id,
    decimals: 18,
  },
  {
    symbol: "NBAA",
    name: "NBAA",
    address: getAddress("0x190Fd3e5172a41F8048D3F9D82e2ee2b2f8a29DD"),
    chainId: cronos.id,
    decimals: 18,
  },

  // ─── Polygon ─────────────────────────────────────────────
  {
    symbol: "POL",
    name: "Polygon Ecosystem Token",
    chainId: polygon.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: getAddress("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"),
    chainId: polygon.id,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: getAddress("0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
    chainId: polygon.id,
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"),
    chainId: polygon.id,
    decimals: 18,
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: getAddress("0x1BFD62B7D66453f26932296AB7c5409E839A7656"),
    chainId: polygon.id,
    decimals: 8,
  },
  {
    symbol: "AAVE",
    name: "Aave",
    address: getAddress("0xd6df932a45c0f255f85145f286ea0b292b21c90b"),
    chainId: polygon.id,
    decimals: 18,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: getAddress("0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39"),
    chainId: polygon.id,
    decimals: 18,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: getAddress("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"),
    chainId: polygon.id,
    decimals: 18,
  },

  // ─── BNB Chain ───────────────────────────────────────────
  {
    symbol: "BNB",
    name: "Binance Coin",
    chainId: bsc.id,
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: getAddress("0x55d398326f99059fF775485246999027B3197955"),
    chainId: bsc.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: getAddress("0x8AC76a51cc950d9822D68b83FE1Ad97B32Cd580d"),
    chainId: bsc.id,
    decimals: 18,
  },
  {
    symbol: "DOGE",
    name: "Binance-Peg Dogecoin",
    address: getAddress("0xbA2aE424d960c26247Dd6c32edC70B295c744C43"),
    chainId: bsc.id,
    decimals: 8,
  },
  {
    symbol: "FDUSD",
    name: "First Digital USD",
    address: getAddress("0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409"),
    chainId: bsc.id,
    decimals: 18,
  },
  {
    symbol: "CAKE",
    name: "PancakeSwap Token",
    address: getAddress("0x0E09FaBB73Bd3Ade0A17ECC321fD13a19E81cE82"),
    chainId: bsc.id,
    decimals: 18,
  },
  {
    symbol: "BabyDoge",
    name: "Baby Doge Coin",
    address: getAddress("0xc748673057861a797275CD8A068AbB95A902e8de"),
    chainId: bsc.id,
    decimals: 9,
  },

  // ─── Arbitrum ────────────────────────────────────────────
  {
    symbol: "ARB",
    name: "Arbitrum",
    address: getAddress("0x912CE59144191C1204E64559FE8253a0e49E6548"),
    chainId: arbitrum.id,
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ether",
    chainId: arbitrum.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: getAddress("0xaf88d065e77c8cC2239327C5EDb3A432268e5831"),
    chainId: arbitrum.id,
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x82af49447d8a07e3bd95bd0d56f35241523fbab1"),
    chainId: arbitrum.id,
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: getAddress("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"),
    chainId: arbitrum.id,
    decimals: 6,
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: getAddress("0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"),
    chainId: arbitrum.id,
    decimals: 8,
  },
  {
    symbol: "GMX",
    name: "GMX",
    address: getAddress("0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a"),
    chainId: arbitrum.id,
    decimals: 18,
  },
  {
    symbol: "MAGIC",
    name: "MAGIC",
    address: getAddress("0x539bdE0d7Dbd336b79148AA742883198BBF60342"),
    chainId: arbitrum.id,
    decimals: 18,
  },

  // ─── Optimism ────────────────────────────────────────────
  {
    symbol: "OP",
    name: "Optimism",
    address: getAddress("0x4200000000000000000000000000000000000042"),
    chainId: optimism.id,
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ether",
    chainId: optimism.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: getAddress("0x0b2C639c533813f4Aa9D7837CAe62653423a6504"),
    chainId: optimism.id,
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x4200000000000000000000000000000000000006"),
    chainId: optimism.id,
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: getAddress("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58"),
    chainId: optimism.id,
    decimals: 6,
  },
  {
    symbol: "SNX",
    name: "Synthetix Network",
    address: getAddress("0x8700daec35af8ff88c16bdf0418774cb3d7599b4"),
    chainId: optimism.id,
    decimals: 18,
  },
  {
    symbol: "VELO",
    name: "Velodrome",
    address: getAddress("0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db"),
    chainId: optimism.id,
    decimals: 18,
  },

  // ─── Avalanche ──────────────────────────────────────────
  {
    symbol: "AVAX",
    name: "Avalanche",
    chainId: avalanche.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: getAddress("0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"),
    chainId: avalanche.id,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: getAddress("0xc7198437980c041c805a1edcba50c1ce5db95118"),
    chainId: avalanche.id,
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab"),
    chainId: avalanche.id,
    decimals: 18,
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: getAddress("0x50b7545627a5162f82a992c33b87adc75187b218"),
    chainId: avalanche.id,
    decimals: 8,
  },

  // ─── Unichain ───────────────────────────────────────────
  {
    symbol: "ETH",
    name: "Ether",
    chainId: unichain.id,
    decimals: 18,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x4200000000000000000000000000000000000006"),
    chainId: unichain.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: getAddress("0x078d782b760474a361dda0af3839290b0ef57ad6"),
    chainId: unichain.id,
    decimals: 6,
  },

  // ─── XRP Ledger EVM Sidechain ────────────────────────────
  {
    symbol: "XRP",
    name: "XRP",
    chainId: xrp.id,
    decimals: 6,
  },
  {
    symbol: "ETH",
    name: "Ethereum (XRP EVM)",
    address: getAddress("0x6b175474e89094c44da98b954eedeac495271d0f"),
    chainId: xrp.id,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin (XRP EVM)",
    address: getAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    chainId: xrp.id,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD (XRP EVM)",
    address: getAddress("0xdac17f958d2ee523a2206206994597c13d831ec7"),
    chainId: xrp.id,
    decimals: 6,
  },
];

export function tokensForChain(chainId: number) {
  return TOKENS.filter((t) => t.chainId === chainId);
}

export function defaultSellForChain(chainId: number) {
  const list = tokensForChain(chainId);
  if (chainId === mainnet.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === base.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === cronos.id) return list.find((t) => t.symbol === "CRO") ?? list[0]!;
  if (chainId === xrp.id) return list.find((t) => t.symbol === "XRP") ?? list[0]!;
  if (chainId === polygon.id) return list.find((t) => t.symbol === "POL") ?? list[0]!;
  if (chainId === bsc.id) return list.find((t) => t.symbol === "BNB") ?? list[0]!;
  if (chainId === arbitrum.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === optimism.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === avalanche.id) return list.find((t) => t.symbol === "AVAX") ?? list[0]!;
  if (chainId === unichain.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  return list.find((t) => t.symbol === "ETH") ?? list[0]!;
}

export function defaultBuyForChain(chainId: number) {
  const list = tokensForChain(chainId);
  if (chainId === mainnet.id) return list.find((t) => t.symbol === "BONE") ?? list[1] ?? list[0]!;
  if (chainId === base.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === cronos.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === xrp.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === polygon.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === bsc.id) return list.find((t) => t.symbol === "USDT") ?? list[1] ?? list[0]!;
  if (chainId === arbitrum.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === optimism.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === avalanche.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === unichain.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
}

export const DEFAULT_SELL = defaultSellForChain(base.id);
export const DEFAULT_BUY = defaultBuyForChain(base.id);

export function tokenId(t: Token) {
  return `${t.chainId}:${t.address?.toLowerCase() ?? "native"}`;
}

export function isNative(t: Token) {
  return !t.address;
}

export function tokenDecimals(t: Token): number {
  return isNative(t) ? 18 : (t.decimals ?? 18);
}

export function isUsdStableToken(t: Token) {
  return t.symbol === "USDC" || t.symbol === "USDT" || t.symbol === "DAI";
}
