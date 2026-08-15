"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TokenLogo } from "@/components/TokenLogo";
import { fallbackTokenLogo } from "@/components/TokenSelect";
import { CHAIN_OPTIONS } from "@/lib/chains";
import { TOKENS } from "@/lib/tokens";

type Token = {
  address?: `0x${string}`;
  chainId?: number;
  symbol: string;
  name: string;
  logo?: string;
};

const HOUSE_LOGO = "/logo.png";

const curatedTokenGroups: Array<{ title: string; eyebrow: string; tokens: Token[] }> = [
  {
    title: "Base Community",
    eyebrow: "Base",
    tokens: [
      { symbol: "QUEENJOSHI", name: "Queen Joshi", logo: HOUSE_LOGO },
      { symbol: "KINGJOSHI", name: "King Joshi", logo: HOUSE_LOGO },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png" },
      { symbol: "cbBTC", name: "Coinbase Wrapped BTC", logo: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp" },
      { symbol: "AERO", name: "Aerodrome Finance", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x940181a94A35A4569E4529A3CDfB74e38FD98631/logo.png" },
      { symbol: "BRETT", name: "Brett", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x532f27101965dd16442E59d40670FaF5eBB142E4/logo.png" },
      {
        symbol: "SHIB",
        name: "SchismaticShib",
        logo: "https://s2.coinmarketcap.com/static/img/coins/200x200/37553.png",
      },
      { symbol: "MOG", name: "Mog Coin", logo: "/tokens/mog.png" },
      { symbol: "TOSHI", name: "Toshi", logo: "/tokens/toshi.png" },
      { symbol: "VIRTUAL", name: "Virtuals Protocol", logo: "https://assets.coingecko.com/coins/images/34057/standard/LOGOMARK.png" },
      { symbol: "MORPHO", name: "Morpho", logo: "https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png" },
      { symbol: "DEGEN", name: "Degen", logo: "https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png" },
      { symbol: "mr_lightspeed", name: "Mr. Lightspeed Creator Coin", logo: "/tokens/mr-lightspeed.jpg" },
      { symbol: "SPX", name: "SPX6900", logo: "https://coin-images.coingecko.com/coins/images/31401/large/centeredcoin_%281%29.png" },
      { symbol: "SYRUP", name: "Maple Finance", logo: "https://coin-images.coingecko.com/coins/images/51232/large/_syrup_token_logo.png" },
      { symbol: "FLUID", name: "Fluid", logo: "https://coin-images.coingecko.com/coins/images/14688/large/Frame_1686566116_%281%29_%281%29.png" },
      { symbol: "COW", name: "CoW Protocol", logo: "https://coin-images.coingecko.com/coins/images/24384/large/CoW-token_logo.png" },
      { symbol: "EUL", name: "Euler", logo: "https://coin-images.coingecko.com/coins/images/26149/large/Coingecko_logo_%281%29.png" },
      { symbol: "ZRO", name: "LayerZero", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x6985884C4392D348587B19cb9eAAf157F13271cd/logo.png" },
      { symbol: "W", name: "Wormhole", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91/logo.png" },
      { symbol: "AXL", name: "Axelar", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x23ee2343b892b1bb63503a4fabc840e0e2c6810f/logo.png" },
      { symbol: "SUSHI", name: "Sushi", logo: "https://assets.coingecko.com/coins/images/12271/standard/512x512_Logo_no_chop.png" },
      { symbol: "NPC", name: "Non-Playable Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xb166e8b140d35d9d8226e40c09f757bac5a4d87d/logo.png" },
      { symbol: "TIBBIR", name: "Ribbita by Virtuals", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00/logo.png" },
    ],
  },
  {
    title: "Ethereum Tokens",
    eyebrow: "Ethereum",
    tokens: [
      { symbol: "SHIB", name: "Shiba Inu", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/logo.png" },
      { symbol: "BONE", name: "Bone ShibaSwap", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9813037ee2218799597d83D4a5B6F3b6778218d9/logo.png" },
      { symbol: "TREAT", name: "Treat146b", logo: "/tokens/treat146b.png" },
      { symbol: "OSCAR", name: "Oscar", logo: "/tokens/oscar.png" },
      { symbol: "BNB", name: "Binance Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB8c77482e45F1F44dE1745F52C74426C631bDD52/logo.png" },
      { symbol: "MAME", name: "Mame Inu", logo: "/tokens/mame-inu.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
      { symbol: "DAI", name: "Dai Stablecoin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
      { symbol: "LINK", name: "Chainlink", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png" },
      { symbol: "UNI", name: "Uniswap", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png" },
      { symbol: "AAVE", name: "Aave", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png" },
      { symbol: "PEPE", name: "Pepe", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6982508145454Ce325dDbE47a25d4ec3d2311933/logo.png" },
      { symbol: "FLOKI", name: "FLOKI", logo: "/tokens/floki.png" },
      { symbol: "ONDO", name: "Ondo", logo: "https://assets.coingecko.com/coins/images/26580/standard/ONDO.png" },
      { symbol: "ENA", name: "Ethena", logo: "https://assets.coingecko.com/coins/images/36530/standard/ethena.png" },
      { symbol: "USDe", name: "Ethena USDe", logo: "https://assets.coingecko.com/coins/images/33613/standard/usde.png" },
      { symbol: "PENDLE", name: "Pendle", logo: "https://assets.coingecko.com/coins/images/15069/standard/Pendle_Logo_Normal-03.png" },
      { symbol: "LDO", name: "Lido DAO", logo: "https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png" },
      { symbol: "EIGEN", name: "EigenLayer", logo: "https://assets.coingecko.com/coins/images/37441/standard/eigenlayer.png" },
      { symbol: "PYUSD", name: "PayPal USD", logo: "https://assets.coingecko.com/coins/images/31212/standard/PYUSD_Logo_%282%29.png" },
    ],
  },
  {
    title: "Bridgeable Assets",
    eyebrow: "All chains",
    tokens: [
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
    ],
  },
  {
    title: "Polygon",
    eyebrow: "Polygon",
    tokens: [
      { symbol: "POL", name: "Polygon Ecosystem Token", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x3c499c542cef5e3811e1192ce70d8cc03d5c3359/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png" },
      { symbol: "WBTC", name: "Wrapped BTC", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x1BFD62B7D66453f26932296AB7c5409E839A7656/logo.png" },
      { symbol: "AAVE", name: "Aave", logo: "https://assets.coingecko.com/coins/images/12645/standard/AAVE.png" },
      { symbol: "LINK", name: "Chainlink", logo: "https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png" },
      { symbol: "DAI", name: "Dai Stablecoin", logo: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png" },
    ],
  },
  {
    title: "BNB Chain",
    eyebrow: "BNB Chain",
    tokens: [
      { symbol: "BNB", name: "Binance Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x55d398326f99059fF775485246999027B3197955/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x8AC76a51cc950d9822D68b83FE1Ad97B32Cd580d/logo.png" },
      { symbol: "DOGE", name: "Binance-Peg Dogecoin", logo: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png" },
      { symbol: "FDUSD", name: "First Digital USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409/logo.png" },
      { symbol: "CAKE", name: "PancakeSwap Token", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x0E09FaBB73Bd3Ade0A17ECC321fD13a19E81cE82/logo.png" },
      { symbol: "BabyDoge", name: "Baby Doge Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xc748673057861a797275CD8A068AbB95A902e8de/logo.png" },
      { symbol: "GMEB", name: "GameStop (bStock)", logo: "https://coin-images.coingecko.com/coins/images/102175530/large/gamestop_bstock.png?1786614133" },
      { symbol: "COINon", name: "Coinbase (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/coinon_160x160.png" },
      { symbol: "MSTRon", name: "MicroStrategy (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/mstron_160x160.png" },
      { symbol: "TQQQon", name: "ProShares UltraPro QQQ (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/tqqqon_160x160.png" },
      { symbol: "AMZNon", name: "Amazon (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/amznon_160x160.png" },
      { symbol: "ORCLon", name: "Oracle (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/orclon_160x160.png" },
      { symbol: "AAPLon", name: "Apple (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/aaplon_160x160.png" },
      { symbol: "ACNon", name: "Accenture (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/acnon_160x160.png" },
      { symbol: "AMDon", name: "AMD (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/amdon_160x160.png" },
      { symbol: "ARMon", name: "Arm Holdings plc (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/armon_160x160.png" },
      { symbol: "ASMLon", name: "ASML Holding NV (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/asmlon_160x160.png" },
      { symbol: "BABAon", name: "Alibaba (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/babaon_160x160.png" },
      { symbol: "BAon", name: "Boeing (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/baon_160x160.png" },
      { symbol: "COSTon", name: "Costco (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/coston_160x160.png" },
      { symbol: "CRCLon", name: "Circle Internet Group (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/crclon_160x160.png" },
      { symbol: "DASHon", name: "DoorDash (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/dashon_160x160.png" },
      { symbol: "EFAon", name: "iShares MSCI EAFE ETF (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/efaon_160x160.png" },
      { symbol: "GOOGLon", name: "Alphabet Class A (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/googlon_160x160.png" },
      { symbol: "GSon", name: "Goldman Sachs (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/gson_160x160.png" },
      { symbol: "IAUon", name: "iShares Gold Trust (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/iauon_160x160.png" },
      { symbol: "IEFAon", name: "iShares Core MSCI EAFE ETF (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/iefaon_160x160.png" },
      { symbol: "ITOTon", name: "iShares Core S&P Total US Stock Market ETF (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/itoton_160x160.png" },
      { symbol: "LLYon", name: "Eli Lilly (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/llyon_160x160.png" },
      { symbol: "METAon", name: "Meta Platforms (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/metaon_160x160.png" },
      { symbol: "MUon", name: "Micron Technology (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/muon_160x160.png" },
      { symbol: "NVDAon", name: "NVIDIA (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/nvdaon_160x160.png" },
      { symbol: "NVOon", name: "Novo Nordisk (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/nvoon_160x160.png" },
      { symbol: "QQQon", name: "Invesco QQQ (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/qqqon_160x160.png" },
      { symbol: "SLVon", name: "iShares Silver Trust (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/slvon_160x160.png" },
      { symbol: "SPYon", name: "SPDR S&P 500 ETF (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/spyon_160x160.png" },
      { symbol: "TMon", name: "Toyota (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/tmon_160x160.png" },
      { symbol: "TSLAon", name: "Tesla (Ondo Tokenized)", logo: "https://cdn.ondo.finance/tokens/logos/tslaon_160x160.png" },
    ],
  },
  {
    title: "Arbitrum",
    eyebrow: "Arbitrum",
    tokens: [
      { symbol: "ARB", name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png" },
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xaf88d065e77c8cC2239327C5EDb3A432268e5831/logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://assets.coingecko.com/coins/images/325/standard/Tether.png" },
      { symbol: "WBTC", name: "Wrapped BTC", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
      { symbol: "GMX", name: "GMX", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a/logo.png" },
      { symbol: "MAGIC", name: "MAGIC", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x539bdE0d7Dbd336b79148AA742883198BBF60342/logo.png" },
      { symbol: "PENDLE", name: "Pendle", logo: "https://assets.coingecko.com/coins/images/15069/standard/Pendle_Logo_Normal-03.png" },
    ],
  },
  {
    title: "Optimism",
    eyebrow: "Optimism",
    tokens: [
      { symbol: "OP", name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x4200000000000000000000000000000000000042/logo.png" },
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x0b2C639c533813f4Aa9D7837CAe62653423a6504/logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://assets.coingecko.com/coins/images/325/standard/Tether.png" },
      { symbol: "SNX", name: "Synthetix Network", logo: "https://assets.coingecko.com/coins/images/3406/standard/SNX.png" },
      { symbol: "VELO", name: "Velodrome", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db/logo.png" },
      { symbol: "WLD", name: "World", logo: "https://assets.coingecko.com/coins/images/31069/standard/worldcoin.jpeg" },
      { symbol: "WCT", name: "WalletConnect Token", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0xef4461891dfb3ac8572ccf7c794664a8dd927945/logo.png" },
    ],
  },
  {
    title: "Avalanche",
    eyebrow: "Avalanche",
    tokens: [
      { symbol: "AVAX", name: "Avalanche", logo: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://assets.coingecko.com/coins/images/325/standard/Tether.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png" },
      { symbol: "WBTC", name: "Wrapped BTC", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
      { symbol: "JOE", name: "JoeToken", logo: "https://assets.coingecko.com/coins/images/17569/standard/traderjoe.png" },
    ],
  },
  {
    title: "Unichain",
    eyebrow: "Unichain",
    tokens: [
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
    ],
  },
  {
    title: "Robinhood Chain",
    eyebrow: "Robinhood Chain",
    tokens: [
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://assets.coingecko.com/coins/images/2518/standard/weth.png" },
      { symbol: "USDG", name: "Global Dollar", logo: "https://assets.coingecko.com/coins/images/38917/standard/USDG.png" },
      { symbol: "CASHCAT", name: "Cash Cat", logo: "https://cdn.dexscreener.com/cms/images/g1-yMcP4iMdm1Yr2?width=800&height=800&quality=95&format=auto" },
      { symbol: "VEX", name: "ProjectVex", logo: "https://cdn.dexscreener.com/cms/images/dbR0nWyawKyvw7sI?width=800&height=800&quality=95&format=auto" },
      { symbol: "HOODRAT", name: "Hoodrat", logo: "https://cdn.dexscreener.com/cms/images/DhzR371m7aajusNq?width=800&height=800&quality=95&format=auto" },
      { symbol: "JUGGERNAUT", name: "The Juggernaut", logo: "https://cdn.dexscreener.com/cms/images/usHPD9u49cr88jb0?width=800&height=800&quality=95&format=auto" },
      { symbol: "MYSTERY", name: "Mystery", logo: "https://cdn.dexscreener.com/cms/images/JwljHMCJkD_V2vJ-?width=800&height=800&quality=95&format=auto" },
      { symbol: "ARROW", name: "Arrow", logo: "https://cdn.dexscreener.com/cms/images/qVNDzbSwL8Gxq58J?width=800&height=800&quality=95&format=auto" },
      { symbol: "VIBE CAT", name: "Vibing Cat", logo: "https://cdn.dexscreener.com/cms/images/SvZWvyPMDa5EREk9?width=800&height=800&quality=95&format=auto" },
      { symbol: "ROBIN", name: "ROBIN", logo: "https://cdn.dexscreener.com/cms/images/sWpWGY-Cmm_Q3sNp?width=800&height=800&quality=95&format=auto" },
      { symbol: "CashDog", name: "CashDog", logo: "https://cdn.dexscreener.com/cms/images/ZCcTasJqsozOQ5zI?width=800&height=800&quality=95&format=auto" },
      { symbol: "BOW", name: "bow.fun", logo: "https://cdn.dexscreener.com/cms/images/4Xon0TNmgTw8pn76?width=800&height=800&quality=95&format=auto" },
    ],
  },
  {
    title: "Chain-Native",
    eyebrow: "Cronos & XRP",
    tokens: [
      { symbol: "CRO", name: "Cronos", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png" },
      { symbol: "XRP", name: "XRP", logo: "/tokens/xrp.png" },
      { symbol: "RLUSD", name: "Ripple USD", logo: "https://coin-images.coingecko.com/coins/images/39651/large/RLUSD_200x200_%281%29.png" },
      { symbol: "KIND", name: "Kindred", logo: HOUSE_LOGO },
      { symbol: "NBAA", name: "NBAA", logo: HOUSE_LOGO },
      { symbol: "POL", name: "Polygon", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
      { symbol: "BNB", name: "BNB Chain", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
      { symbol: "ARB", name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png" },
      { symbol: "OP", name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x4200000000000000000000000000000000000042/logo.png" },
    ],
  },
];

const curatedLogos = new Map(
  curatedTokenGroups.flatMap((group) =>
    group.tokens
      .filter((token) => token.logo)
      .map((token) => [token.symbol.toUpperCase(), token.logo] as const),
  ),
);

// Keep this page in sync with the swap registry instead of maintaining a
// second, incomplete token list by hand.
const tokenGroups = CHAIN_OPTIONS.map((chain) => ({
  title: `${chain.label} Tokens`,
  eyebrow: chain.label,
  tokens: TOKENS
    .filter((token) => token.chainId === chain.id)
    .map((token) => ({
      symbol: token.symbol,
      name: token.name,
      logo:
        token.logo
        ?? curatedLogos.get(token.symbol.toUpperCase())
        ?? fallbackTokenLogo(token.symbol),
      address: token.address,
      chainId: token.chainId,
    })),
})).filter((group) => group.tokens.length > 0);

const networks = [
  { name: "XRP Ledger", badge: "Native Swap", desc: "XRP pairs for RLUSD, native USDC, SOLO (legacy/migrating), CasinoCoin, and XRdoge through XRPL order-book and AMM liquidity using r-address wallets." },
  { name: "Ethereum", badge: "Swap + Bridge", desc: "Deep liquidity including ONDO, ENA, USDe, PENDLE, LDO, EIGEN, PYUSD, blue chips, community tokens, and stablecoins." },
  { name: "Base", badge: "Swap + Bridge", desc: "Home for mr_lightspeed and its live Zora post-coin catalog, MORPHO, DEGEN, VIRTUAL, AERO, House of Joshi tokens, and core assets." },
  { name: "Zora", badge: "Token Catalog", desc: "Chain-aware discovery for creator and content coins deployed on Zora Network. Modern Zora coins deployed on Base remain listed under Base." },
  { name: "Polygon", badge: "Swap", desc: "POL, WETH, WBTC, USDC, USDT, AAVE, LINK, and DAI routed through 0x liquidity." },
  { name: "BNB Chain", badge: "Swap", desc: "BNB-native assets plus verified Ondo tokenized stocks and ETFs, routed through available 0x and PancakeSwap liquidity." },
  { name: "Arbitrum", badge: "Swap", desc: "ARB, PENDLE, ETH, stablecoins, GMX, MAGIC, and wrapped assets across Ethereum L2 liquidity." },
  { name: "Optimism", badge: "Swap", desc: "OP, WLD, ETH, stablecoins, SNX, and VELO across Ethereum L2 liquidity." },
  { name: "Avalanche", badge: "Swap", desc: "AVAX, JOE, stablecoins, WETH, and WBTC on Avalanche C-Chain." },
  { name: "Unichain", badge: "Swap", desc: "ETH, WETH, and USDC on Unichain for new Uniswap-native liquidity." },
  { name: "Robinhood Chain", badge: "Swap", desc: "ETH, WETH, USDG, CASHCAT, VEX, HOODRAT, JUGGERNAUT, MYSTERY, ARROW, VIBE CAT, ROBIN, CashDog, and BOW through 0x liquidity." },
  { name: "Cronos", badge: "Bridge", desc: "USDC, USDT, and ETH routes via Li.Fi between Ethereum, Base, and Cronos." },
  { name: "XRPL EVM", badge: "Token Catalog", desc: "XRP, Hammy USDC, Hammy WETH, and verified imported contracts remain available for discovery while atomic EVM routing is configured." },
];

export default function About() {
  const [lightspeedTokens, setLightspeedTokens] = useState<Token[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const loadLightspeedTokens = async () => {
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        try {
          const response = await fetch("/api/zora-profile-tokens", {
            cache: "no-store",
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`Profile token API ${response.status}`);
          const tokens = await response.json() as Token[];
          if (!Array.isArray(tokens) || tokens.length === 0) {
            throw new Error("Profile token API returned no tokens");
          }
          setLightspeedTokens(tokens);
          return;
        } catch (error) {
          if (controller.signal.aborted) return;
          if (attempt === 4) {
            console.error("Error loading Lightspeed tokens on About:", error);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
        }
      }
    };
    void loadLightspeedTokens();
    return () => controller.abort();
  }, []);

  const displayedTokenGroups = useMemo(() => tokenGroups.map((group) => {
    if (group.eyebrow !== "Base" || lightspeedTokens.length === 0) return group;
    const tokensById = new Map<string, Token>(
      group.tokens.map((token) => [token.address?.toLowerCase() ?? token.symbol.toLowerCase(), token]),
    );
    for (const token of lightspeedTokens.filter((token) => token.chainId === 8453)) {
      const id = token.address?.toLowerCase() ?? token.symbol.toLowerCase();
      if (!tokensById.has(id)) tokensById.set(id, token);
    }
    return { ...group, tokens: Array.from(tokensById.values()) };
  }), [lightspeedTokens]);

  const highlights = useMemo(() => [
    { value: String(CHAIN_OPTIONS.length), label: "Supported chains" },
    {
      value: String(displayedTokenGroups.reduce((total, group) => total + group.tokens.length, 0)),
      label: "Shown assets",
    },
    { value: "1%", label: "House fee" },
  ], [displayedTokenGroups]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <section className="mb-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.07)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.82)]">
            Swap &amp; Bridge
          </div>
          <h1 className="hoj-display max-w-2xl text-3xl font-semibold leading-tight text-[rgba(212,175,55,0.96)] sm:text-4xl">
            House of Joshi across every chain that matters.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
            Trade and discover community tokens, blue-chip assets, stablecoins, and chain-native coins across {CHAIN_OPTIONS.length} supported networks from one non-custodial interface.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-[rgba(212,175,55,0.95)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)]"
            >
              Start Swapping
            </Link>
            <Link
              href="/prices"
              className="rounded-2xl border border-[rgba(212,175,55,0.35)] px-5 py-2.5 text-sm font-medium text-[rgba(212,175,55,0.9)] transition hover:bg-[rgba(212,175,55,0.08)]"
            >
              View Prices
            </Link>
          </div>
        </div>

        <div className="hoj-panel rounded-2xl p-5">
          <div className="mb-5 flex items-center gap-4">
            <img src="/logo.png" alt="House of Joshi" className="h-16 w-16 rounded-2xl object-contain" />
            <div>
              <div className="text-sm font-semibold text-white/90">HOJ Swap &amp; Bridge</div>
              <div className="text-xs text-white/50">Non-custodial trading with in-app route execution.</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                <div className="text-xl font-semibold text-[rgba(212,175,55,0.92)]">{item.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        {[
          { title: "Best route", desc: "0x aggregates swap liquidity across major DEX sources." },
          { title: "Bridge inside the app", desc: "Stargate and Li.Fi routes keep transfers in one flow." },
          { title: "Wallet-first", desc: "You sign every transaction directly from your own wallet." },
        ].map((item) => (
          <div key={item.title} className="hoj-panel rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white/90">{item.title}</h2>
            <p className="mt-2 text-xs leading-6 text-white/55">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <SectionHeading
          eyebrow="Supported tokens"
          title="Logo-first token coverage"
        />
        <div className="grid gap-4">
          {displayedTokenGroups.map((group) => (
            <div key={group.title} className="hoj-panel rounded-2xl p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.65)]">{group.eyebrow}</div>
                  <h3 className="mt-1 text-base font-semibold text-white/90">{group.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/45">{group.tokens.length} assets</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.tokens.map((token) => (
                  <TokenTile key={`${group.title}-${token.address ?? token.symbol}`} {...token} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeading
          eyebrow="Supported networks"
          title="Clear routes by chain"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {networks.map((network) => (
            <div key={network.name} className="hoj-panel rounded-2xl p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white/90">{network.name}</h3>
                <span className="shrink-0 rounded-full border border-[rgba(212,175,55,0.3)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[rgba(212,175,55,0.75)]">{network.badge}</span>
              </div>
              <p className="text-xs leading-6 text-white/54">{network.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="hoj-panel rounded-2xl p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.65)]">How it works</div>
          <h2 className="mt-2 text-lg font-semibold text-white/90">Three actions, one route.</h2>
          <p className="mt-3 text-sm leading-7 text-white/58">
            Connect a wallet, choose tokens and chains, then confirm the quote. The app handles routing, fee display, and transaction history.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { step: "1", title: "Connect", desc: "Use MetaMask, Rabby, Coinbase Wallet, Trust Wallet, or WalletConnect." },
            { step: "2", title: "Route", desc: "Pick a swap or bridge path and review slippage, fees, and outputs." },
            { step: "3", title: "Confirm", desc: "Sign from your wallet and track the transaction in-app." },
          ].map((item) => (
            <div key={item.step} className="hoj-panel rounded-2xl p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(212,175,55,0.15)] text-sm font-bold text-[rgba(212,175,55,0.9)]">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-white/90">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-white/52">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.055)] p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="hoj-display text-lg font-semibold text-[rgba(212,175,55,0.92)]">Ready to trade?</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">
              A 1% house fee applies to swaps and bridges, supporting the House of Joshi treasury and ongoing development.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-[rgba(212,175,55,0.95)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)]"
            >
              Open Swap
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-[rgba(212,175,55,0.35)] px-5 py-2.5 text-sm font-medium text-[rgba(212,175,55,0.9)] transition hover:bg-[rgba(212,175,55,0.08)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-5 max-w-2xl">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.65)]">{eyebrow}</div>
      <h2 className="hoj-display mt-2 text-xl font-semibold text-[rgba(212,175,55,0.92)]">{title}</h2>
      {desc && <p className="mt-2 text-sm leading-6 text-white/56">{desc}</p>}
    </div>
  );
}

function TokenTile({ symbol, name, logo }: Token) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <TokenLogo symbol={symbol} logo={logo} size="lg" />
      <div className="mt-3 w-full truncate text-sm font-semibold text-white/90" title={symbol}>{symbol}</div>
      <div className="mt-1 w-full truncate text-[11px] text-white/45" title={name}>{name}</div>
    </div>
  );
}
