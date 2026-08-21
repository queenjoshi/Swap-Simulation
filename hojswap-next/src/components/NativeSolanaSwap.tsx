"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { TokenLogo } from "@/components/TokenLogo";
import { SOLANA_CORE_FALLBACK, SOL_MINT, type SolanaToken } from "@/lib/solana";
import { saveTransaction } from "@/lib/transactions";

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

export type SolanaNetworkOption = {
  id: number;
  name: string;
  ticker: string;
  mode: string;
  logo?: string;
};

export function NativeSolanaSwap({ networks, onNetworkChange }: { networks: SolanaNetworkOption[]; onNetworkChange: (chainId: number) => void }) {
  const wallet = useWallet();
  const { connection } = useConnection();
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
  const [networkOpen, setNetworkOpen] = useState(false);
  const [balances, setBalances] = useState<Record<string, bigint>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [slippageBps, setSlippageBps] = useState<number | null>(null);

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
    if (!wallet.publicKey) {
      setBalances({});
      return;
    }
    let cancelled = false;
    setLoadingBalances(true);

    async function fetchBalance(token: SolanaToken) {
      if (!wallet.publicKey) return 0n;
      if (token.mint === SOL_MINT) return BigInt(await connection.getBalance(wallet.publicKey, "confirmed"));
      const accounts = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey,
        { mint: new PublicKey(token.mint) },
        "confirmed",
      );
      return accounts.value.reduce((total, account) => {
        const info = account.account.data.parsed.info as { tokenAmount?: { amount?: string } };
        return total + BigInt(info.tokenAmount?.amount ?? "0");
      }, 0n);
    }

    Promise.all([fetchBalance(sell), fetchBalance(buy)])
      .then(([sellBalance, buyBalance]) => {
        if (!cancelled) setBalances((current) => ({ ...current, [sell.mint]: sellBalance, [buy.mint]: buyBalance }));
      })
      .catch((reason) => {
        if (!cancelled) console.error("Unable to load Solana balances", reason);
      })
      .finally(() => {
        if (!cancelled) setLoadingBalances(false);
      });
    return () => { cancelled = true; };
  }, [buy, connection, sell, signature, wallet.publicKey]);

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
          body: JSON.stringify({
            inputMint: sell.mint,
            outputMint: buy.mint,
            amount: atomic,
            taker: wallet.publicKey!.toBase58(),
            ...(slippageBps == null ? {} : { slippageBps }),
          }),
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
  }, [amount, buy.mint, sell.decimals, sell.mint, slippageBps, wallet.publicKey]);

  const output = useMemo(() => fromAtomic(order?.outAmount, buy.decimals), [buy.decimals, order?.outAmount]);
  const sellBalance = balances[sell.mint];
  const buyBalance = balances[buy.mint];
  const enteredAtomic = toAtomic(amount, sell.decimals);
  const insufficientBalance = enteredAtomic != null && sellBalance != null && BigInt(enteredAtomic) > sellBalance;

  function applyBalancePercentage(percent: number) {
    if (sellBalance == null || sellBalance === 0n) return;
    let selected = (sellBalance * BigInt(percent)) / 100n;
    if (percent === 100 && sell.mint === SOL_MINT) {
      const gasReserve = 5_000_000n;
      selected = selected > gasReserve ? selected - gasReserve : 0n;
    }
    setAmount(fromAtomic(selected.toString(), sell.decimals).replace("—", ""));
  }

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
      saveTransaction({
        hash: result.signature,
        chainId: -2,
        chain: "Solana",
        timestamp: Date.now(),
        status: "success",
        sellAmount: amount,
        sellToken: sell.symbol,
        buyAmount: output,
        buyToken: buy.symbol,
      });
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
      <div className="hoj-card space-y-2 rounded-[24px] p-2.5 sm:rounded-[26px]">
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Trade</p>
            <p className="truncate text-sm font-semibold text-white/80">Solana</p>
          </div>
          <button
            type="button"
            onClick={() => setNetworkOpen(true)}
            className="flex min-w-[8.75rem] items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-2 text-left transition hover:border-[rgba(212,175,55,0.3)] focus:border-[rgba(212,175,55,0.55)] focus:outline-none"
            aria-haspopup="dialog"
          >
            <span className="flex min-w-0 items-center gap-2">
              <TokenLogo symbol="SOL" logo="https://assets.coingecko.com/coins/images/4128/standard/solana.png" size="xs" />
              <span className="truncate text-xs font-semibold text-white/80">Solana</span>
            </span>
            <span className="text-xs text-[rgba(212,175,55,0.9)]">▾</span>
          </button>
        </div>

        <div className="hoj-panel rounded-[22px] p-3.5 sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-white/50">Sell</span>
            <SolanaTokenSelect tokens={tokens} value={sell} onSearch={setTokenSearch} onChange={(token) => token.mint !== buy.mint && setSell(token)} />
          </div>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(event) => /^\d*(\.\d*)?$/.test(event.target.value) && setAmount(event.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-[2.65rem] font-semibold leading-none text-white outline-none placeholder:text-white/20 sm:text-5xl"
          />
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Choose percentage of Solana balance to swap">
            {[25, 50, 75, 100].map((percent) => (
              <button key={percent} type="button" onClick={() => applyBalancePercentage(percent)} disabled={!wallet.connected || sellBalance == null || sellBalance === 0n} className="min-h-9 rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-1.5 text-[11px] font-semibold tabular-nums text-white/60 transition hover:border-[rgba(212,175,55,0.45)] hover:bg-[rgba(212,175,55,0.1)] hover:text-[rgba(255,222,85,0.95)] disabled:cursor-not-allowed disabled:opacity-30 sm:text-xs">{percent}%</button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/38">
            <span>Balance</span>
            <span className="font-mono tabular-nums">{!wallet.connected ? "Connect wallet" : loadingBalances && sellBalance == null ? "Loading…" : `${fromAtomic((sellBalance ?? 0n).toString(), sell.decimals)} ${sell.symbol}`}</span>
          </div>
          {insufficientBalance && <p className="mt-1 text-right text-[10px] text-rose-300/85">Insufficient {sell.symbol} balance</p>}
        </div>

        <button type="button" onClick={flip} className="relative z-20 mx-auto -my-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[#0d0d0f] bg-[#202023] text-xl text-[#f0cc61] opacity-100 shadow-[0_12px_24px_rgba(0,0,0,0.65)] transition hover:bg-[#29292c] sm:h-11 sm:w-11 sm:rounded-2xl" aria-label="Flip Solana tokens">↓</button>

        <div className="hoj-panel rounded-[22px] p-3.5 pt-6 sm:p-4 sm:pt-7">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-white/50">Buy</span>
            <SolanaTokenSelect tokens={tokens} value={buy} onSearch={setTokenSearch} onChange={(token) => token.mint !== sell.mint && setBuy(token)} />
          </div>
          <p className="mt-3 truncate text-[2.25rem] font-semibold leading-none text-white/85 sm:text-[2.65rem]" title={output}>{quoting ? "…" : output}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/38">
            <span>Balance</span>
            <span className="font-mono tabular-nums">{!wallet.connected ? "Connect wallet" : loadingBalances && buyBalance == null ? "Loading…" : `${fromAtomic((buyBalance ?? 0n).toString(), buy.decimals)} ${buy.symbol}`}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-xs leading-5 text-white/45">
          <div className="flex justify-between gap-3"><span>Provider</span><span className="font-semibold text-white/65">Jupiter Ultra</span></div>
          <div className="mt-1 flex justify-between gap-3"><span>House fee</span><span className="font-semibold text-white/65">1%</span></div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span>Slippage</span>
            <div className="flex gap-1">
              {([{ label: "Auto", value: null }, { label: "0.5%", value: 50 }, { label: "1%", value: 100 }] as const).map((option) => (
                <button key={option.label} type="button" onClick={() => setSlippageBps(option.value)} className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition ${slippageBps === option.value ? "border-[rgba(212,175,55,0.45)] bg-[rgba(212,175,55,0.12)] text-[#e7c45b]" : "border-white/8 text-white/40 hover:text-white/65"}`}>{option.label}</button>
              ))}
            </div>
          </div>
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
          <div className="space-y-2.5">
            <button type="button" onClick={() => setVisible(true)} className="w-full rounded-2xl bg-[linear-gradient(135deg,#e7c45b,#b78312)] px-5 py-3.5 text-sm font-semibold text-black">Connect Solana wallet</button>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-[10px] text-white/35">
              <span>Phantom</span><span aria-hidden="true">·</span>
              <span>Solflare</span><span aria-hidden="true">·</span>
              <span>Backpack</span><span aria-hidden="true">·</span>
              <span>Android mobile wallets</span>
            </div>
            <p className="px-4 text-center text-[10px] leading-4 text-white/28">Works with installed desktop extensions, iOS and Android wallet apps, wallet in-app browsers, phones, and tablets.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={executeSwap}
            disabled={!order?.transaction || !order.feeReady || swapping || quoting || insufficientBalance}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#e7c45b,#b78312)] px-5 py-3.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            {swapping ? "Signing and swapping…" : !order?.feeReady && order ? "Referral setup required" : "Swap with Jupiter"}
          </button>
        )}
        {wallet.connected && <p className="truncate px-2 text-center font-mono text-[10px] text-white/30">{wallet.publicKey?.toBase58()}</p>}
      </div>
      {networkOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setNetworkOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Select network" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-[#111113] shadow-[0_28px_90px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-white/90">Select network</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Swap and token networks</p>
              </div>
              <button type="button" onClick={() => setNetworkOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-white/55 hover:text-white" aria-label="Close network selector">×</button>
            </div>
            <div className="max-h-[min(68vh,32rem)] overflow-y-auto p-2">
              {networks.map((network) => {
                const selected = network.id === -2;
                return (
                  <button key={network.id} type="button" onClick={() => { setNetworkOpen(false); onNetworkChange(network.id); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${selected ? "bg-[rgba(212,175,55,0.14)]" : "hover:bg-white/[0.06]"}`}>
                    <TokenLogo symbol={network.ticker} logo={network.logo} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white/88">{network.name}</span>
                      <span className="block text-[10px] uppercase tracking-wider text-white/35">{network.mode}</span>
                    </span>
                    {selected && <span className="text-xs text-[#e7c45b]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function SolanaTokenSelect({ tokens, value, onChange, onSearch }: { tokens: SolanaToken[]; value: SolanaToken; onChange: (token: SolanaToken) => void; onSearch: (query: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative w-[9.5rem] sm:w-[10.5rem]">
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

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Select Solana token" onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[min(78vh,38rem)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#151517] shadow-[0_28px_90px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-white/90">Select a token</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Jupiter verified · Solana</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-white/55 hover:text-white" aria-label="Close token selector">×</button>
            </div>
            <div className="border-b border-white/8 bg-[#151517] p-3">
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
            <div role="listbox" className="min-h-0 flex-1 overflow-y-auto p-2">
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
          </div>
        </div>
      , document.body)}
    </div>
  );
}
