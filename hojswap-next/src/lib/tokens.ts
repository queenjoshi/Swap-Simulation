import { getAddress } from "viem";
import { base, mainnet } from "wagmi/chains";
import {
  arbitrum,
  avalanche,
  berachain,
  bsc,
  cronos,
  hyperEvm,
  ink,
  linea,
  mantle,
  monad,
  optimism,
  plasma,
  polygon,
  robinhood,
  scroll,
  sonic,
  unichain,
  worldchain,
  zora,
} from "@/lib/chains";

export type Token = {
  symbol: string;
  name: string;
  address?: `0x${string}`;
  decimals?: number;
  chainId: number;
  logo?: string | readonly string[];
  imported?: boolean;
  trending?: boolean;
  providerListed?: boolean;
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
    symbol: "cbXRP",
    name: "Coinbase Wrapped XRP",
    address: getAddress("0xcb585250f852c6c6bf90434ab21a00f02833a4af"),
    chainId: base.id,
    decimals: 6,
    logo: "/tokens/xrp.png",
  },
  {
    symbol: "cbDOGE",
    name: "Coinbase Wrapped DOGE",
    address: getAddress("0xcbd06e5a2b0c65597161de254aa074e489deb510"),
    chainId: base.id,
    decimals: 8,
    logo: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png",
  },
  {
    symbol: "cbLTC",
    name: "Coinbase Wrapped LTC",
    address: getAddress("0xcb17c9db87b595717c857a08468793f5bab6445f"),
    chainId: base.id,
    decimals: 8,
    logo: "https://assets.coingecko.com/coins/images/2/standard/litecoin.png",
  },
  {
    symbol: "cbADA",
    name: "Coinbase Wrapped ADA",
    address: getAddress("0xcbada732173e39521cdbe8bf59a6dc85a9fc7b8c"),
    chainId: base.id,
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/975/standard/cardano.png",
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
    symbol: "TOTEM",
    name: "Totem",
    address: getAddress("0x0f8ac22b85076f9bfe0b93cc49fb6426cb150f88"),
    chainId: base.id,
    decimals: 18,
    logo: "https://www.totemprotocol.io/logo.png",
  },
  {
    symbol: "SHIB",
    name: "SchismaticShib",
    address: getAddress("0xFCa95aeb5bF44aE355806A5ad14659c940dC6BF7"),
    chainId: base.id,
    decimals: 9,
    logo: "https://s2.coinmarketcap.com/static/img/coins/200x200/37553.png",
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
    symbol: "CAW",
    name: "crow with knife",
    address: getAddress("0xdfbea88c4842d30c26669602888d746d30f9d60d"),
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
    symbol: "MORPHO",
    name: "Morpho",
    address: getAddress("0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "DEGEN",
    name: "Degen",
    address: getAddress("0x4ed4e862860bed51a9570b96d89af5e1b0efefed"),
    chainId: base.id,
    decimals: 18,
  },
  {
    symbol: "mr_lightspeed",
    name: "Mr. Lightspeed Creator Coin",
    address: getAddress("0xf0cb96a4011a0a6f73d100c7080bf8020d10f87a"),
    chainId: base.id,
    decimals: 18,
    logo: "/tokens/mr-lightspeed.jpg",
  },
  {
    symbol: "ZORA",
    name: "Zora",
    address: getAddress("0x1111111111166b7FE7bd91427724B487980aFc69"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/54693/large/zora.jpg",
  },
  {
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    address: getAddress("0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22"),
    chainId: base.id,
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/27008/large/cbeth.png",
  },
  {
    symbol: "EURC",
    name: "EURC",
    address: getAddress("0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42"),
    chainId: base.id,
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/26045/standard/euro.png",
  },
  {
    symbol: "WELL",
    name: "Moonwell",
    address: getAddress("0xA88594D404727625A9437C3f886C7643872296AE"),
    chainId: base.id,
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/26133/large/WELL.png",
  },
  {
    symbol: "AIXBT",
    name: "aixbt by Virtuals",
    address: getAddress("0x4F9Fd6Be4a90f2620860d680c0d4d5Fb53d1A825"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/51784/large/3.png",
  },
  {
    symbol: "KAITO",
    name: "Kaito",
    address: getAddress("0x98d0baa52b2D063E780DE12F615f963Fe8537553"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/54411/large/Qm4DW488_400x400.jpg",
  },
  {
    symbol: "CLANKER",
    name: "tokenbot",
    address: getAddress("0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/51440/large/CLANKER.png",
  },
  {
    symbol: "SPX",
    name: "SPX6900",
    address: getAddress("0x50da645f148798f68ef2d7db7c1cb22a6819bb2c"),
    chainId: base.id,
    decimals: 8,
    logo: "https://coin-images.coingecko.com/coins/images/31401/large/centeredcoin_%281%29.png",
  },
  {
    symbol: "SYRUP",
    name: "Maple Finance",
    address: getAddress("0x688aee022aa544f150678b8e5720b6b96a9e9a2f"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/51232/large/_syrup_token_logo.png",
  },
  {
    symbol: "FLUID",
    name: "Fluid",
    address: getAddress("0x61e030a56d33e8260fdd81f03b162a79fe3449cd"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/14688/large/Frame_1686566116_%281%29_%281%29.png",
  },
  {
    symbol: "COW",
    name: "CoW Protocol",
    address: getAddress("0xc694a91e6b071bf030a18bd3053a7fe09b6dae69"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/24384/large/CoW-token_logo.png",
  },
  {
    symbol: "EUL",
    name: "Euler",
    address: getAddress("0xa153ad732f831a79b5575fa02e793ec4e99181b0"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/26149/large/Coingecko_logo_%281%29.png",
  },
  {
    symbol: "ZRO",
    name: "LayerZero",
    address: getAddress("0x6985884c4392d348587b19cb9eaaf157f13271cd"),
    chainId: base.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x6985884C4392D348587B19cb9eAAf157F13271cd/logo.png",
  },
  {
    symbol: "W",
    name: "Wormhole",
    address: getAddress("0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91"),
    chainId: base.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91/logo.png",
  },
  {
    symbol: "AXL",
    name: "Axelar",
    address: getAddress("0x23ee2343b892b1bb63503a4fabc840e0e2c6810f"),
    chainId: base.id,
    decimals: 6,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x23ee2343b892b1bb63503a4fabc840e0e2c6810f/logo.png",
  },
  {
    symbol: "SUSHI",
    name: "Sushi",
    address: getAddress("0x7d49a065d17d6d4a55dc13649901fdbb98b2afba"),
    chainId: base.id,
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/12271/standard/512x512_Logo_no_chop.png",
  },
  {
    symbol: "NPC",
    name: "Non-Playable Coin",
    address: getAddress("0xb166e8b140d35d9d8226e40c09f757bac5a4d87d"),
    chainId: base.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xb166e8b140d35d9d8226e40c09f757bac5a4d87d/logo.png",
  },
  {
    symbol: "TIBBIR",
    name: "Ribbita by Virtuals",
    address: getAddress("0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00"),
    chainId: base.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00/logo.png",
  },
  {
    symbol: "DOGINME",
    name: "doginme",
    address: getAddress("0x6921B130D297cc43754afba22e5EAc0FBf8Db75b"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/35123/large/doginme-logo1-transparent200.png",
  },
  {
    symbol: "SKI",
    name: "Ski Mask Dog",
    address: getAddress("0x768BE13e1680b5ebE0024C42c896E3dB59ec0149"),
    chainId: base.id,
    decimals: 9,
    logo: "https://coin-images.coingecko.com/coins/images/37195/large/32992128-F52F-4346-84CA-8E0C48F43606.jpeg",
  },
  {
    symbol: "KEYCAT",
    name: "Keyboard Cat",
    address: getAddress("0x9a26F5433671751C3276a065f57e5a02D2817973"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/36608/large/IMG_9500.jpeg",
  },
  {
    symbol: "BENJI",
    name: "Basenji",
    address: getAddress("0xBC45647eA894030a4E9801Ec03479739FA2485F0"),
    chainId: base.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/36416/large/photo_2025-12-04_22.13.35.png",
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
    symbol: "1INCH",
    name: "1inch",
    address: getAddress("0x111111111117dc0aa78b770fa6a738034120c302"),
    chainId: mainnet.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/13469/large/1inch-logo.jpeg",
  },
  {
    symbol: "YFI",
    name: "yearn.finance",
    address: getAddress("0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e"),
    chainId: mainnet.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/11849/large/yearn.jpg",
  },
  {
    symbol: "BAL",
    name: "Balancer",
    address: getAddress("0xba100000625a3754423978a60c9317c58a424e3d"),
    chainId: mainnet.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/11683/large/Balancer.png",
  },
  {
    symbol: "CVX",
    name: "Convex Finance",
    address: getAddress("0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b"),
    chainId: mainnet.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/15585/large/convex.png",
  },
  {
    symbol: "GNO",
    name: "Gnosis",
    address: getAddress("0x6810e776880c02933d47db1b9fc05908e5386b96"),
    chainId: mainnet.id,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/662/large/logo_square_simple_300px.png",
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
  {
    symbol: "ONDO",
    name: "Ondo",
    address: getAddress("0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "ENA",
    name: "Ethena",
    address: getAddress("0x57e114b691db790c35207b2e685d4a43181e6061"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "USDe",
    name: "Ethena USDe",
    address: getAddress("0x4c9edd5852cd905f086c759e8383e09bff1e68b3"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "PENDLE",
    name: "Pendle",
    address: getAddress("0x808507121b80c02388fad14726482e061b8da827"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "LDO",
    name: "Lido DAO",
    address: getAddress("0x5a98fcbea516cf06857215779fd812ca3bef1b32"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "EIGEN",
    name: "EigenLayer",
    address: getAddress("0xec53bf9167f50cdeb3ae105f56099aaab9061f83"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    address: getAddress("0x6c3ea9036406852006290770bedfcaba0e23a0e8"),
    chainId: mainnet.id,
    decimals: 6,
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: getAddress("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"),
    chainId: mainnet.id,
    decimals: 8,
  },
  {
    symbol: "CRV",
    name: "Curve DAO",
    address: getAddress("0xD533a949740bb3306d119CC777fa900bA034cd52"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "COMP",
    name: "Compound",
    address: getAddress("0xc00e94Cb662C3520282E6f5717214004A7f26888"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "ENS",
    name: "Ethereum Name Service",
    address: getAddress("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "GRT",
    name: "The Graph",
    address: getAddress("0xc944E90C64B2c07662A292be6244BDf05Cda44a7"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "RPL",
    name: "Rocket Pool",
    address: getAddress("0xD33526068D116cE69F19A9ee46F0bd304F21A51f"),
    chainId: mainnet.id,
    decimals: 18,
  },
  {
    symbol: "SKY",
    name: "Sky",
    address: getAddress("0x56072C95FAA701256059aa122697B133aDEd9279"),
    chainId: mainnet.id,
    decimals: 18,
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
    address: getAddress("0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"),
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
  {
    symbol: "QUICK",
    name: "QuickSwap",
    address: getAddress("0xB5C064F955D8e7F38fE0460C556a72987494eE17"),
    chainId: polygon.id,
    decimals: 18,
  },
  {
    symbol: "SAND",
    name: "The Sandbox",
    address: getAddress("0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683"),
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
  {
    symbol: "FLOKI",
    name: "FLOKI",
    address: getAddress("0xfb5B838b6cfEEdC2873aB27866079AC55363D37E"),
    chainId: bsc.id,
    decimals: 9,
  },
  {
    symbol: "XVS",
    name: "Venus",
    address: getAddress("0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63"),
    chainId: bsc.id,
    decimals: 18,
  },
  {
    symbol: "TWT",
    name: "Trust Wallet Token",
    address: getAddress("0x4B0F1812e5Df2A09796481Ff14017e6005508003"),
    chainId: bsc.id,
    decimals: 18,
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
  {
    symbol: "PENDLE",
    name: "Pendle",
    address: getAddress("0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8"),
    chainId: arbitrum.id,
    decimals: 18,
  },
  {
    symbol: "GRAIL",
    name: "Camelot Token",
    address: getAddress("0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8"),
    chainId: arbitrum.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8/logo.png",
  },
  {
    symbol: "RDNT",
    name: "Radiant Capital",
    address: getAddress("0x3082CC23568eA640225c2467653dB90e9250AaA0"),
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
    address: getAddress("0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"),
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
  {
    symbol: "WLD",
    name: "World",
    address: getAddress("0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1"),
    chainId: optimism.id,
    decimals: 18,
  },
  {
    symbol: "LUSD",
    name: "Liquity USD",
    address: getAddress("0xc40F949F8a4e094D1b49a23ea9241D289B7b2819"),
    chainId: optimism.id,
    decimals: 18,
  },
  {
    symbol: "WCT",
    name: "WalletConnect Token",
    address: getAddress("0xef4461891dfb3ac8572ccf7c794664a8dd927945"),
    chainId: optimism.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0xef4461891dfb3ac8572ccf7c794664a8dd927945/logo.png",
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
  {
    symbol: "JOE",
    name: "JoeToken",
    address: getAddress("0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd"),
    chainId: avalanche.id,
    decimals: 18,
  },
  {
    symbol: "PNG",
    name: "Pangolin",
    address: getAddress("0x60781C2586D68229fde47564546784ab3fACA982"),
    chainId: avalanche.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/0x60781C2586D68229fde47564546784ab3fACA982/logo.png",
  },
  {
    symbol: "QI",
    name: "BENQI",
    address: getAddress("0x8729438Eb15e2C8B576fCc6AeCdA6A148776C0F5"),
    chainId: avalanche.id,
    decimals: 18,
  },
  {
    symbol: "COQ",
    name: "Coq Inu",
    address: getAddress("0x420FcA0121DC28039145009570975747295f2329"),
    chainId: avalanche.id,
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/0x420FcA0121DC28039145009570975747295f2329/logo.png",
  },
  {
    symbol: "sAVAX",
    name: "BENQI Liquid Staked AVAX",
    address: getAddress("0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE"),
    chainId: avalanche.id,
    decimals: 18,
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
  {
    symbol: "UNI",
    name: "Uniswap",
    address: getAddress("0x8f187aA05619a017077f5308904739877ce9eA21"),
    chainId: unichain.id,
    decimals: 18,
  },

  // ─── Robinhood Chain ────────────────────────────────────
  {
    symbol: "ETH",
    name: "Ether",
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "USDG",
    name: "Global Dollar",
    address: getAddress("0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168"),
    chainId: robinhood.id,
    decimals: 6,
  },
  {
    symbol: "CASHCAT",
    name: "Cash Cat",
    address: getAddress("0x020bfC650A365f8BB26819deAAbF3E21291018b4"),
    chainId: robinhood.id,
    decimals: 18,
    logo: "https://cdn.dexscreener.com/token-images/og/robinhood/0x020bfc650a365f8bb26819deaabf3e21291018b4",
  },
  {
    symbol: "VEX",
    name: "ProjectVex",
    address: getAddress("0x8Ff92566f2e81BDd68EDfAa8cde73942A723796b"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "HOODRAT",
    name: "Hoodrat",
    address: getAddress("0x8e62F281f282686fCa6dCB39288069a93fC23F1c"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "JUGGERNAUT",
    name: "The Juggernaut",
    address: getAddress("0xD7321801CAae694090694Ff55A9323139F043B88"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "MYSTERY",
    name: "Mystery",
    address: getAddress("0xa5baC17a919A10Ba0628CDA5BCf273681e1a8D4e"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "ARROW",
    name: "Arrow",
    address: getAddress("0xf2915d1e3C1B0c769d0c756Ec43F1c1f6c99cD03"),
    chainId: robinhood.id,
    decimals: 18,
    logo: "https://cdn.dexscreener.com/cms/images/qVNDzbSwL8Gxq58J",
  },
  {
    symbol: "VIBE CAT",
    name: "Vibing Cat",
    address: getAddress("0x2355431b83B1A8E40172D099d90243D8D666b56B"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "ROBIN",
    name: "ROBIN",
    address: getAddress("0x55796b27Aa48444Fa2cAEF2BF902E12E9c280Dc9"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "CashDog",
    name: "CashDog",
    address: getAddress("0x473C2D32E28c66d7EF55a9c9f392325007366dDf"),
    chainId: robinhood.id,
    decimals: 18,
  },
  {
    symbol: "BOW",
    name: "bow.fun",
    address: getAddress("0x6f271710Cf296827E1249d305F9d3Ab8b77BBb03"),
    chainId: robinhood.id,
    decimals: 18,
  },

  // ─── Zora Network ───────────────────────────────────────
  {
    symbol: "ETH",
    name: "Ether",
    chainId: zora.id,
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: getAddress("0x4200000000000000000000000000000000000006"),
    chainId: zora.id,
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png",
  },

  // ─── Additional verified Base assets ────────────────────
  { symbol: "AAVE", name: "Aave", address: getAddress("0x63706e401c06ac8513145b7687A14804d17f814b"), chainId: base.id, decimals: 18 },
  { symbol: "DAI", name: "Dai Stablecoin", address: getAddress("0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"), chainId: base.id, decimals: 18 },
  { symbol: "USDbC", name: "USD Base Coin", address: getAddress("0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"), chainId: base.id, decimals: 6 },
  { symbol: "GHO", name: "GHO", address: getAddress("0x6Bb7a212910682DCFdbd5BCBb3e28FB4E8da10Ee"), chainId: base.id, decimals: 18 },
  { symbol: "USDS", name: "USDS", address: getAddress("0x820C137fa70C8691f0e44Dc420a5e53c168921Dc"), chainId: base.id, decimals: 18 },
  { symbol: "PRIME", name: "Echelon Prime", address: getAddress("0xfa980ced6895ac314e7de34ef1bfae90a5add21b"), chainId: base.id, decimals: 18 },
  { symbol: "wstETH", name: "Wrapped stETH", address: getAddress("0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452"), chainId: base.id, decimals: 18 },
  { symbol: "rETH", name: "Rocket Pool ETH", address: getAddress("0xB6fe221Fe9EeF5aba221C348bA20A1bF5e73624c"), chainId: base.id, decimals: 18 },
  { symbol: "1INCH", name: "1inch", address: getAddress("0xc5fecc3a29fb57b5024eec8a2239d4621e111cbe"), chainId: base.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13469/standard/1inch-token.png" },
  { symbol: "UNI", name: "Uniswap", address: getAddress("0xc3de830ea07524a0761646a6a4e4be0e114a3c83"), chainId: base.id, decimals: 18, logo: "https://ethereum-optimism.github.io/data/UNI/logo.png" },
  { symbol: "COMP", name: "Compound", address: getAddress("0x9e1028f5f1d5ede59748ffcee5532509976840e0"), chainId: base.id, decimals: 18, logo: "https://ethereum-optimism.github.io/data/COMP/logo.svg" },
  { symbol: "SEAM", name: "Seamless", address: getAddress("0x1c7a460413dd4e964f96d8dfc56e7223ce88cd85"), chainId: base.id, decimals: 18, logo: "https://basescan.org/token/images/seamless_32.png" },
  { symbol: "SNX", name: "Synthetix Network Token", address: getAddress("0x22e6966b799c4d5b13be962e1d117b56327fda66"), chainId: base.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png" },
  { symbol: "WCT", name: "WalletConnect Token", address: getAddress("0xef4461891dfb3ac8572ccf7c794664a8dd927945"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/50390/large/wc-token1.png" },
  { symbol: "ZRX", name: "0x Protocol Token", address: getAddress("0x3bb4445d30ac020a84c1b5a8a2c6248ebc9779d0"), chainId: base.id, decimals: 18, logo: "https://ethereum-optimism.github.io/data/ZRX/logo.png" },
  { symbol: "RPL", name: "Rocket Pool Protocol", address: getAddress("0x1f73eaf55d696bffa9b0ea16fa987b93b0f4d302"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/2090/large/rocket_pool_%28RPL%29.png" },
  { symbol: "ODOS", name: "Odos Token", address: getAddress("0xca73ed1815e5915489570014e024b7ebe65de679"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/52914/large/odos.jpg" },
  { symbol: "KEYCAT", name: "Keyboard Cat", address: getAddress("0x9a26f5433671751c3276a065f57e5a02d2817973"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/36608/large/keyboard_cat.jpeg" },
  { symbol: "doginme", name: "doginme", address: getAddress("0x6921b130d297cc43754afba22e5eac0fbf8db75b"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/35123/large/doginme-logo1-transparent200.png" },
  { symbol: "B3", name: "B3", address: getAddress("0xb3b32f9f8827d4634fe7d973fa1034ec9fddb3b3"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/54287/large/B3.png" },
  { symbol: "BNKR", name: "BankrCoin", address: getAddress("0x22af33fe49fd1fa80c7149773dde5890d3c76f3b"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/52626/large/bankr-static.png" },
  { symbol: "AVNT", name: "Avantis", address: getAddress("0x696f9436b67233384889472cd7cd58a6fb5df4f1"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/68972/large/avnt-token.png" },
  { symbol: "VVV", name: "Venice Token", address: getAddress("0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf"), chainId: base.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/54023/standard/Venice_Token_(1).png" },
  { symbol: "ALTT", name: "Altcoinist", address: getAddress("0x1B5cE2a593a840E3ad3549a34D7b3dEc697c114D"), chainId: base.id, decimals: 18 },
  { symbol: "CHECK", name: "Checkmate", address: getAddress("0x9126236476eFBA9Ad8aB77855c60eB5BF37586Eb"), chainId: base.id, decimals: 18 },
  { symbol: "DIEM", name: "Diem", address: getAddress("0xF4d97F2da56e8c3098f3a8D538DB630A2606a024"), chainId: base.id, decimals: 18 },
  { symbol: "EDEL", name: "Edel", address: getAddress("0xFb31f85A8367210B2e4Ed2360D2dA9Dc2D2Ccc95"), chainId: base.id, decimals: 18 },
  { symbol: "FLOCK", name: "FLock.io", address: getAddress("0x5aB3D4c385B400F3aBB49e80DE2fAF6a88A7B691"), chainId: base.id, decimals: 18 },
  { symbol: "FUN", name: "Sport.fun", address: getAddress("0x16EE7ecAc70d1028E7712751E2Ee6BA808a7dd92"), chainId: base.id, decimals: 18 },
  { symbol: "LFI", name: "LienFi", address: getAddress("0x3722264aB15a1dfCe5a5af89e6547F7949A8ABA3"), chainId: base.id, decimals: 18 },
  { symbol: "NOCK", name: "Nock", address: getAddress("0x9B5E262cF9bb04869ab40b19AF91D2dc85761722"), chainId: base.id, decimals: 16 },
  { symbol: "OMI", name: "OMI Token", address: getAddress("0x3792DBDD07e87413247DF995e692806aa13D3299"), chainId: base.id, decimals: 18 },
  { symbol: "PLAY", name: "Play", address: getAddress("0x853a7c99227499DbA9dB8C3A02aA691aFDeBf841"), chainId: base.id, decimals: 18 },
  { symbol: "POD", name: "Dolphin", address: getAddress("0xeD664536023d8E4b1640C394777D34aBAFF1dF8F"), chainId: base.id, decimals: 18 },
  { symbol: "RECALL", name: "Recall", address: getAddress("0x1f16e03C1a5908818F47f6EE7bB16690b40D0671"), chainId: base.id, decimals: 18 },
  { symbol: "REI", name: "Unit 00 - Rei", address: getAddress("0x6B2504A03ca4D43d0D73776F6aD46dAb2F2a4cFD"), chainId: base.id, decimals: 18 },
  { symbol: "REPPO", name: "REPPO", address: getAddress("0xFf8104251E7761163faC3211eF5583FB3F8583d6"), chainId: base.id, decimals: 18 },
  { symbol: "SAPIEN", name: "Sapien", address: getAddress("0xC729777d0470F30612B1564Fd96E8Dd26f5814E3"), chainId: base.id, decimals: 18 },
  { symbol: "TIG", name: "The Innovation Game", address: getAddress("0x0C03Ce270B4826Ec62e7DD007f0B716068639F7B"), chainId: base.id, decimals: 18 },
  { symbol: "TRUST", name: "Intuition", address: getAddress("0x6cd905dF2Ed214b22e0d48FF17CD4200C1C6d8A3"), chainId: base.id, decimals: 18 },
  { symbol: "weETH", name: "Wrapped eETH", address: getAddress("0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A"), chainId: base.id, decimals: 18 },
  { symbol: "openhuman", name: "openhuman", address: getAddress("0x38298138DD4389013962d8492FEAa5879408DBA3"), chainId: base.id, decimals: 18 },

  // ─── Additional verified Ethereum assets ────────────────
  { symbol: "MKR", name: "Maker", address: getAddress("0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"), chainId: mainnet.id, decimals: 18 },
  { symbol: "stETH", name: "Lido Staked Ether", address: getAddress("0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"), chainId: mainnet.id, decimals: 18 },
  { symbol: "wstETH", name: "Wrapped stETH", address: getAddress("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"), chainId: mainnet.id, decimals: 18 },
  { symbol: "rETH", name: "Rocket Pool ETH", address: getAddress("0xae78736Cd615f374D3085123A210448E74Fc6393"), chainId: mainnet.id, decimals: 18 },
  { symbol: "GHO", name: "GHO", address: getAddress("0x40D16FC0246aD3160ccc09B8D0D3A2cD28aE6c2f"), chainId: mainnet.id, decimals: 18 },
  { symbol: "USDS", name: "USDS", address: getAddress("0xdC035D45d973E3EC169d2276DDab16f1e407384F"), chainId: mainnet.id, decimals: 18 },
  { symbol: "FRAX", name: "Legacy Frax Dollar", address: getAddress("0x853d955aCEf822Db058eb8505911ED77F175b99e"), chainId: mainnet.id, decimals: 18 },
  { symbol: "LUSD", name: "Liquity USD", address: getAddress("0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"), chainId: mainnet.id, decimals: 18 },
  { symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", address: getAddress("0xBe9895146f7AF43049ca1c1AE358B0541Ea49704"), chainId: mainnet.id, decimals: 18 },
  { symbol: "ACN", name: "AITECH Cloud Network", address: getAddress("0x3e76dd57E649A263a532cC9bcC58b32A065fB2a4"), chainId: mainnet.id, decimals: 18 },
  { symbol: "ANYONE", name: "ANyONe Protocol", address: getAddress("0xFeAc2Eae96899709a43E252B6B92971D32F9C0F9"), chainId: mainnet.id, decimals: 18 },
  { symbol: "BLZ", name: "Bluzelle Token", address: getAddress("0x5732046A883704404F284Ce41FfADd5b007FD668"), chainId: mainnet.id, decimals: 18 },
  { symbol: "ETHFI", name: "ether.fi governance token", address: getAddress("0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB"), chainId: mainnet.id, decimals: 18 },
  { symbol: "FLUID", name: "Fluid", address: getAddress("0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb"), chainId: mainnet.id, decimals: 18 },
  { symbol: "Prometheus", name: "Prometheus", address: getAddress("0x3cdB41027D61C413e064E84D9c21812b6Ef004F1"), chainId: mainnet.id, decimals: 9 },
  { symbol: "RIO", name: "Realio Network", address: getAddress("0x94a8b4EE5CD64C79D0Ee816f467EA73009f51aA0"), chainId: mainnet.id, decimals: 18 },
  { symbol: "RLB", name: "Rollbit Coin", address: getAddress("0x046EeE2cc3188071C02BfC1745A6b17c656e3f3d"), chainId: mainnet.id, decimals: 18 },
  { symbol: "RSR", name: "Reserve Rights", address: getAddress("0x320623b8E4fF03373931769A31Fc52A4E78B5d70"), chainId: mainnet.id, decimals: 18 },
  { symbol: "sato", name: "sato", address: getAddress("0x829f4B62EEBE12Af653b4dD4fFc480966F7d7f09"), chainId: mainnet.id, decimals: 18 },
  { symbol: "SNT", name: "Status Network Token", address: getAddress("0x744d70FDBE2Ba4CF95131626614a1763DF805B9E"), chainId: mainnet.id, decimals: 18 },
  { symbol: "ZIPCAT", name: "ZIP CAT", address: getAddress("0x4C5FC2EFd7F9fBA2c6a9227aBd9d1C3eeFd6bDD7"), chainId: mainnet.id, decimals: 18 },
  { symbol: "LBTC", name: "Lombard Staked Bitcoin", address: getAddress("0x8236a87084f8B84306f72007F36F2618A5634494"), chainId: mainnet.id, decimals: 8 },

  // ─── Additional verified Arbitrum assets ─────────────────
  { symbol: "LINK", name: "Chainlink", address: getAddress("0xf97f4df75117a78c1A5a0DBb814Af92458539FB4"), chainId: arbitrum.id, decimals: 18 },
  { symbol: "AAVE", name: "Aave", address: getAddress("0xba5DdD1f9d7F570dc94a51479a000E3BCE967196"), chainId: arbitrum.id, decimals: 18 },
  { symbol: "UNI", name: "Uniswap", address: getAddress("0xFa7F8980b0f1E64A2062791cc3b0871572F1F7f0"), chainId: arbitrum.id, decimals: 18 },
  { symbol: "cbBTC", name: "Coinbase Wrapped BTC", address: getAddress("0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"), chainId: arbitrum.id, decimals: 8 },
  { symbol: "GHO", name: "GHO", address: getAddress("0x7dfF72693F6A4149B17e7C6314655F6A9f7c8B33"), chainId: arbitrum.id, decimals: 18 },
  { symbol: "USDS", name: "USDS", address: getAddress("0x6491c05A82219b8D1479057361ff1654749b876b"), chainId: arbitrum.id, decimals: 18 },
  { symbol: "wstETH", name: "Wrapped stETH", address: getAddress("0x5979D7b546E38E414F7E9822514be443A4800529"), chainId: arbitrum.id, decimals: 18 },
  { symbol: "rETH", name: "Rocket Pool ETH", address: getAddress("0xEC70DcB4A1EFA46b8F2D97C310C9c4790ba5ffA8"), chainId: arbitrum.id, decimals: 18 },

  // ─── Additional verified Optimism assets ─────────────────
  { symbol: "LINK", name: "Chainlink", address: getAddress("0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6"), chainId: optimism.id, decimals: 18 },
  { symbol: "AAVE", name: "Aave", address: getAddress("0x76FB31fb4af56892A25e32cFC43De717950c9278"), chainId: optimism.id, decimals: 18 },
  { symbol: "UNI", name: "Uniswap", address: getAddress("0x6fd9d7AD17242c41f7131d257212c54A0e816691"), chainId: optimism.id, decimals: 18 },
  { symbol: "wstETH", name: "Wrapped stETH", address: getAddress("0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb"), chainId: optimism.id, decimals: 18 },
  { symbol: "rETH", name: "Rocket Pool ETH", address: getAddress("0x9Bcef72be871e61ED4fBbC7630889beE758eb81D"), chainId: optimism.id, decimals: 18 },

  // ─── Additional verified Polygon assets ──────────────────
  { symbol: "UNI", name: "Uniswap", address: getAddress("0xb33EaAd8d922B1083446DC23f610c2567fB5180f"), chainId: polygon.id, decimals: 18 },
  { symbol: "CRV", name: "Curve DAO", address: getAddress("0x172370d5Cd63279eFa6d502DAB29171933a610AF"), chainId: polygon.id, decimals: 18 },
  { symbol: "COMP", name: "Compound", address: getAddress("0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c"), chainId: polygon.id, decimals: 18 },
  { symbol: "ENS", name: "Ethereum Name Service", address: getAddress("0xbD7A5Cf51d22930B8B3Df6d834F9BCEf90EE7c4f"), chainId: polygon.id, decimals: 18 },
  { symbol: "GRT", name: "The Graph", address: getAddress("0x5fe2B58c013d7601147DcdD68C143A77499f5531"), chainId: polygon.id, decimals: 18 },
  { symbol: "QUICK OLD", name: "QuickSwap Legacy", address: getAddress("0x831753DD7087CaC61aB5644b308642cc1c33Dc13"), chainId: polygon.id, decimals: 18 },

  // ─── Additional verified Avalanche assets ────────────────
  { symbol: "WAVAX", name: "Wrapped AVAX", address: getAddress("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"), chainId: avalanche.id, decimals: 18 },
  { symbol: "BTC.b", name: "Bitcoin Avalanche Bridged", address: getAddress("0x152b9d0FdC40C096757F570A51E494bD4B943E50"), chainId: avalanche.id, decimals: 8 },
  { symbol: "LINK", name: "Chainlink", address: getAddress("0x5947BB275c521040051D82396192181b413227A3"), chainId: avalanche.id, decimals: 18 },
  { symbol: "AAVE", name: "Aave", address: getAddress("0x63a72806098Bd3D9520cC43356dD78afe5D386D9"), chainId: avalanche.id, decimals: 18 },
  { symbol: "EURC", name: "EURC", address: getAddress("0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD"), chainId: avalanche.id, decimals: 6 },
  { symbol: "GMX", name: "GMX", address: getAddress("0x62edc0692BD897D2295872a9FFCac5425011c661"), chainId: avalanche.id, decimals: 18 },
  { symbol: "XAVA", name: "Avalaunch", address: getAddress("0xd1c3f94DE7e5B45fa4edbBA472491a9f4B166fc4"), chainId: avalanche.id, decimals: 18 },

  // ─── Additional verified BNB Chain assets ────────────────
  { symbol: "BTCB", name: "Binance Bitcoin", address: getAddress("0x7130d2A12B9bCBfae4f2634d864A1Ee1CE3Ead9c"), chainId: bsc.id, decimals: 18 },
  { symbol: "ETH", name: "Binance-Peg Ethereum", address: getAddress("0x2170Ed0880ac9A755fd29B2688956BD959F933F8"), chainId: bsc.id, decimals: 18 },
  { symbol: "UNI", name: "Uniswap", address: getAddress("0xBf5140A22578168FD562DCcF235E5D43A02ce9B1"), chainId: bsc.id, decimals: 18 },
  { symbol: "LISTA", name: "Lista DAO", address: getAddress("0xFceB31A79F71AC9CBDCF853519c1b12D379EdC46"), chainId: bsc.id, decimals: 18 },
  { symbol: "THE", name: "Thena", address: getAddress("0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11"), chainId: bsc.id, decimals: 18 },
  { symbol: "ALPACA", name: "Alpaca Finance", address: getAddress("0x8F0528CE5EF7B51152A59745beFDD91D97091d2F"), chainId: bsc.id, decimals: 18 },

  // ─── Additional verified Unichain assets ─────────────────
  { symbol: "USDT0", name: "USDT0", address: getAddress("0x9151434b16b9763660705744891fA906F660EcC5"), chainId: unichain.id, decimals: 6 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", address: getAddress("0x0555E30da8f98308EdB960Aa94C0Db47230d2B9c"), chainId: unichain.id, decimals: 8 },
  { symbol: "wstETH", name: "Wrapped stETH", address: getAddress("0xC02fE7317D4eb8753a02c35fe019786854A92001"), chainId: unichain.id, decimals: 18 },

  // ─── Binance-listed, on-chain verified assets ───────────
  { symbol: "USD1", name: "World Liberty Financial USD", address: getAddress("0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/54977/large/USD1_1000x1000_transparent.png" },
  { symbol: "RLUSD", name: "RLUSD", address: getAddress("0x8292bb45bf1ee4d140127049757c2e0ff06317ed"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/39651/large/RLUSD_200x200_(1).png" },
  { symbol: "XAUt", name: "Tether Gold", address: getAddress("0x68749665ff8d2d112fa859aa293f07a622782f38"), chainId: mainnet.id, decimals: 6, logo: "https://coin-images.coingecko.com/coins/images/10481/large/Tether_Gold.png" },
  { symbol: "PAXG", name: "PAX Gold", address: getAddress("0x45804880de22913dafe09f4980848ece6ecbaf78"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/9519/thumb/paxg.PNG" },
  { symbol: "FET", name: "Fetch.ai", address: getAddress("0xaea46a60368a7bd060eec7df8cba43b7ef41ad85"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5681/thumb/Fetch.jpg" },
  { symbol: "INJ", name: "Injective", address: getAddress("0xe28b3b32b6c345a34ff64674606124dd5aceca30"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/12882/thumb/Secondary_Symbol.png" },
  { symbol: "USD1", name: "World Liberty Financial USD", address: getAddress("0x7550de0a4b9fb8caba8c32e72ee356afdd217a33"), chainId: arbitrum.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/54977/large/USD1_1000x1000_transparent.png" },
  { symbol: "SOL", name: "SOL Wormhole", address: getAddress("0xb74da9fe2f96b9e0a5f4a3cf0b92dd2bec617124"), chainId: arbitrum.id, decimals: 9, logo: "https://assets.coingecko.com/coins/images/22876/thumb/SOL_wh_small.png" },
  { symbol: "ONDO", name: "Ondo Finance", address: getAddress("0xa2d52a05b8bead5d824df54dd1aa63188b37a5e7"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/26580/standard/ONDO.png" },
  { symbol: "PEPE", name: "Pepe", address: getAddress("0x35e6a59f786d9266c7961ea28c7b768b33959cbb"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg" },
  { symbol: "ENA", name: "Ethena", address: getAddress("0xdf8f0c63d9335a0abd89f9f752d293a98ea977d8"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/36530/standard/ethena.png" },
  { symbol: "XAUt", name: "Tether Gold", address: getAddress("0x9b86f3c7d145979ec6b2f42ed7f92d06cfc6c9d3"), chainId: arbitrum.id, decimals: 6, logo: "https://coin-images.coingecko.com/coins/images/10481/large/Tether_Gold.png" },
  { symbol: "SOL", name: "SOL Wormhole", address: getAddress("0xba1cf949c382a32a09a17b2adf3587fc7fa664f1"), chainId: optimism.id, decimals: 9, logo: "https://assets.coingecko.com/coins/images/22876/thumb/SOL_wh_small.png" },
  { symbol: "PEPE", name: "Pepe", address: getAddress("0xc1c167cc44f7923cd0062c4370df962f9ddb16f5"), chainId: optimism.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg" },
  { symbol: "LDO", name: "Lido DAO", address: getAddress("0xfdb794692724153d1488ccdbe0c56c252596735f"), chainId: optimism.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13573/thumb/Lido_DAO.png" },
  { symbol: "PENDLE", name: "Pendle", address: getAddress("0xbc7b1ff1c6989f006a1185318ed4e7b5796e66e1"), chainId: optimism.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png" },
  { symbol: "WBTC", name: "Wrapped BTC", address: getAddress("0x68f180fcce6836688e9084f035309e29bf0a2095"), chainId: optimism.id, decimals: 8, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
  { symbol: "CRV", name: "Curve DAO Token", address: getAddress("0x0994206dfe8de6ec6920ff4d779b0d950605fb53"), chainId: optimism.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png" },
  { symbol: "AAVE", name: "Aave", address: getAddress("0xfb6115445bff7b52feb98650c87f44907e58f802"), chainId: bsc.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png" },
  { symbol: "LINK", name: "Chainlink", address: getAddress("0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd"), chainId: bsc.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png" },
  { symbol: "SOL", name: "SOL Wormhole", address: getAddress("0xfa54ff1a158b5189ebba6ae130ced6bbd3aea76e"), chainId: bsc.id, decimals: 9, logo: "https://assets.coingecko.com/coins/images/22876/thumb/SOL_wh_small.png" },
  { symbol: "INJ", name: "Injective", address: getAddress("0xa2b726b1145a4773f68593cf171187d8ebe4d495"), chainId: bsc.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/12882/thumb/Secondary_Symbol.png" },
  { symbol: "FET", name: "Fetch.ai", address: getAddress("0x031b41e504677879370e9dbcf937283a8691fa7f"), chainId: bsc.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5681/thumb/Fetch.jpg" },
  { symbol: "ASTER", name: "Aster", address: getAddress("0x000ae314e2a2172a039b26378814c252734f556a"), chainId: bsc.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/69040/large/_ASTER.png" },
  { symbol: "SOL", name: "SOL Wormhole", address: getAddress("0xfe6b19286885a4f7f55adad09c3cd1f906d2478f"), chainId: avalanche.id, decimals: 9, logo: "https://assets.coingecko.com/coins/images/22876/thumb/SOL_wh_small.png" },
  { symbol: "uTAO", name: "Bittensor", address: getAddress("0xfdca15bd55f350a36e63c47661914d80411d2c22"), chainId: avalanche.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/28452/large/ARUsPeNQ_400x400.jpeg" },
  { symbol: "SYN", name: "Synapse", address: getAddress("0x1f1e7c893855525b303f99bdf5c3c05be09ca251"), chainId: avalanche.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/18024/thumb/syn.png" },
  { symbol: "PENDLE", name: "Pendle", address: getAddress("0xfb98b335551a418cd0737375a2ea0ded62ea213b"), chainId: avalanche.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png" },
  { symbol: "GUN", name: "GUNZ", address: getAddress("0x26debd39d5ed069770406fca10a0e4f8d2c743eb"), chainId: avalanche.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/55027/standard/gunz.jpg" },
  { symbol: "COMP.e", name: "Compound", address: getAddress("0xc3048e19e76cb9a3aa9d77d8c03c29fc906e2437"), chainId: avalanche.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png" },
  { symbol: "BAND", name: "Band Protocol", address: getAddress("0xa8b1e0764f85f53dfe21760e8afe5446d82606ac"), chainId: polygon.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/9545/thumb/band-protocol.png" },
  { symbol: "MANA", name: "Decentraland", address: getAddress("0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4"), chainId: polygon.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/878/thumb/decentraland-mana.png" },
  { symbol: "STORJ", name: "Storj Token", address: getAddress("0xd72357daca2cf11a5f155b9ff7880e595a3f5792"), chainId: polygon.id, decimals: 8, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC/logo.png" },
  { symbol: "ZRX", name: "0x Protocol Token", address: getAddress("0x5559edb74751a0ede9dea4dc23aee72cca6be3d5"), chainId: polygon.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xE41d2489571d322189246DaFA5ebDe1F4699F498/logo.png" },
  { symbol: "SNX", name: "Synthetix Network Token", address: getAddress("0x50b728d8d964fd00c2d0aad81718b71311fef68a"), chainId: polygon.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png" },
  { symbol: "XRP", name: "XRP", address: getAddress("0x2615a94df961278dcbc41fb0a54fec5f10a693ae"), chainId: unichain.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ripple/info/logo.png" },
  { symbol: "AAVE", name: "Aave", address: getAddress("0x02a24c380da560e4032dc6671d8164cfbeeaae1e"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png" },
  { symbol: "DOGE", name: "Dogecoin", address: getAddress("0x12e96c2bfea6e835cf8dd38a5834fa61cf723736"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png" },
  { symbol: "ONDO", name: "Ondo Finance", address: getAddress("0xad0bae21db0b471dffc6f8f9eeacfe9a85321557"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/26580/standard/ONDO.png" },
  { symbol: "LINK", name: "Chainlink", address: getAddress("0x5a53b6d19d8edcb7923f0d840eebb3f09bbeefb7"), chainId: unichain.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png" },
  { symbol: "EUL", name: "Euler", address: getAddress("0x6319f47719b6713b1624c1b3a8e2dbf15b5d03fe"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/26149/thumb/YCvKDfl8_400x400.jpeg" },

  // ─── Additional verified trending assets ────────────────
  { symbol: "HYPE", name: "Hyperliquid", address: getAddress("0x15d0e0c55a3e7ee67152ad7e89acf164253ff68d"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/50882/large/hyperliquid.jpg" },
  { symbol: "ZEC", name: "Zcash", address: getAddress("0x83f31af747189c2fa9e5deb253200c505eff6ed2"), chainId: unichain.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zcash/info/logo.png" },
  { symbol: "QNT", name: "Quant", address: getAddress("0x4a220e6096b25eadb88358cb44068a3248254675"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/3370/thumb/5ZOu7brX_400x400.jpg" },
  { symbol: "BICO", name: "Biconomy", address: getAddress("0xf17e65822b568b3903685a7c9f496cf7656cc6c2"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/21061/thumb/biconomy_logo.jpg" },
  { symbol: "HOME", name: "Defi App", address: getAddress("0x4bfaa776991e85e5f8b1255461cbbd216cfc714f"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/54873/large/defi-app.png" },
  { symbol: "GRVT", name: "GRVT Token", address: getAddress("0xad29f2723fcdbcf665f210f25e06f97477e417cf"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/102172513/large/grvt_400x400.jpg" },
  { symbol: "ZAMA", name: "Zama", address: getAddress("0xa12cc123ba206d4031d1c7f6223d1c2ec249f4f3"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/70921/large/zama.png" },
  { symbol: "ERA", name: "Caldera", address: getAddress("0xe2ad0bf751834f2fbdc62a41014f84d67ca1de2a"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/54475/large/Token_Logo.png" },

  // ─── Additional verified stablecoins ────────────────────
  // Ethereum
  { symbol: "EURC", name: "Euro Coin", address: getAddress("0x1abaea1f7c830bd89acc67ec4af516284b1bc33c"), chainId: mainnet.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420" },
  { symbol: "MIM", name: "Magic Internet Money", address: getAddress("0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/16786/thumb/mimlogopng.png?1624979612" },
  { symbol: "sUSD", name: "Synth sUSD", address: getAddress("0x57ab1ec28d129707052df4df418d58a2d46d5f51"), chainId: mainnet.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5013/thumb/sUSD.png?1616150765" },
  { symbol: "USDG", name: "Global Dollar", address: getAddress("0xe343167631d89b6ffc58b88d6b7fb0228795491d"), chainId: mainnet.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/51281/large/GDN_USDG_Token_200x200.png" },
  // Optimism
  { symbol: "DAI", name: "Dai Stablecoin", address: getAddress("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"), chainId: optimism.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
  { symbol: "FRAX", name: "Frax", address: getAddress("0x2e3d870790dc77a83dd1d18184acc7439a53f475"), chainId: optimism.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13422/thumb/frax_logo.png?1608476506" },
  { symbol: "sUSD", name: "Synth sUSD", address: getAddress("0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"), chainId: optimism.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5013/thumb/sUSD.png?1616150765" },
  { symbol: "USD₮0", name: "USDT0", address: getAddress("0x01bff41798a0bcf287b996046ca68b395dbc1071"), chainId: optimism.id, decimals: 6, logo: "https://coin-images.coingecko.com/coins/images/53705/large/usdt0.jpg?1737086183" },
  // BNB Chain
  { symbol: "DAI", name: "Dai Stablecoin", address: getAddress("0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"), chainId: bsc.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
  { symbol: "FRAX", name: "Frax", address: getAddress("0x90c97f71e18723b0cf0dfa30ee176ab653e89f40"), chainId: bsc.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13422/thumb/frax_logo.png?1608476506" },
  { symbol: "MIM", name: "Magic Internet Money", address: getAddress("0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba"), chainId: bsc.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/16786/thumb/mimlogopng.png?1624979612" },
  // Unichain
  { symbol: "DAI", name: "Dai Stablecoin", address: getAddress("0x20cab320a855b39f724131c69424240519573f81"), chainId: unichain.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
  { symbol: "EURC", name: "Euro Coin", address: getAddress("0x72f34bc403a005a9be390762eaa46ed42813b0a8"), chainId: unichain.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420" },
  { symbol: "FRAX", name: "Frax", address: getAddress("0x8c7879bf25d678d9949f305857bd4437d74132b9"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13422/thumb/frax_logo.png?1608476506" },
  { symbol: "LUSD", name: "Liquity USD", address: getAddress("0xf81b7485b4cb59645f74528d702c7f8cd72577fb"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/14666/thumb/Group_3.png?1617631327" },
  { symbol: "MIM", name: "Magic Internet Money", address: getAddress("0x397c1f55feff63c8947624b0d457a2ca3e3602ab"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/16786/thumb/mimlogopng.png?1624979612" },
  { symbol: "PYUSD", name: "PayPal USD", address: getAddress("0x0d2f98904d88909072ea6e61105cbbf78e6207c5"), chainId: unichain.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/31212/large/PYUSD_Logo_%282%29.png?1691458314" },
  { symbol: "sUSD", name: "Synth sUSD", address: getAddress("0x7251d204c2e867b31096d5c7091298239b3a6a0f"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5013/thumb/sUSD.png?1616150765" },
  { symbol: "USDG", name: "Global Dollar", address: getAddress("0x2a22868610610199d43fe93a16661473a9f86f1e"), chainId: unichain.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/51281/large/GDN_USDG_Token_200x200.png" },
  { symbol: "USDS", name: "USDS Stablecoin", address: getAddress("0x116ee4d63847fb295dd919ae57b768ea3b2f7bb4"), chainId: unichain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/39926/large/usds.webp?1726666683" },
  { symbol: "USDT", name: "Tether USD", address: getAddress("0x588ce4f028d8e7b53b687865d6a67b3a54c75518"), chainId: unichain.id, decimals: 6, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
  // Polygon
  { symbol: "sUSD", name: "Synth sUSD", address: getAddress("0xf81b4bec6ca8f9fe7be01ca734f55b2b6e03a7a0"), chainId: polygon.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5013/thumb/sUSD.png?1616150765" },
  // Arbitrum
  { symbol: "DAI", name: "Dai Stablecoin", address: getAddress("0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"), chainId: arbitrum.id, decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
  { symbol: "EUROC", name: "Euro Coin (Legacy)", address: getAddress("0x863708032b5c328e11abcbc0df9d79c71fc52a48"), chainId: arbitrum.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420" },
  { symbol: "FRAX", name: "Frax", address: getAddress("0x7468a5d8e02245b00e8c0217fce021c70bc51305"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13422/thumb/frax_logo.png?1608476506" },
  { symbol: "LUSD", name: "Liquity USD", address: getAddress("0x93b346b6bc2548da6a1e7d98e9a421b42541425b"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/14666/thumb/Group_3.png?1617631327" },
  { symbol: "MIM", name: "Magic Internet Money", address: getAddress("0xb20a02dffb172c474bc4bda3fd6f4ee70c04daf2"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/16786/thumb/mimlogopng.png?1624979612" },
  { symbol: "PYUSD", name: "PayPal USD", address: getAddress("0x327006c8712fe0abdbbd55b7999db39b0967342e"), chainId: arbitrum.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/31212/large/PYUSD_Logo_%282%29.png?1691458314" },
  { symbol: "sUSD", name: "Synth sUSD", address: getAddress("0xa970af1a584579b618be4d69ad6f73459d112f95"), chainId: arbitrum.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/5013/thumb/sUSD.png?1616150765" },
  // Avalanche
  { symbol: "FRAX", name: "Frax", address: getAddress("0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64"), chainId: avalanche.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/13422/thumb/frax_logo.png?1608476506" },
  { symbol: "MIM", name: "Magic Internet Money", address: getAddress("0x130966628846bfd36ff31a822705796e8cb8c18d"), chainId: avalanche.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/16786/thumb/mimlogopng.png?1624979612" },
  { symbol: "USDt", name: "Tether USD", address: getAddress("0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"), chainId: avalanche.id, decimals: 6, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },

  // ─── Verified meme assets with active on-chain liquidity ─
  // Ethereum
  { symbol: "TURBO", name: "Turbo", address: getAddress("0xa35923162c49cf95e6bf26623385eb431ad920d3"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/30117/large/TurboMark-QL_200.png" },
  { symbol: "APU", name: "Apu Apustaja", address: getAddress("0x594daad7d77592a2b97b725a7ad59d7e188b5bfa"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/35986/large/200x200.png" },
  { symbol: "WOJAK", name: "Wojak", address: getAddress("0x5026f006b85729a8b14553fae6af249ad16c9aab"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/29856/large/wojak.png" },
  { symbol: "LADYS", name: "Milady Meme Coin", address: getAddress("0x12970e6868f88f6557b76120662c1b3e50a646bf"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/30194/large/LADYS_Clean.png" },
  { symbol: "MOG", name: "Mog Coin", address: getAddress("0xaaee1a9723aadb7afa2810263653a34ba2c21c7a"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/31059/large/MOG_LOGO_200x200.png" },
  { symbol: "MANYU", name: "Manyu", address: getAddress("0x95af4af910c28e8ece4512bfe46f1f33687424ce"), chainId: mainnet.id, decimals: 9 },
  { symbol: "NEIRO", name: "Neiro", address: getAddress("0x812ba41e071c7b7fa4ebcfb62df5f45f6fa853ee"), chainId: mainnet.id, decimals: 9, logo: "https://coin-images.coingecko.com/coins/images/39488/large/neiro.jpg" },
  { symbol: "MEME", name: "Memecoin", address: getAddress("0xb131f4a55907b10d1f0a50d8ab8fa09ec342cd74"), chainId: mainnet.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/32528/large/memecoin_%282%29.png" },
  { symbol: "SPX", name: "SPX6900", address: getAddress("0xe0f63a424a4439cbe457d80e4f4b51ad25b2c56c"), chainId: mainnet.id, decimals: 8, logo: "https://coin-images.coingecko.com/coins/images/31401/large/centeredcoin_%281%29.png" },
  // Base
  { symbol: "BASECAT", name: "Basecat", address: getAddress("0xb2000000000000000000004c27f6523082f41d01"), chainId: base.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/c1GM37sU6jS_D7Cq?width=800&height=800&quality=95&format=auto" },
  { symbol: "TOBY", name: "Toby ToadGod", address: getAddress("0xb8d98a102b0079b69ffbc760c8d857a31653e56e"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/36615/large/toby1.png" },
  { symbol: "DRB", name: "DebtReliefBot", address: getAddress("0x3ec2156d4c0a9cbdab4a016633b7bcf6a8d68ea2"), chainId: base.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/933f90e3132e6bf22153efc75938b732f0f1dc3a2fc2d9dbff614fe60ddf95b6" },
  { symbol: "MIGGLES", name: "Mr. Miggles", address: getAddress("0xb1a03eda10342529bbf8eb700a06c60441fef25d"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/39251/large/New_LOGO.png" },
  { symbol: "RUSSELL", name: "RUSSELL", address: getAddress("0x0c5142bc58f9a61ab8c3d2085dd2f4e550c5ce0b"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/50690/large/russelllogo.png" },
  { symbol: "MOEW", name: "MOEW", address: getAddress("0x15ac90165f8b45a80534228bdcb124a011f62fee"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/36737/large/moewnewlogo.jpg" },
  { symbol: "DINO", name: "DINO", address: getAddress("0x85e90a5430af45776548adb82ee4cd9e33b08077"), chainId: base.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/53533/large/coin_pfp.png" },
  // BNB Smart Chain
  { symbol: "BICAT", name: "Bicat", address: getAddress("0xDBc6333a7D8bCd95f96641EDA4D095E69F207777"), chainId: bsc.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/ndp7tE6pqNbkW3IP?width=800&height=800&quality=95&format=auto" },
  { symbol: "CHEEMS", name: "Cheems", address: getAddress("0x0df0587216a4a1bb7d5082fdc491d93d2dd4b413"), chainId: bsc.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/30376/large/Hg4_Lhbg_400x400.jpg" },
  { symbol: "CAW", name: "crow with knife", address: getAddress("0xdfbea88c4842d30c26669602888d746d30f9d60d"), chainId: bsc.id, decimals: 18 },
  { symbol: "WHY", name: "WHY", address: getAddress("0x9ec02756a559700d8d9e79ece56809f7bcc5dc27"), chainId: bsc.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/36812/large/output-onlinepngtools.png" },
  { symbol: "CAT", name: "Simon's Cat", address: getAddress("0x6894cde390a3f51155ea41ed24a33a4827d3063d"), chainId: bsc.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/85f6929f07daa1e1ba77547d4bde843f34e1375b206aa47318005baaf6944478" },
  // Polygon
  { symbol: "POLYDOGE", name: "PolyDoge", address: getAddress("0x8a953cfe442c5e8855cc6c61b1293fa648bae472"), chainId: polygon.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/15146/large/p1kSco1h_400x400.jpg" },
  // Arbitrum
  { symbol: "AIDOGE", name: "ArbDoge AI", address: getAddress("0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b"), chainId: arbitrum.id, decimals: 6, logo: "https://coin-images.coingecko.com/coins/images/29852/large/photo_2023-04-18_14-25-28.jpg" },
  { symbol: "BOOP", name: "BOOP", address: getAddress("0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3"), chainId: arbitrum.id, decimals: 18, logo: "https://coin-images.coingecko.com/coins/images/55464/large/BOOP_coin_UI_4x.png" },
  // Avalanche
  { symbol: "NOCHILL", name: "AVAX Has No Chill", address: getAddress("0xacfb898cff266e53278cc0124fc2c7c94c8cb9a5"), chainId: avalanche.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/c6634e92389a30c1099d23d6d692ef40151844756f456c902b185f8227fb997b" },
  { symbol: "HUSKY", name: "Husky", address: getAddress("0x65378b697853568da9ff8eab60c13e1ee9f4a654"), chainId: avalanche.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/ba3f6630471837c764f4dbe384fcc38e87d4eff0c025f498c0df5b1e3d1980f5" },
  { symbol: "KIMBO", name: "Kimbo", address: getAddress("0x184ff13b3ebcb25be44e860163a5d8391dd568c1"), chainId: avalanche.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/e3a9f7af729ca381ef7218cf1fb480daf5da28a1e31f344570d596138192267d" },
  // Robinhood Chain
  { symbol: "CASHDOG", name: "Cash Dog", address: getAddress("0x9e93ea35be23ab0e1e20ed6b62d3b1cbd5234a83"), chainId: robinhood.id, decimals: 18, logo: "https://cdn.dexscreener.com/token-images/og/robinhood/0x9e93ea35be23ab0e1e20ed6b62d3b1cbd5234a83" },
  { symbol: "TENDIES", name: "TENDIES", address: getAddress("0x45242320dbb855eea8fd36804c6487e10e97fcf9"), chainId: robinhood.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/j8K5uOi-9TVXuWFJ" },
  { symbol: "BYCOCKET", name: "Bycocket", address: getAddress("0xc79d46d716b33b463b3a6574d6ee26009abf4e9a"), chainId: robinhood.id, decimals: 18, logo: "https://cdn.dexscreener.com/cms/images/9B-Y8-fr8vI-RPNO" },
  { symbol: "APOLUNE", name: "Apolune Fun", address: getAddress("0x1478D04EF6CA3FD249ec67936aFd9fdd87710565"), chainId: robinhood.id, decimals: 18 },
  { symbol: "BARBELL", name: "Barbell", address: getAddress("0x0A713a88e05787D455954DaBDba3B69a92518505"), chainId: robinhood.id, decimals: 18 },
  { symbol: "BROW", name: "eyebrow", address: getAddress("0x2142d4816E259fd7C119f61c772e39AE0CdAAFde"), chainId: robinhood.id, decimals: 18 },
  { symbol: "Doge-1", name: "DOGE-1", address: getAddress("0xcBf02F42B8b9c12AbEFebd64fD46cC2C17eC727F"), chainId: robinhood.id, decimals: 18 },
  { symbol: "PMF", name: "Product Meme Fit by Virtuals", address: getAddress("0x9d05b9CEf884FEd0273377FC635C6b248f0A1b45"), chainId: robinhood.id, decimals: 18 },
  { symbol: "ROB", name: "Robacha", address: getAddress("0x2ceeb8aCB7bc427B3de905E5Ce77a5D4c961F3b0"), chainId: robinhood.id, decimals: 18 },
  { symbol: "SNOW", name: "SnowOn", address: getAddress("0xb851CeBcBcf1Dc5F07D9F0a8276caE8D953B3713"), chainId: robinhood.id, decimals: 18 },
  { symbol: "TACO", name: "TrumpAlwaysChickensOut", address: getAddress("0x9e5e02F5C9ea48931d4e8f488089103e93F925fF"), chainId: robinhood.id, decimals: 18 },
  { symbol: "STONKBROKER", name: "StonkBroker", address: getAddress("0xe934e36a439c94017b64a3fece66af12099abf50"), chainId: robinhood.id, decimals: 18 },
  { symbol: "WIF", name: "RobinWifHat", address: getAddress("0xe49a1c3033ecc6b804bc423021d3f71f1a3e0f9b"), chainId: robinhood.id, decimals: 18 },

  // ─── Newly deployed EVM networks ─────────────────────────
  { symbol: "ETH", name: "Ether", chainId: linea.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0x176211869cA2b568f2A7D4EE941E073a821EE1ff"), chainId: linea.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "ETH", name: "Ether", chainId: scroll.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4"), chainId: scroll.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "MNT", name: "Mantle", chainId: mantle.id, decimals: 18, logo: "https://www.mantle.xyz/favicon.ico" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9"), chainId: mantle.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "ETH", name: "Ether", chainId: worldchain.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png" },
  { symbol: "USDC.e", name: "Bridged USD Coin", address: getAddress("0x79A02482A880bCE3F13e09Da970dC34db4CD24d1"), chainId: worldchain.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "S", name: "Sonic", chainId: sonic.id, decimals: 18, logo: "https://www.soniclabs.com/favicon.ico" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0x29219dd400f2Bf60E5a23d13Be72B486D4038894"), chainId: sonic.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "BERA", name: "Berachain", chainId: berachain.id, decimals: 18, logo: "https://www.berachain.com/favicon.ico" },
  { symbol: "USDC.e", name: "Bridged USD Coin", address: getAddress("0x549943e04f40284185054145c6E4e9568C1D3241"), chainId: berachain.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "ETH", name: "Ether", chainId: ink.id, decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0x2D270e6886d130D724215A266106e6832161EAEd"), chainId: ink.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "PURPLE", name: "Purple", address: getAddress("0xD642B49d10cc6e1BC1c6945725667c35e0875f22"), chainId: ink.id, decimals: 18 },
  { symbol: "MON", name: "Monad", chainId: monad.id, decimals: 18, logo: "https://www.monad.xyz/favicon.ico" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0x754704Bc059F8C67012fEd69BC8A327a5aafb603"), chainId: monad.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "NADS", name: "NADS", address: getAddress("0x39B9E06f226FF6D7500c870B82333AACbD2F7777"), chainId: monad.id, decimals: 18 },
  { symbol: "HYPE", name: "Hyperliquid", chainId: hyperEvm.id, decimals: 18, logo: "https://hyperfoundation.org/favicon.ico" },
  { symbol: "USDC", name: "USD Coin", address: getAddress("0xb88339CB7199b77E23DB6E890353E22632Ba630f"), chainId: hyperEvm.id, decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { symbol: "1HYPE", name: "1 HYPE and a Dream", address: getAddress("0xd621102f3e2cd93C77264e665926F4f17A3d80fe"), chainId: hyperEvm.id, decimals: 18 },
  { symbol: "XPL", name: "Plasma", chainId: plasma.id, decimals: 18, logo: "https://www.plasma.to/favicon.ico" },
  { symbol: "USDT0", name: "Tether USD0", address: getAddress("0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb"), chainId: plasma.id, decimals: 6, logo: "https://coin-images.coingecko.com/coins/images/53705/large/usdt0.jpg" },
];

export function tokensForChain(chainId: number) {
  return dedupeTokens(TOKENS.filter((t) => t.chainId === chainId)).sort((a, b) =>
    a.symbol.localeCompare(b.symbol, undefined, { sensitivity: "base" })
    || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function dedupeTokens(tokens: Token[]) {
  const byId = new Map<string, Token>();
  for (const token of tokens) {
    const id = `${token.chainId}:${token.address?.toLowerCase() ?? "native"}`;
    if (!byId.has(id)) byId.set(id, token);
  }
  return [...byId.values()];
}

/**
 * Merge chain-specific registries by contract address. Earlier catalogs have
 * metadata priority, while later automatic providers can fill missing logos
 * and decimals. Symbols are never used to merge contract tokens because the
 * same symbol can legitimately belong to multiple addresses.
 */
export function mergeTokenCatalogs(chainId: number, ...catalogs: Token[][]) {
  const byId = new Map<string, Token>();
  for (const catalog of catalogs) {
    for (const token of catalog) {
      if (token.chainId !== chainId) continue;
      const id = token.address
        ? `address:${token.address.toLowerCase()}`
        : `native:${token.symbol.trim().toUpperCase()}`;
      const current = byId.get(id);
      if (!current) {
        byId.set(id, token);
        continue;
      }
      byId.set(id, {
        ...token,
        ...current,
        decimals: current.decimals ?? token.decimals,
        logo: current.logo ?? token.logo,
        imported: current.imported || token.imported || undefined,
        trending: current.trending || token.trending || undefined,
        providerListed: current.providerListed || token.providerListed || undefined,
      });
    }
  }
  return [...byId.values()].sort((a, b) =>
    a.symbol.localeCompare(b.symbol, undefined, { sensitivity: "base" })
    || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function defaultSellForChain(chainId: number) {
  const list = tokensForChain(chainId);
  if (chainId === mainnet.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === base.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === cronos.id) return list.find((t) => t.symbol === "CRO") ?? list[0]!;
  if (chainId === polygon.id) return list.find((t) => t.symbol === "POL") ?? list[0]!;
  if (chainId === bsc.id) return list.find((t) => t.symbol === "BNB") ?? list[0]!;
  if (chainId === arbitrum.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === optimism.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === avalanche.id) return list.find((t) => t.symbol === "AVAX") ?? list[0]!;
  if (chainId === robinhood.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === unichain.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  if (chainId === zora.id) return list.find((t) => t.symbol === "ETH") ?? list[0]!;
  return list.find((t) => t.symbol === "ETH") ?? list[0]!;
}

export function defaultBuyForChain(chainId: number) {
  const list = tokensForChain(chainId);
  if (chainId === mainnet.id) return list.find((t) => t.symbol === "BONE") ?? list[1] ?? list[0]!;
  if (chainId === base.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === cronos.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === polygon.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === bsc.id) return list.find((t) => t.symbol === "USDT") ?? list[1] ?? list[0]!;
  if (chainId === arbitrum.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === optimism.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === avalanche.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === robinhood.id) return list.find((t) => t.symbol === "USDG") ?? list[1] ?? list[0]!;
  if (chainId === unichain.id) return list.find((t) => t.symbol === "USDC") ?? list[1] ?? list[0]!;
  if (chainId === zora.id) return list.find((t) => t.symbol === "WETH") ?? list[1] ?? list[0]!;
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
  return [
    "USDC",
    "USDC.E",
    "USDT",
    "USDT0",
    "USD₮0",
    "USDG",
    "USD1",
    "DAI",
    "USDE",
    "SUSDE",
    "PYUSD",
    "GHO",
    "USDS",
    "FRAX",
    "LUSD",
    "MIM",
    "SUSD",
    "EURC",
    "EUROC",
    "FDUSD",
    "USDBC",
  ].includes(t.symbol.toUpperCase());
}
