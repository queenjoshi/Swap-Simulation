"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { base } from "wagmi/chains";
import { Token, tokenId } from "@/lib/tokens";
import { TokenLogo } from "@/components/TokenLogo";

const TOKEN_LOGOS: Record<string, string> = {
  ETH: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
  WETH: "https://assets.coingecko.com/coins/images/2518/standard/weth.png",
  USDC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  USDT: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
  DAI: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png",
  BNB: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/standard/shiba.png",
  BONE: "https://assets.coingecko.com/coins/images/16916/standard/bone_icon.png",
  POL: "https://assets.coingecko.com/coins/images/32440/standard/polygon.png",
  WBTC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  CBBTC: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
  LINK: "https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/standard/uniswap-logo.png",
  AAVE: "https://assets.coingecko.com/coins/images/12645/standard/AAVE.png",
  SNX: "https://assets.coingecko.com/coins/images/3406/standard/SNX.png",
  PEPE: "https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg",
  CRO: "https://assets.coingecko.com/coins/images/7310/standard/cro_token_logo.png",
  CAKE: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x0E09FaBB73Bd3Ade0A17ECC321fD13a19E81cE82/logo.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg",
  OP: "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png",
  GMX: "https://assets.coingecko.com/coins/images/18323/standard/arbit.png",
  MAGIC: "https://assets.coingecko.com/coins/images/18623/standard/magic.png",
  VELO: "https://assets.coingecko.com/coins/images/12538/standard/Logo_200x_200.png",
  XRP: "/tokens/xrp.png",
  RLUSD: "https://coin-images.coingecko.com/coins/images/39651/large/RLUSD_200x200_%281%29.png",
  FLOKI: "/tokens/floki.png",
  MAME: "/tokens/mame-inu.png",
  TREAT: "/tokens/treat146b.png",
  OSCAR: "/tokens/oscar.png",
  MOG: "/tokens/mog.png",
  TOSHI: "/tokens/toshi.png",
  AERO: "https://assets.coingecko.com/coins/images/31745/standard/token.png",
  BRETT: "https://assets.coingecko.com/coins/images/35529/standard/1000050750.png",
  CAW: "https://s2.coinmarketcap.com/static/img/coins/200x200/30402.png",
  VIRTUAL: "https://assets.coingecko.com/coins/images/34057/standard/LOGOMARK.png",
  ONDO: "https://assets.coingecko.com/coins/images/26580/standard/ONDO.png",
  ENA: "https://assets.coingecko.com/coins/images/36530/standard/ethena.png",
  USDE: "https://assets.coingecko.com/coins/images/33613/standard/usde.png",
  MORPHO: "https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png",
  PENDLE: "https://assets.coingecko.com/coins/images/15069/standard/Pendle_Logo_Normal-03.png",
  DEGEN: "https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png",
  WLD: "https://assets.coingecko.com/coins/images/31069/standard/worldcoin.jpeg",
  JOE: "https://assets.coingecko.com/coins/images/17569/standard/traderjoe.png",
  LDO: "https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png",
  EIGEN: "https://assets.coingecko.com/coins/images/37441/standard/eigenlayer.png",
  PYUSD: "https://assets.coingecko.com/coins/images/31212/standard/PYUSD_Logo_%282%29.png",
  FDUSD: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409/logo.png",
  USDG: "https://assets.coingecko.com/coins/images/38917/standard/USDG.png",
  CASHCAT: "https://cdn.dexscreener.com/cms/images/g1-yMcP4iMdm1Yr2?width=800&height=800&quality=95&format=auto",
  VEX: "https://cdn.dexscreener.com/cms/images/dbR0nWyawKyvw7sI?width=800&height=800&quality=95&format=auto",
  HOODRAT: "https://cdn.dexscreener.com/cms/images/DhzR371m7aajusNq?width=800&height=800&quality=95&format=auto",
  JUGGERNAUT: "https://cdn.dexscreener.com/cms/images/usHPD9u49cr88jb0?width=800&height=800&quality=95&format=auto",
  MYSTERY: "https://cdn.dexscreener.com/cms/images/JwljHMCJkD_V2vJ-?width=800&height=800&quality=95&format=auto",
  ARROW: "https://cdn.dexscreener.com/cms/images/qVNDzbSwL8Gxq58J?width=800&height=800&quality=95&format=auto",
  "VIBE CAT": "https://cdn.dexscreener.com/cms/images/SvZWvyPMDa5EREk9?width=800&height=800&quality=95&format=auto",
  ROBIN: "https://cdn.dexscreener.com/cms/images/sWpWGY-Cmm_Q3sNp?width=800&height=800&quality=95&format=auto",
  CASHDOG: "https://cdn.dexscreener.com/cms/images/ZCcTasJqsozOQ5zI?width=800&height=800&quality=95&format=auto",
  BOW: "https://cdn.dexscreener.com/cms/images/4Xon0TNmgTw8pn76?width=800&height=800&quality=95&format=auto",
  BABYDOGE: "https://assets.coingecko.com/coins/images/16125/standard/babydoge.jpg",
  ZORA: "https://coin-images.coingecko.com/coins/images/54693/large/zora.jpg",
  CBETH: "https://assets.coingecko.com/coins/images/27008/large/cbeth.png",
  EURC: "https://assets.coingecko.com/coins/images/26045/standard/euro.png",
  WELL: "https://assets.coingecko.com/coins/images/26133/large/WELL.png",
  AIXBT: "https://coin-images.coingecko.com/coins/images/51784/large/3.png",
  KAITO: "https://coin-images.coingecko.com/coins/images/54411/large/Qm4DW488_400x400.jpg",
  CLANKER: "https://coin-images.coingecko.com/coins/images/51440/large/CLANKER.png",
  SPX: "https://coin-images.coingecko.com/coins/images/31401/large/centeredcoin_%281%29.png",
  SYRUP: "https://coin-images.coingecko.com/coins/images/51232/large/_syrup_token_logo.png",
  FLUID: "https://coin-images.coingecko.com/coins/images/14688/large/Frame_1686566116_%281%29_%281%29.png",
  COW: "https://coin-images.coingecko.com/coins/images/24384/large/CoW-token_logo.png",
  EUL: "https://coin-images.coingecko.com/coins/images/26149/large/Coingecko_logo_%281%29.png",
  ZRO: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x6985884C4392D348587B19cb9eAAf157F13271cd/logo.png",
  W: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91/logo.png",
  AXL: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x23ee2343b892b1bb63503a4fabc840e0e2c6810f/logo.png",
  SUSHI: "https://assets.coingecko.com/coins/images/12271/standard/512x512_Logo_no_chop.png",
  NPC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xb166e8b140d35d9d8226e40c09f757bac5a4d87d/logo.png",
  TIBBIR: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00/logo.png",
  WCT: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0xef4461891dfb3ac8572ccf7c794664a8dd927945/logo.png",
  CRV: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
  COMP: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png",
  ENS: "https://assets.coingecko.com/coins/images/19785/standard/acatxTm8_400x400.jpg",
  GRT: "https://assets.coingecko.com/coins/images/13397/standard/Graph_Token.png",
  RPL: "https://coin-images.coingecko.com/coins/images/2090/large/rocket_pool_%28RPL%29.png",
  SKY: "https://assets.coingecko.com/coins/images/39925/large/sky.jpg",
  GRAIL: "https://assets.coingecko.com/coins/images/28416/standard/v2.png",
  RDNT: "https://assets.coingecko.com/coins/images/26536/standard/Radiant-Logo-200x200.png",
  LUSD: "https://assets.coingecko.com/coins/images/14666/standard/Group_3.png",
  PNG: "https://assets.coingecko.com/coins/images/13423/standard/pangolin.jpg",
  QI: "https://assets.coingecko.com/coins/images/16362/standard/GergDDN3_400x400.jpg",
  COQ: "https://assets.coingecko.com/coins/images/34656/standard/coq200x200.png",
  SAVAX: "https://assets.coingecko.com/coins/images/23657/standard/savax_blue.png",
  XVS: "https://assets.coingecko.com/coins/images/12677/standard/XVS_Token.jpg",
  TWT: "https://assets.coingecko.com/coins/images/11085/standard/Trust.png",
  QUICK: "https://assets.coingecko.com/coins/images/13970/standard/1_pOU6pBMEmiL-ZJVb0CYRjQ.png",
  SAND: "https://assets.coingecko.com/coins/images/12129/standard/sandbox_logo.jpg",
  GHO: "https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png",
  USDS: "https://assets.coingecko.com/coins/images/39926/large/usds.webp",
  USDBC: "https://assets.coingecko.com/coins/images/35220/standard/USDbC.png",
  PRIME: "https://assets.coingecko.com/coins/images/29053/large/PRIMELOGOOO.png",
  WSTETH: "https://assets.coingecko.com/coins/images/18834/standard/wstETH.png",
  STETH: "https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png",
  RETH: "https://assets.coingecko.com/coins/images/20764/standard/reth.png",
  MKR: "https://assets.coingecko.com/coins/images/1364/standard/Mark_Maker.png",
  FRAX: "https://assets.coingecko.com/coins/images/13422/standard/frax_logo.png",
  WAVAX: "https://assets.coingecko.com/coins/images/15075/standard/wrapped-avax.png",
  "BTC.B": "https://assets.coingecko.com/coins/images/26115/standard/btcb.png",
  XAVA: "https://assets.coingecko.com/coins/images/14826/standard/logo_-_2021-03-31T123525.615.png",
  BTCB: "https://assets.coingecko.com/coins/images/14108/standard/Binance-bitcoin.png",
  LISTA: "https://assets.coingecko.com/coins/images/38023/standard/lista.png",
  THE: "https://assets.coingecko.com/coins/images/28864/standard/thena.jpeg",
  ALPACA: "https://assets.coingecko.com/coins/images/14165/standard/Logo200.png",
  USDT0: "https://coin-images.coingecko.com/coins/images/53705/large/usdt0.jpg",
  "USDC.E": "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
  MNT: "https://www.mantle.xyz/favicon.ico",
  S: "https://www.soniclabs.com/favicon.ico",
  BERA: "https://www.berachain.com/favicon.ico",
  MON: "https://www.monad.xyz/favicon.ico",
  HYPE: "https://hyperfoundation.org/favicon.ico",
  XPL: "https://www.plasma.to/favicon.ico",
  "QUICK OLD": "https://assets.coingecko.com/coins/images/13970/standard/1_pOU6pBMEmiL-ZJVb0CYRjQ.png",
  QUEENJOSHI: "/logo.png",
  KINGJOSHI: "/logo.png",
  KIND: "/logo.png",
  NBAA: "/logo.png",
};

