"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, Flame, LayoutList, RefreshCw, Search, Sparkles, Star } from "lucide-react";
import { TokenLogo } from "@/components/TokenLogo";
import { CHAIN_OPTIONS, getChainName, SWAP_SUPPORTED_CHAIN_IDS } from "@/lib/chains";
import { TOKENS, type Token } from "@/lib/tokens";

type MarketRow = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number | null;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  volume24h: number | null;
  fdv: number | null;
  marketCap: number | null;
  sparkline: number[];
};

type ViewMode = "trending" | "top" | "watchlist" | "new";
type SortKey = "price" | "change1h" | "change24h" | "change30d" | "volume24h" | "fdv";

const supportedTokens = TOKENS.filter((token) => SWAP_SUPPORTED_CHAIN_IDS.includes(token.chainId));

const FALLBACK_LOGOS: Record<string, string> = {
  ETH: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
  WETH: "https://assets.coingecko.com/coins/images/2518/standard/weth.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
  USDT: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
  XRP: "/tokens/xrp.png",
  BNB: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png",
  POL: "https://assets.coingecko.com/coins/images/32440/standard/polygon.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg",
  OP: "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png",
};

function normalizeSymbol(symbol: string) {
  return symbol.toUpperCase().replace(/\s+/g, "");
}

function preferredLogo(tokens: Token[], market?: MarketRow) {
  const tokenWithLogo = tokens.find(
    (token): token is Token & { logo: string } =>
      "logo" in token && typeof token.logo === "string" && token.logo.length > 0,
  );
  return tokenWithLogo?.logo ?? market?.image ?? FALLBACK_LOGOS[normalizeSymbol(tokens[0]?.symbol ?? "")];
}

function formatMoney(value: number | null, compact = false) {
  if (value == null || !Number.isFinite(value)) return "—";
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  const digits = value >= 1 ? 2 : value >= 0.01 ? 4 : value >= 0.0001 ? 6 : 8;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(value);
}

