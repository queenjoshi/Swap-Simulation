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
  FLOKI: "/tokens/floki.png",
  MAME: "/tokens/mame-inu.png",
  TREAT: "/tokens/treat146b.png",
  OSCAR: "/tokens/oscar.png",
  MOG: "/tokens/mog.png",
  TOSHI: "/tokens/toshi.png",
  AERO: "https://assets.coingecko.com/coins/images/31745/standard/token.png",
  BRETT: "https://assets.coingecko.com/coins/images/35529/standard/1000050750.png",
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
  GHST: "https://assets.coingecko.com/coins/images/12467/standard/ghst_200.png",
  QUEENJOSHI: "/logo.png",
  KINGJOSHI: "/logo.png",
  KIND: "/logo.png",
  NBAA: "/logo.png",
};

function tokenLogo(token: Token) {
  if (token.logo) return token.logo;
  if (token.chainId === base.id && token.symbol.toUpperCase() === "SHIB") {
    return "/tokens/shib-base.png";
  }
  return TOKEN_LOGOS[token.symbol.toUpperCase()];
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
      tokens.map((t) => ({
        id: tokenId(t),
        symbol: t.symbol,
        name: t.name,
        token: t,
        logo: tokenLogo(t),
      })),
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
          className="absolute right-0 top-full z-40 mt-2 max-h-72 min-w-[15rem] overflow-y-auto rounded-2xl border border-white/10 bg-[#151517] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.55)]"
        >
          <div className="sticky top-0 z-10 bg-[#151517] p-1">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, symbol, or address"
              className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[rgba(212,175,55,0.45)]"
            />
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