const DEXSCREENER_CHAIN_SLUGS: Record<number, string> = {
  1: "ethereum", 10: "optimism", 25: "cronos", 56: "bsc", 130: "unichain",
  137: "polygon", 143: "monad", 146: "sonic", 480: "worldchain", 999: "hyperevm",
  4663: "robinhood", 5000: "mantle", 8453: "base", 9745: "plasma",
  42161: "arbitrum", 43114: "avalanche", 57073: "ink", 59144: "linea",
  80094: "berachain", 534352: "scroll", 7777777: "zora",
};

// Keep House and creator listings visible at the top of the compact swap menu.
// The remaining assets retain their registry order below these featured tokens.
const FEATURED_TOKEN_ORDER = [
  "MR_LIGHTSPEED",
  "QUEENJOSHI",
  "KINGJOSHI",
  "KIND",
  "NBAA",
  "MAME",
  "TREAT",
  "OSCAR",
] as const;

const FEATURED_TOKEN_RANK = new Map<string, number>(
  FEATURED_TOKEN_ORDER.map((symbol, index) => [symbol, index]),
);

export function fallbackTokenLogo(symbol: string) {
  return TOKEN_LOGOS[symbol.trim().toUpperCase()];
}

function tokenLogo(token: Token) {
  const logos: string[] = [];
  if (token.logo) logos.push(token.logo);
  if (token.chainId === base.id && token.symbol.toUpperCase() === "SHIB") {
    logos.push("https://s2.coinmarketcap.com/static/img/coins/200x200/37553.png");
  }
  const symbolLogo = fallbackTokenLogo(token.symbol);
  if (symbolLogo) logos.push(symbolLogo);
  const chainSlug = DEXSCREENER_CHAIN_SLUGS[token.chainId];
  if (chainSlug && token.address) {
    logos.push(`https://cdn.dexscreener.com/token-images/og/${chainSlug}/${token.address.toLowerCase()}`);
  }
  return [...new Set(logos)];
}

