"use client";

import { AlertTriangle, CheckCircle2, Fuel, Info, Route } from "lucide-react";
import { arbitrum } from "@/lib/chains";
import { formatUsdDisplay } from "@/lib/format";
import { getNativeSymbol, type GasFeeDisplay } from "@/lib/gas";
import { calcPriceImpactPercent, type PriceResponse, type QuoteResponse } from "@/lib/quote";
import { isNative, tokensForChain, type Token } from "@/lib/tokens";
import { base } from "wagmi/chains";

type CoachTone = "good" | "warn" | "info";

type CoachMessage = {
  tone: CoachTone;
  icon: "check" | "warn" | "fuel" | "route" | "info";
  title: string;
  body: string;
};

export function SwapCoach({
  quote,
  price,
  sellToken,
  buyToken,
  selectedChainId,
  isConnected,
  isQuoting,
  gasDisplay,
  nativeUsdPrice,
  hasNativeGas,
}: {
  quote: QuoteResponse | null;
  price: PriceResponse | null;
  sellToken: Token;
  buyToken: Token;
  selectedChainId: number;
  isConnected: boolean;
  isQuoting: boolean;
  gasDisplay: GasFeeDisplay | null;
  nativeUsdPrice: number | null;
  hasNativeGas: boolean | null;
}) {
  if (isQuoting) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="house-guide-loading"
        className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/55 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-3 sm:px-4"
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(212,175,55,0.25)] bg-black/30 min-[380px]:h-8 min-[380px]:w-8">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[rgba(212,175,55,0.18)]" />
          <Route className="relative h-4 w-4 animate-pulse text-[rgba(212,175,55,0.95)]" />
        </span>
        <span className="min-w-0 max-w-full">
          <span className="block break-words font-semibold leading-snug text-white/75">
            House Guide is reading the route
          </span>
          <span className="mt-1 flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[rgba(212,175,55,0.85)] [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[rgba(212,175,55,0.65)] [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[rgba(212,175,55,0.45)]" />
          </span>
        </span>
      </div>
    );
  }

  if (!quote && !price) return null;

  const messages = getCoachMessages({
    quote,
    price,
    sellToken,
    buyToken,
    selectedChainId,
    isConnected,
    gasDisplay,
    nativeUsdPrice,
    hasNativeGas,
  });

  if (!messages.length) return null;

  return (
    <div data-testid="house-guide" className="rounded-2xl border border-white/10 bg-black/25 p-2.5 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 min-[380px]:text-[11px] sm:tracking-[0.18em]">
        <Info className="h-3.5 w-3.5 text-[rgba(212,175,55,0.9)]" />
        House Guide
      </div>
      <div className="space-y-2">
        {messages.map((message) => (
          <CoachRow key={`${message.title}-${message.body}`} message={message} />
        ))}
      </div>
    </div>
  );
}

