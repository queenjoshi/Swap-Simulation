"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { VersionedTransaction } from "@solana/web3.js";
import { TokenLogo } from "@/components/TokenLogo";
import { SOLANA_CORE_FALLBACK, type SolanaToken } from "@/lib/solana";

type JupiterOrder = {
  requestId?: string;
  transaction?: string;
  inAmount?: string;
  outAmount?: string;
  priceImpactPct?: string;
  feeReady?: boolean;
  houseFeeBps?: number;
  error?: string;
};

function toAtomic(value: string, decimals: number) {
  const normalized = value.trim();
  if (!/^\d*(\.\d*)?$/.test(normalized) || !normalized || Number(normalized) <= 0) return null;
  const [whole = "0", fraction = ""] = normalized.split(".");
  return `${whole}${fraction.padEnd(decimals, "0").slice(0, decimals)}`.replace(/^0+(?=\d)/, "") || "0";
}

function fromAtomic(value: string | undefined, decimals: number) {
  if (!value) return "—";
  const padded = value.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  const fraction = padded.slice(-decimals).replace(/0+$/, "").slice(0, 8);
  return fraction ? `${whole}.${fraction}` : whole;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

export function NativeSolanaSwap({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [tokens, setTokens] = useState<SolanaToken[]>(SOLANA_CORE_FALLBACK);
  const [sell, setSell] = useState<SolanaToken>(SOLANA_CORE_FALLBACK[0]!);
  const [buy, setBuy] = useState<SolanaToken>(SOLANA_CORE_FALLBACK[1]!);
  const [amount, setAmount] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");
  const [order, setOrder] = useState<JupiterOrder | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/solana/tokens", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { tokens?: SolanaToken[] };
        if (response.ok && payload.tokens?.length) setTokens(payload.tokens);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) console.error("Unable to load Jupiter tokens", reason);
      })
      .finally(() => setLoadingTokens(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const query = tokenSearch.trim();
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/solana/tokens?query=${encodeURIComponent(query)}`, { signal: controller.signal, cache: "no-store" })
        .then(async (response) => {
          const payload = await response.json() as { tokens?: SolanaToken[] };
          if (!response.ok || !payload.tokens?.length) return;
          setTokens((current) => {
            const merged = new Map(current.map((token) => [token.mint, token]));
            for (const token of payload.tokens!) merged.set(token.mint, token);
            return [...merged.values()];
          });
        })
        .catch((reason) => {
          if (!controller.signal.aborted) console.error("Unable to search Jupiter tokens", reason);
        });
    }, 500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [tokenSearch]);

  useEffect(() => {
    setOrder(null);
    setError(null);
    const atomic = toAtomic(amount, sell.decimals);
    if (!atomic || !wallet.publicKey || sell.mint === buy.mint) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setQuoting(true);
      try {
        const response = await fetch("/api/solana/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputMint: sell.mint, outputMint: buy.mint, amount: atomic, taker: wallet.publicKey!.toBase58() }),
          signal: controller.signal,
        });
        const payload = await response.json() as JupiterOrder;
        if (!response.ok || payload.error) throw new Error(payload.error ?? "Jupiter quote failed");
        setOrder(payload);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Jupiter quote failed");
      } finally {
        if (!controller.signal.aborted) setQuoting(false);
      }
    }, 650);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [amount, buy.mint, sell.decimals, sell.mint, wallet.publicKey]);

  const output = useMemo(() => fromAtomic(order?.outAmount, buy.decimals), [buy.decimals, order?.outAmount]);

  function flip() {
    setSell(buy);
    setBuy(sell);
    setAmount("");
    setOrder(null);
  }

  async function executeSwap() {
    if (!order?.transaction || !order.requestId || !wallet.signTransaction || !order.feeReady) return;
    setSwapping(true);
    setError(null);
    setSignature(null);
    try {
      const bytes = Uint8Array.from(atob(order.transaction), (character) => character.charCodeAt(0));
      const transaction = VersionedTransaction.deserialize(bytes);
      const signed = await wallet.signTransaction(transaction);
      const response = await fetch("/api/solana/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction: bytesToBase64(signed.serialize()), requestId: order.requestId }),
      });
      const result = await response.json() as { signature?: string; status?: string; error?: string };
      if (!response.ok || result.error || result.status === "Failed") throw new Error(result.error ?? "Jupiter execution failed");
      if (!result.signature) throw new Error("Jupiter did not return a transaction signature");
      setSignature(result.signature);
      setAmount("");
      setOrder(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Solana swap failed");
    } finally {
      setSwapping(false);
    }
  }

  return (
    <div className="w-full max-w-[450px]">
      <div className="hoj-card space-y-3 rounded-[24px] p-3 sm:rounded-[26px] sm:p-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <TokenLogo symbol="SOL" logo="https://assets.coingecko.com/coins/images/4128/standard/solana.png" size="sm" />
            <div>
              <p className="text-sm font-semibold text-white/85">Solana</p>
              <p className="text-[10px] uppercase tracking-wider text-white/35">Jupiter routing</p>
            </div>
          </div>
          <button type="button" onClick={onBack} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 hover:text-white">Change network</button>
        </div>

        <div className="hoj-panel rounded-[22px] p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-white/50">Sell</span>
            <SolanaTokenSelect tokens={tokens} value={sell} onSearch={setTokenSearch} onChange={(token) => token.mint !== buy.mint && setSell(token)} />
          </div>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(event) => /^\d*(\.\d*)?$/.test(event.target.value) && setAmount(event.target.value)}
            placeholder="0"
            className="mt-4 w-full bg-transparent text-4xl font-semibold text-white outline-none placeholder:text-white/20"
          />
        </div>

        <button type="button" onClick={flip} className="mx-auto -my-5 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[#101012] bg-[#19191b] text-xl text-[#e7c45b]">↓</button>

        <div className="hoj-panel rounded-[22px] p-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-white/50">Buy</span>
            <SolanaTokenSelect tokens={tokens} value={buy} onSearch={setTokenSearch} onChange={(token) => token.mint !== sell.mint && setBuy(token)} />
          </div>
          <p className="mt-4 truncate text-4xl font-semibold text-white/85" title={output}>{quoting ? "…" : output}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-xs leading-5 text-white/45">
          <div className="flex justify-between gap-3"><span>Provider</span><span className="font-semibold text-white/65">Jupiter Ultra</span></div>
          <div className="mt-1 flex justify-between gap-3"><span>House fee</span><span className="font-semibold text-white/65">1%</span></div>
          <div className="mt-1 flex justify-between gap-3"><span>Tokens</span><span className="font-semibold text-white/65">{loadingTokens ? "Loading…" : `${tokens.length} verified`}</span></div>
        </div>

        {order && !order.feeReady && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-100/75">
            Live Jupiter quotes are active. Swap signing will unlock after the one-time Jupiter referral account is initialized for the House wallet.
          </div>
        )}
        {error && <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-xs text-rose-200">{error}</div>}
        {signature && (
          <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">Swap confirmed · View on Solscan ↗</a>
        )}

        {!wallet.connected ? (
          <button type="button" onClick={() => setVisible(true)} className="w-full rounded-2xl bg-[linear-gradient(135deg,#e7c45b,#b78312)] px-5 py-3.5 text-sm font-semibold text-black">Connect Solana wallet</button>
        ) : (
          <button
            type="button"
            onClick={executeSwap}
            disabled={!order?.transaction || !order.feeReady || swapping || quoting}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#e7c45b,#b78312)] px-5 py-3.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            {swapping ? "Signing and swapping…" : !order?.feeReady && order ? "Referral setup required" : "Swap with Jupiter"}
          </button>
        )}
        {wallet.connected && <p className="truncate px-2 text-center font-mono text-[10px] text-white/30">{wallet.publicKey?.toBase58()}</p>}
      </div>
    </div>
  );
}

function SolanaTokenSelect({ tokens, value, onChange, onSearch }: { tokens: SolanaToken[]; value: SolanaToken; onChange: (token: SolanaToken) => void; onSearch: (query: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const filteredTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tokens;
    return tokens.filter((token) =>
      token.symbol.toLowerCase().includes(normalized)
      || token.name.toLowerCase().includes(normalized)
      || token.mint.toLowerCase().includes(normalized),
    );
  }, [query, tokens]);

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
    <div ref={rootRef} className="relative w-[10.5rem] sm:w-[12rem]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-2 text-left text-white transition hover:border-[rgba(212,175,55,0.25)] focus:border-[rgba(212,175,55,0.45)] focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <TokenLogo symbol={value.symbol} logo={value.logo} size="xs" />
          <span className="truncate text-sm font-semibold">{value.symbol}</span>
        </span>
        <span className={`text-xs text-[rgba(212,175,55,0.9)] transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div role="listbox" className="absolute right-0 top-full z-50 mt-2 max-h-80 min-w-[17rem] overflow-y-auto rounded-2xl border border-white/10 bg-[#151517] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.6)]">
          <div className="sticky top-0 z-10 bg-[#151517] p-1">
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                onSearch(event.target.value);
              }}
              placeholder="Search name, symbol, or mint"
              className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[rgba(212,175,55,0.45)]"
            />
            <p className="px-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">{filteredTokens.length} tokens</p>
          </div>
          {filteredTokens.map((token) => {
            const selected = token.mint === value.mint;
            return (
              <button
                key={token.mint}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(token);
                  setOpen(false);
                  setQuery("");
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${selected ? "bg-[rgba(212,175,55,0.12)]" : "hover:bg-white/[0.055]"}`}
              >
                <TokenLogo symbol={token.symbol} logo={token.logo} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white/90">{token.symbol}</span>
                  <span className="block truncate text-[11px] text-white/40">{token.name}</span>
                </span>
                {selected && <span className="text-xs text-[#e7c45b]">✓</span>}
              </button>
            );
          })}
          {filteredTokens.length === 0 && <p className="px-3 py-6 text-center text-xs text-white/40">No verified tokens found.</p>}
        </div>
      )}
    </div>
  );
}