export function TokenSelect({
  tokens,
  value,
  onChange,
}: {
  tokens: Token[];
  value: Token;
  onChange: (t: Token) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () =>
      tokens
        .map((t, registryIndex) => ({
          id: tokenId(t),
          symbol: t.symbol,
          name: t.name,
          token: t,
          logo: tokenLogo(t),
          registryIndex,
        }))
        .sort((a, b) => {
          const aRank = FEATURED_TOKEN_RANK.get(a.symbol.toUpperCase());
          const bRank = FEATURED_TOKEN_RANK.get(b.symbol.toUpperCase());
          if (aRank !== undefined || bRank !== undefined) {
            return (aRank ?? Number.MAX_SAFE_INTEGER) - (bRank ?? Number.MAX_SAFE_INTEGER);
          }
          return a.registryIndex - b.registryIndex;
        }),
    [tokens],
  );
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter(({ symbol, name, token }) =>
      symbol.toLowerCase().includes(normalized)
      || name.toLowerCase().includes(normalized)
      || token.address?.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-2 text-left text-white outline-none ring-0 transition hover:border-[rgba(212,175,55,0.25)] focus:border-[rgba(212,175,55,0.45)]"
        onClick={() => setOpen((next) => !next)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <TokenLogo symbol={value.symbol} logo={tokenLogo(value)} size="xs" />
          <span className="truncate text-sm font-semibold">{value.symbol}</span>
        </span>
        <span className={`text-xs text-[rgba(212,175,55,0.9)] transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-40 mt-2 max-h-[min(18rem,60dvh)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#151517] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.55)]"
        >
          <div className="sticky top-0 z-10 bg-[#151517] p-1">
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search name, symbol, or address"
              className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-base text-white outline-none placeholder:text-white/30 focus:border-[rgba(212,175,55,0.45)] sm:text-sm"
            />
            <p className="px-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
              {filteredOptions.length} of {options.length} tokens
            </p>
          </div>
          {filteredOptions.map((option) => {
            const selected = option.id === tokenId(value);
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.token);
                  setQuery("");
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  selected
                    ? "bg-[rgba(212,175,55,0.14)] text-white"
                    : "text-white/78 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <TokenLogo symbol={option.symbol} logo={option.logo} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold leading-tight">{option.symbol}</span>
                  <span className="block truncate text-xs leading-tight text-white/40">{option.name}</span>
                  {option.token.trending ? (
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">Trending · unverified</span>
                  ) : option.token.imported ? (
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">Unverified import</span>
                  ) : null}
                </span>
              </button>
            );
          })}
          {filteredOptions.length === 0 && (
            <p className="px-3 py-5 text-center text-xs text-white/40">No matching token</p>
          )}
        </div>
      )}
    </div>
  );
}