function getCoachMessages({
  quote,
  price,
  sellToken,
  buyToken,
  selectedChainId,
  isConnected,
  gasDisplay,
  nativeUsdPrice,
  hasNativeGas,
}: {
  quote: QuoteResponse | null;
  price: PriceResponse | null;
  sellToken: Token;
  buyToken: Token;
  selectedChainId: number;
  isConnected: boolean;
  gasDisplay: GasFeeDisplay | null;
  nativeUsdPrice: number | null;
  hasNativeGas: boolean | null;
}) {
  const messages: CoachMessage[] = [];
  const activeQuote = quote ?? price;
  const nativeSymbol = getNativeSymbol(selectedChainId);
  const priceImpact = quote && price ? calcPriceImpactPercent(quote, price) : null;
  const routeSources = quote?.route?.fills?.map((fill) => fill.source).filter(Boolean) ?? [];
  const uniqueRouteSources = [...new Set(routeSources)];
  const hasLiquidity = activeQuote?.liquidityAvailable !== false && !!activeQuote?.buyAmount;
  const routeLabel = uniqueRouteSources.length ? uniqueRouteSources.join(" -> ") : null;

  if (hasNativeGas === false && isConnected && !isNative(sellToken)) {
    messages.push({
      tone: "warn",
      icon: "fuel",
      title: `You need ${nativeSymbol} for gas`,
      body: `Keep a little ${nativeSymbol} in this wallet before swapping ${sellToken.symbol}.`,
    });
  }

  if (!hasLiquidity) {
    messages.push({
      tone: "warn",
      icon: "warn",
      title: "Wait, liquidity looks thin",
      body: `This pair is not returning a reliable ${buyToken.symbol} amount on this chain.`,
    });
  } else if (priceImpact != null && Math.abs(priceImpact) >= 5) {
    messages.push({
      tone: "warn",
      icon: "warn",
      title: "High price impact",
      body: `This route is moving the price about ${Math.abs(priceImpact).toFixed(2)}%. Try a smaller amount or another chain.`,
    });
  } else if (priceImpact != null && Math.abs(priceImpact) >= 3) {
    messages.push({
      tone: "warn",
      icon: "warn",
      title: "Price impact is noticeable",
      body: `The quote is about ${Math.abs(priceImpact).toFixed(2)}% away from the indicative price.`,
    });
  } else if (priceImpact != null && priceImpact < -0.1) {
    messages.push({
      tone: "good",
      icon: "check",
      title: "This route is cheaper",
      body: "The executable quote is coming in better than the indicative price.",
    });
  } else if (routeLabel) {
    messages.push({
      tone: "good",
      icon: "route",
      title: "Route found",
      body: `Your swap is routing through ${routeLabel}.`,
    });
  }

  const betterChain = getBetterKnownChain(selectedChainId, sellToken.symbol, buyToken.symbol);
  if ((activeQuote?.liquidityAvailable === false || (priceImpact != null && Math.abs(priceImpact) >= 3)) && betterChain) {
    messages.push({
      tone: "info",
      icon: "route",
      title: `Better to check ${betterChain}`,
      body: `${sellToken.symbol}/${buyToken.symbol} is also listed there, so compare before confirming.`,
    });
  }

  if (gasDisplay?.usd) {
    messages.push({
      tone: "info",
      icon: "fuel",
      title: "Network fee estimate",
      body: `Expected gas is ${gasDisplay.usd}. ${getGasPlainEnglish(gasDisplay.usd, nativeUsdPrice)}`,
    });
  } else if (gasDisplay?.eth) {
    messages.push({
      tone: "info",
      icon: "fuel",
      title: "Network fee estimate",
      body: `Expected gas is ${gasDisplay.eth}.`,
    });
  }

  if (!isConnected && price) {
    messages.push({
      tone: "info",
      icon: "info",
      title: "Connect for the final route",
      body: "This is an indicative price. Connecting your wallet lets the app check allowance, gas, and the executable swap.",
    });
  }

  if (quote?.issues?.simulationIncomplete) {
    messages.push({
      tone: "warn",
      icon: "warn",
      title: "Confirm carefully",
      body: "The route simulation is incomplete, so review the wallet confirmation before signing.",
    });
  }

  return messages.slice(0, 3);
}

function getBetterKnownChain(selectedChainId: number, sellSymbol: string, buySymbol: string) {
  const candidates = [
    { id: base.id, name: "Base" },
    { id: arbitrum.id, name: "Arbitrum" },
  ];

  const match = candidates.find(({ id }) => {
    if (id === selectedChainId) return false;
    const symbols = new Set(tokensForChain(id).map((token) => token.symbol));
    return symbols.has(sellSymbol) && symbols.has(buySymbol);
  });

  return match?.name ?? null;
}

function getGasPlainEnglish(usdFee: string, nativeUsdPrice: number | null) {
  const numericFee = Number(usdFee.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numericFee) || numericFee === 0) return "Looks tiny.";
  if (numericFee < 0.05) return "Looks tiny.";
  if (numericFee > 5) return "That is pricey for a small swap.";
  if (nativeUsdPrice != null && nativeUsdPrice > 0) return `Native token is around ${formatUsdDisplay(nativeUsdPrice)}.`;
  return "Check it before confirming.";
}

function CoachRow({ message }: { message: CoachMessage }) {
  const iconClass = `mt-0.5 h-3.5 w-3.5 shrink-0 min-[380px]:h-4 min-[380px]:w-4 ${toneClass(message.tone)}`;

  return (
    <div className="flex min-w-0 items-start gap-2 rounded-xl bg-white/[0.03] px-2.5 py-2 min-[380px]:px-3">
      {message.icon === "check" ? <CheckCircle2 className={iconClass} /> : null}
      {message.icon === "fuel" ? <Fuel className={iconClass} /> : null}
      {message.icon === "route" ? <Route className={iconClass} /> : null}
      {message.icon === "warn" ? <AlertTriangle className={iconClass} /> : null}
      {message.icon === "info" ? <Info className={iconClass} /> : null}
      <div className="min-w-0">
        <div className={`break-words text-[11px] font-semibold min-[380px]:text-xs ${toneClass(message.tone)}`}>{message.title}</div>
        <div className="mt-0.5 break-words text-[10.5px] leading-relaxed text-white/55 min-[380px]:text-[11px]">
          {message.body}
        </div>
      </div>
    </div>
  );
}

function toneClass(tone: CoachTone) {
  if (tone === "good") return "text-emerald-300/90";
  if (tone === "warn") return "text-amber-200/90";
  return "text-sky-200/90";
}
