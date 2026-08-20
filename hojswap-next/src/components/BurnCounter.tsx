"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Flame, RefreshCw, ShieldCheck } from "lucide-react";

type BurnStats = {
  success: boolean;
  status: "awaiting_onchain_integration" | "live";
  totalBurnedShib: string;
  burnTransactionCount: number;
  lastBurnAt: string | null;
  timestamp: number;
};

const SHIB_DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

function formatShib(value: string) {
  try {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(BigInt(value));
  } catch {
    return "0";
  }
}

export function BurnCounter() {
  const [stats, setStats] = useState<BurnStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/burn-stats", { cache: "no-store" });
      const payload = (await response.json()) as BurnStats & { error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Burn statistics are unavailable");
      setStats(payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Burn statistics are unavailable");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
    const interval = window.setInterval(() => void fetchStats(true), 30_000);
    return () => window.clearInterval(interval);
  }, [fetchStats]);

  const pending = stats?.status !== "live";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
      <section className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_42%),linear-gradient(145deg,#17120f,#0d0d0f_68%)] p-6 shadow-2xl shadow-black/25 sm:p-9">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-400/10 text-orange-300">
                <Flame className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200/60">SHIB burn ledger</p>
                <h2 className="hoj-display mt-1 text-xl font-semibold text-white/90">Verified total burned</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void fetchStats(true)}
              disabled={refreshing}
              className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/60 transition hover:border-orange-300/30 hover:text-orange-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="py-12 text-center sm:py-16">
            {loading ? (
              <p className="animate-pulse text-sm text-white/40">Syncing burn ledger…</p>
            ) : error ? (
              <p className="text-sm text-rose-300">{error}</p>
            ) : (
              <>
                <p className="hoj-display text-5xl font-bold tracking-tight text-orange-300 sm:text-7xl">
                  {formatShib(stats?.totalBurnedShib ?? "0")}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[0.2em] text-white/65">SHIB</p>
              </>
            )}
          </div>

          <div className="grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wider text-white/35">Verified burn transactions</p>
              <p className="mt-2 text-2xl font-semibold text-white/85">{stats?.burnTransactionCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wider text-white/35">Tracker status</p>
              <p className={`mt-2 text-sm font-semibold ${pending ? "text-amber-300" : "text-emerald-300"}`}>
                {pending ? "Awaiting on-chain integration" : "Live and verified"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-[rgba(212,175,55,0.16)] bg-white/[0.025] p-6">
          <ShieldCheck className="h-6 w-6 text-[#dfbd51]" aria-hidden="true" />
          <h3 className="hoj-display mt-4 text-lg font-semibold text-white/90">Verified numbers only</h3>
          <p className="mt-3 text-sm leading-6 text-white/50">
            This counter intentionally starts at zero. It will count only confirmed SHIB transfers from the configured protocol burn process after the on-chain indexer is activated.
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.025] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Reference burn address</p>
          <p className="mt-3 break-all font-mono text-xs leading-5 text-white/60">{SHIB_DEAD_ADDRESS}</p>
          <a
            href={`https://etherscan.io/address/${SHIB_DEAD_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfbd51] transition hover:text-[#f4d776]"
          >
            View on Etherscan <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>
    </div>
  );
}
