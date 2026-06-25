import { useEffect, useState, useCallback } from "react";
import { type Token } from "@/lib/tokens";

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
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trending?chainId=${chainId}`);
      if (!res.ok) {
        setError(null); // Silently fail
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
      setError(null); // Don't show error to user
    } finally {
      setLoading(false);
    }
  }, [chainId, availableTokens]);

  // Fetch on mount and set up auto-refresh every 60 seconds
  useEffect(() => {
    fetchTrendingTokens();
    const interval = setInterval(fetchTrendingTokens, 60000);
    return () => clearInterval(interval);
  }, [fetchTrendingTokens]);

  // If no tokens, don't render anything
  if (tokens.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="mt-4 hoj-card rounded-3xl p-4 sm:p-6">
      <div className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold">
          Trending on {chainId === 1 ? "Ethereum" : chainId === 25 ? "Cronos" : "Base"}
        </p>
        {loading && <span className="text-[10px] text-white/30">Updating...</span>}
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
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
              className="flex-shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.08] hover:border-[rgba(212,175,55,0.3)] transition cursor-pointer"
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
                  <p className="text-xs font-semibold text-white">
                    {token.symbol}
                  </p>
                  <p
                    className={`text-[10px] ${
                      token.price_change_percentage_24h >= 0
                        ? "text-green-400/70"
                        : "text-red-400/70"
                    }`}
                  >
                    {token.price_change_percentage_24h >= 0 ? "+" : ""}
                    {token.price_change_percentage_24h.toFixed(1)}%
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
