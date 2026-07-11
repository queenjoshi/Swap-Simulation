"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { base } from "wagmi/chains";
import { Token, tokenId } from "@/lib/tokens";
import { TokenLogo } from "@/components/TokenLogo";

const TOKEN_LOGOS: Record<string, string> = {
  ETH: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
  WETH: "https://assets.coingecko.com/coins/images/2518/standard/weth.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
  USDT: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
  DAI: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png",
  BNB: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/standard/shiba.png",
  BONE: "https://assets.coingecko.com/coins/images/16916/standard/bone_icon.png",
  POL: "https://assets.coingecko.com/coins/images/32440/standard/polygon.png",
  WBTC: "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png",
  CBBTC: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
  LINK: "https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/standard/uniswap-logo.png",
  AAVE: "https://assets.coingecko.com/coins/images/12645/standard/AAVE.png",
  SNX: "https://assets.coingecko.com/coins/images/3406/standard/SNX.png",
  PEPE: "https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg",
  CRO: "https://assets.coingecko.com/coins/images/7310/standard/cro_token_logo.png",
  CAKE: "https://assets.coingecko.com/coins/images/12632/standard/pancakeswap-cake-logo_%281%29.png",
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
  DEGEN: "https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png",
  FDUSD: "https://assets.coingecko.com/coins/images/31079/standard/firstfigital.jpeg",
  BABYDOGE: "https://assets.coingecko.com/coins/images/16125/standard/babydoge.jpg",
  QUEENJOSHI: "/logo.png",
  KINGJOSHI: "/logo.png",
  KIND: "/logo.png",
  NBAA: "/logo.png",
};

function tokenLogo(token: Token) {
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
          {options.map((option) => {
            const selected = option.id === tokenId(value);
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.token);
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
        </div>
      )}
    </div>
  );
}