function Percent({ value }: { value: number | null }) {
  if (value == null || !Number.isFinite(value)) return <span className="text-white/25">—</span>;
  const positive = value >= 0;
  return (
    <span className={positive ? "text-emerald-400" : "text-rose-400"}>
      {positive ? "+" : ""}{value.toFixed(Math.abs(value) >= 100 ? 0 : 1)}%
    </span>
  );
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const points = useMemo(() => {
    const source = values.length > 1 ? values.slice(-24) : [0, 0];
    const min = Math.min(...source);
    const max = Math.max(...source);
    const range = max - min || 1;
    return source
      .map((value, index) => `${(index / (source.length - 1)) * 92 + 4},${35 - ((value - min) / range) * 28}`)
      .join(" ");
  }, [values]);
  return (
    <svg viewBox="0 0 100 40" className="h-9 w-24" aria-hidden="true">
      <polyline
        fill="none"
        stroke={positive ? "#34d399" : "#fb7185"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function PricesPage() {
  const [market, setMarket] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<number | "all">("all");
  const [view, setView] = useState<ViewMode>("trending");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "volume24h",
    direction: "desc",
  });

  useEffect(() => {
    try {
      setWatchlist(JSON.parse(localStorage.getItem("hojswap-price-watchlist") ?? "[]"));
    } catch {
      setWatchlist([]);
    }
  }, []);

  async function loadMarket() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/market-prices", { cache: "no-store" });
      if (!response.ok) throw new Error("Market data is temporarily unavailable");
      setMarket(await response.json());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Market data is temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarket();
    const timer = window.setInterval(loadMarket, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const rows = useMemo(() => {
    const marketBySymbol = new Map(market.map((row) => [normalizeSymbol(row.symbol), row]));
    const grouped = new Map<string, Token[]>();
    for (const token of supportedTokens) {
      const key = normalizeSymbol(token.symbol);
      const list = grouped.get(key) ?? [];
      list.push(token);
      grouped.set(key, list);
    }

    let result = [...grouped.entries()].map(([key, tokens]) => {
      const price = marketBySymbol.get(key);
      return {
        key,
        tokens,
        symbol: tokens[0].symbol,
        name: price?.name ?? tokens[0].name,
        market: price,
        logo: preferredLogo(tokens, price),
        chains: [...new Set(tokens.map((token) => token.chainId))],
      };
    });

    if (selectedChain !== "all") result = result.filter((row) => row.chains.includes(selectedChain));
    const needle = query.trim().toLowerCase();
    if (needle) {
      result = result.filter((row) =>
        row.symbol.toLowerCase().includes(needle) || row.name.toLowerCase().includes(needle)
      );
    }
    if (view === "watchlist") result = result.filter((row) => watchlist.includes(row.key));
    if (view === "new") result = result.filter((row) =>
      ["1INCH", "YFI", "BAL", "CVX", "GNO", "SPX", "SYRUP", "FLUID", "COW", "EUL", "ZRO", "W", "AXL", "SUSHI", "NPC", "TIBBIR", "WCT"].includes(row.key)
    );

    const getValue = (row: (typeof result)[number]) => row.market?.[sort.key] ?? Number.NEGATIVE_INFINITY;
    result.sort((a, b) => {
      if (view === "top" && sort.key === "volume24h") {
        return (b.market?.marketCap ?? -1) - (a.market?.marketCap ?? -1);
      }
      const difference = getValue(a) - getValue(b);
      return sort.direction === "asc" ? difference : -difference;
    });
    return result;
  }, [market, query, selectedChain, sort, view, watchlist]);

  function toggleWatchlist(key: string) {
    setWatchlist((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      localStorage.setItem("hojswap-price-watchlist", JSON.stringify(next));
      return next;
    });
  }

  function updateSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  }

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#0b0b0d] text-white">
      <div className="border-b border-white/[0.08] bg-[#101012]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d4af37]">
              <Sparkles className="h-4 w-4" /> HOJSwap markets
            </div>
            <h1 className="hoj-display text-3xl font-semibold sm:text-4xl">Token prices</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              Explore market data for tokens available in the HOJSwap selector.
            </p>
          </div>
          <div className="flex w-full gap-2 lg:w-auto">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 lg:w-80">
              <Search className="h-4 w-4 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search supported tokens"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
              />
            </label>
            <button
              onClick={loadMarket}
              disabled={loading}
              className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/60 transition hover:border-[#d4af37]/40 hover:text-[#d4af37] disabled:opacity-50"
              aria-label="Refresh prices"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.08] px-4 py-5 sm:px-6 lg:min-h-[720px] lg:border-b-0 lg:border-r">
          <div className="mb-5 text-sm font-semibold">Filter by chain</div>
          <div className="flex flex-wrap gap-2 lg:flex-col">
            <button
              onClick={() => setSelectedChain("all")}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedChain === "all"
                  ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#ead173]"
                  : "border-white/[0.07] bg-white/[0.025] text-white/55 hover:text-white"
              }`}
            >
              All supported chains
            </button>
            {CHAIN_OPTIONS.filter((chain) => chain.swap).map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedChain === chain.id
                    ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#ead173]"
                    : "border-white/[0.07] bg-white/[0.025] text-white/55 hover:text-white"
                }`}
              >
                {chain.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {([
                ["trending", Flame, "Trending"],
                ["top", ArrowDownUp, "Top"],
                ["watchlist", Star, "Watchlist"],
                ["new", Sparkles, "New"],
              ] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                    view === key
                      ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#ead173]"
                      : "border-white/[0.08] text-white/45 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/35">
              <span className={`h-2 w-2 rounded-full ${error ? "bg-rose-400" : "bg-emerald-400"}`} />
              {error ? "Price feed unavailable" : `${rows.length} supported tokens`}
              <LayoutList className="ml-2 h-4 w-4" />
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 sm:m-6">
              {error}. Supported tokens are still shown; refresh to try the price feed again.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] border-collapse text-sm">
              <thead className="border-b border-white/[0.08] text-[11px] uppercase tracking-[0.14em] text-white/35">
                <tr>
                  <th className="w-12 px-4 py-4 sm:px-6" />
                  <th className="px-3 py-4 text-left font-medium">Token</th>
                  {([
                    ["price", "Price"],
                    ["change1h", "1h"],
                    ["change24h", "1d"],
                    ["change30d", "30d"],
                    ["volume24h", "1d vol"],
                    ["fdv", "FDV"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="px-4 py-4 text-right font-medium">
                      <button onClick={() => updateSort(key)} className="inline-flex items-center gap-1 hover:text-white">
                        {label}<ChevronDown className={`h-3 w-3 ${sort.key === key && sort.direction === "asc" ? "rotate-180" : ""}`} />
                      </button>
                    </th>
                  ))}
                  <th className="px-5 py-4 text-right font-medium">Last 7d</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const watched = watchlist.includes(row.key);
                  const marketRow = row.market;
                  return (
                    <tr key={row.key} className="border-b border-white/[0.065] transition hover:bg-white/[0.025]">
                      <td className="px-4 py-4 sm:px-6">
                        <button onClick={() => toggleWatchlist(row.key)} aria-label={`Watch ${row.symbol}`}>
                          <Star className={`h-4 w-4 ${watched ? "fill-[#d4af37] text-[#d4af37]" : "text-white/35 hover:text-white"}`} />
                        </button>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <TokenLogo symbol={row.symbol} logo={row.logo} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="max-w-44 truncate font-semibold text-white/90">{row.name}</span>
                              <span className="text-xs text-white/35">{row.symbol}</span>
                            </div>
                            <div className="mt-1 flex max-w-64 gap-1 overflow-hidden">
                              {row.chains.slice(0, 3).map((chainId) => (
                                <span key={chainId} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-white/35">
                                  {getChainName(chainId)}
                                </span>
                              ))}
                              {row.chains.length > 3 && <span className="text-[9px] text-white/30">+{row.chains.length - 3}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-white/85">{formatMoney(marketRow?.price ?? null)}</td>
                      <td className="px-4 py-4 text-right"><Percent value={marketRow?.change1h ?? null} /></td>
                      <td className="px-4 py-4 text-right"><Percent value={marketRow?.change24h ?? null} /></td>
                      <td className="px-4 py-4 text-right"><Percent value={marketRow?.change30d ?? null} /></td>
                      <td className="px-4 py-4 text-right text-white/65">{formatMoney(marketRow?.volume24h ?? null, true)}</td>
                      <td className="px-4 py-4 text-right text-white/65">{formatMoney(marketRow?.fdv ?? null, true)}</td>
                      <td className="px-5 py-2 text-right">
                        <Sparkline
                          values={marketRow?.sparkline ?? []}
                          positive={(marketRow?.change7d ?? marketRow?.change24h ?? 0) >= 0}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && rows.length === 0 && (
            <div className="px-6 py-20 text-center text-sm text-white/40">
              No supported tokens match this view.
            </div>
          )}
          {loading && market.length === 0 && (
            <div className="px-6 py-20 text-center text-sm text-white/40">Loading supported token markets…</div>
          )}
        </section>
      </div>
    </div>
  );
}
