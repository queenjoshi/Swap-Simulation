"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface CryptoPrice {
  symbol: string;
  name: string;
  id: string;
  price: number;
  change24h?: number;
}

export default function PricesPage() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const cryptoIds = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "ripple", symbol: "XRP", name: "Ripple" },
    { id: "binancecoin", symbol: "BNB", name: "Binance Coin" },
    { id: "polygon-ecosystem-token", symbol: "POL", name: "Polygon Ecosystem Token" },
    { id: "arbitrum", symbol: "ARB", name: "Arbitrum" },
    { id: "optimism", symbol: "OP", name: "Optimism" },
    { id: "pancakeswap-token", symbol: "CAKE", name: "PancakeSwap" },
    { id: "aerodrome-finance", symbol: "AERO", name: "Aerodrome Finance" },
    { id: "cardano", symbol: "ADA", name: "Cardano" },
    { id: "solana", symbol: "SOL", name: "Solana" },
  ];

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = cryptoIds.map((c) => c.id).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${ids}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&x_cg_demo_api_key=CG-7spNLu6znsvXHsnoxiaFKjt8`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }

      const data = await response.json();

      const formattedPrices: CryptoPrice[] = cryptoIds.map((crypto) => ({
        ...crypto,
        price: data[crypto.id]?.usd || 0,
        change24h: data[crypto.id]?.usd_24h_change || 0,
      }));

      setPrices(formattedPrices);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching prices:", err);
      setError("Failed to fetch cryptocurrency prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Push ads after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      {/* Header */}
      <div className="border-b border-[rgba(212,175,55,0.12)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="hoj-display text-4xl font-bold text-[rgba(212,175,55,0.9)]">
            Cryptocurrency Prices
          </h1>
          <p className="mt-2 text-white/60">
            Real-time prices for major swap and bridge assets, powered by CoinGecko
          </p>
        </div>
      </div>

      {/* AdSense Banner */}
      <div className="border-b border-[rgba(212,175,55,0.12)]">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '100%', maxWidth: '1000px', height: '90px' }}
              data-ad-client="ca-pub-8905064413166970"
              data-ad-slot="4854619850"
            ></ins>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Refresh Button & Last Updated */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-sm text-white/50">
            {lastUpdated && (
              <>
                Last updated:{" "}
                <span className="text-[rgba(212,175,55,0.9)]">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="rounded-2xl border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] px-6 py-2 text-sm font-semibold text-[rgba(212,175,55,0.9)] hover:bg-[rgba(212,175,55,0.2)] disabled:opacity-50 transition"
          >
            {loading ? "Updating..." : "Refresh"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Price Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prices.map((crypto) => (
            <div
              key={crypto.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition"
            >
              {/* Symbol & Name */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {crypto.symbol}
                </h3>
                <p className="text-sm text-white/60">{crypto.name}</p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-4xl font-bold text-[rgba(212,175,55,0.95)]">
                  ${crypto.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* 24h Change */}
              {crypto.change24h !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">24h Change:</span>
                  <span
                    className={`text-sm font-semibold ${
                      crypto.change24h >= 0
                        ? "text-green-400/80"
                        : "text-red-400/80"
                    }`}
                  >
                    {crypto.change24h >= 0 ? "+" : ""}
                    {crypto.change24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && prices.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-white/60">Loading prices...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && prices.length === 0 && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-white/60">No prices available</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-white/40">
            Prices provided by CoinGecko API • Updated every 60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
