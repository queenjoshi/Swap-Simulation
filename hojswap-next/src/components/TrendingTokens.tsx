"use client";
import { useEffect, useState, useCallback } from "react";
import { getChainName } from "@/lib/chains";

interface TrendingToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

interface TrendingTokensProps {
  chainId: number;
  onSelectToken: (symbol: string) => void;
  availableTokens?: string[]; // List of available token symbols for this chain
}

export function TrendingTokens({ chainId, onSelectToken, availableTokens = [] }: TrendingTokensProps) {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrendingTokens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trending?chainId=${chainId}`);
      if (!res.ok) {
        setTokens([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter to only show tokens that are available on this chain
        const filteredTokens = data.filter(token => 
          availableTokens.includes(token.symbol.toUpperCase())
        );
        setTokens(filteredTokens);
      } else {
        setTokens([]);
      }
    } catch (err) {
      console.error("Error fetching trending tokens:", err);
      setTokens([]); // Clear tokens on error
    } finally {
      setLoading(false);
    }
  }, [chainId, availableTokens]);

  // Fetch on mount and set up auto-refresh every 60 seconds
  useEffect(() => {
    const initialFetch = window.setTimeout(() => void fetchTrendingTokens(), 0);
    const interval = setInterval(fetchTrendingTokens, 60000);
    return () => {
      window.clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchTrendingTokens]);

  // If no tokens, don't render anything
  if (tokens.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="mt-3 rounded-[24px] border border-white/8 bg-white/[0.025] px-3 py-3">
      <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Quick picks on {getChainName(chainId)}
        </p>
        {loading && <span className="text-[10px] text-white/25">Updating...</span>}
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          {tokens.map((token) => (
            <button
              key={token.id}
              onClick={() => {
                try {
                  onSelectToken(token.symbol);
                } catch (e) {
                  console.error("Error selecting token:", e);
                }
              }}
              className="flex-shrink-0 cursor-pointer rounded-full border border-white/10 bg-black/20 px-3 py-2 transition hover:border-[rgba(212,175,55,0.3)] hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-2">
                <img
                  src={token.image}
                  alt={token.symbol}
                  className="h-5 w-5 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="text-left">
                  <p className="text-xs font-semibold leading-none text-white">
                    {token.symbol}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
    </div>
  );
}
