"use client";

import { useCallback, useEffect, useState } from "react";
import { getAddress, getNetwork, isInstalled, submitTransaction, type SubmitTransactionRequest } from "@gemwallet/api";
import { TokenLogo } from "@/components/TokenLogo";
import { RLUSD_CURRENCY, RLUSD_ISSUER, XRPL_ASSETS, type XrplAsset } from "@/lib/xrpl-native";

type Quote = {
  receiveAmount: string;
  minimumReceive: string;
  price: number;
  transaction: SubmitTransactionRequest["transaction"];
};

type AccountState = {
  xrpBalance: number;
  rlusdBalance: number;
  hasRlusdTrustline: boolean;
};

export function NativeXrplSwap({ onBack }: { onBack: () => void }) {
  const [address, setAddress] = useState<string | null>(null);
  const [sell, setSell] = useState<XrplAsset>(XRPL_ASSETS[0]!);
  const [buy, setBuy] = useState<XrplAsset>(XRPL_ASSETS[1]!);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const refreshAccount = useCallback(async (walletAddress: string) => {
    const response = await fetch(`/api/xrpl/account?account=${encodeURIComponent(walletAddress)}`, { cache: "no-store" });
    const payload = await response.json() as AccountState & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Unable to load account");
    setAccount(payload);
  }, []);

  async function requireMainnet() {
    const network = await getNetwork();
    if (network.result?.network !== "Mainnet") throw new Error("Switch GemWallet to XRPL Mainnet");
  }

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const installed = await isInstalled();
      if (!installed.result?.isInstalled) {
        window.open("https://gemwallet.app/", "_blank", "noopener,noreferrer");
        throw new Error("Install GemWallet, then connect again");
      }
      await requireMainnet();
      const result = await getAddress();
      if (!result.result?.address) throw new Error("GemWallet connection was rejected");
      setAddress(result.result.address);
      await refreshAccount(result.result.address);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to connect GemWallet");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!address || !amount || Number(amount) <= 0) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("Finding native XRPL liquidity…");
      void fetch("/api/xrpl/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: address, sell: sell.symbol, buy: buy.symbol, amount, slippageBps: 50 }),
        signal: controller.signal,
      }).then(async (response) => {
        const payload = await response.json() as Quote & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Quote unavailable");
        setQuote(payload);
        setError(null);
      }).catch((cause) => {
        if (!controller.signal.aborted) {
          setQuote(null);
          setError(cause instanceof Error ? cause.message : "Quote unavailable");
        }
      }).finally(() => setStatus(""));
    }, 500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [address, amount, buy.symbol, sell.symbol]);

  const needsTrustline = buy.symbol === "RLUSD" && account && !account.hasRlusdTrustline;
  const sellBalance = sell.symbol === "XRP" ? account?.xrpBalance : account?.rlusdBalance;
  const insufficient = sellBalance != null && Number(amount) > sellBalance;
  const primaryLabel = !address
    ? "Connect native XRP wallet"
    : needsTrustline
      ? "Enable RLUSD trust line"
      : busy
        ? status || "Waiting for GemWallet…"
        : "Swap on XRP Ledger";

  async function enableTrustline() {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      await requireMainnet();
      const response = await submitTransaction({ transaction: {
        TransactionType: "TrustSet",
        Account: address,
        LimitAmount: { currency: RLUSD_CURRENCY, issuer: RLUSD_ISSUER, value: "1000000000" },
      } });
      if (!response.result?.hash) throw new Error("Trust-line transaction was rejected");
      setHash(response.result.hash);
      await refreshAccount(address);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create trust line");
    } finally {
      setBusy(false);
    }
  }

  async function swap() {
    if (!address || !quote) return;
    setBusy(true);
    setError(null);
    setStatus("Confirm the native XRPL offer in GemWallet…");
    try {
      await requireMainnet();
      const response = await submitTransaction({ transaction: quote.transaction });
      if (!response.result?.hash) throw new Error("Swap transaction was rejected");
      setHash(response.result.hash);
      setAmount("");
      setQuote(null);
      await refreshAccount(address);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Native XRPL swap failed");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  function flip() {
    setSell(buy);
    setBuy(sell);
    setQuote(null);
  }

  return (
    <div className="w-full max-w-[480px]">
      <div className="hoj-card space-y-3 rounded-[28px] p-3">
        <div className="flex items-center justify-between px-1 py-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Native swap</p>
            <p className="text-sm font-semibold text-white/80">XRP Ledger</p>
          </div>
          <button type="button" onClick={onBack} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white">
            Other networks
          </button>
        </div>

        {address && (
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/50">
            <span className="block truncate font-mono">{address}</span>
            <span>{account ? `${account.xrpBalance.toFixed(6)} XRP · ${account.rlusdBalance.toFixed(2)} RLUSD` : "Loading balances…"}</span>
          </div>
        )}

        <div className="hoj-panel rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value.replace(/[^0-9.]/g, ""));
                setQuote(null);
              }}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-4xl font-semibold text-white outline-none placeholder:text-white/20"
            />
            <AssetButton asset={sell} />
          </div>
          {sellBalance != null && <p className="mt-2 text-xs text-white/40">Balance: {sellBalance.toLocaleString()} {sell.symbol}</p>}
        </div>

        <button type="button" onClick={flip} className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#19191b] text-[rgba(212,175,55,0.95)]">↓</button>

        <div className="hoj-panel rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-3xl font-semibold text-white/85">{quote?.receiveAmount ?? "—"}</span>
            <AssetButton asset={buy} />
          </div>
          {quote && <p className="mt-2 text-xs text-white/40">Minimum received: {quote.minimumReceive} {buy.symbol} · 0.5% slippage</p>}
        </div>

        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-xs leading-5 text-amber-100/65">
          Uses native XRPL DEX and AMM liquidity. Token identity includes its issuer address. This route does not use Hammy or an EVM contract.
        </div>

        {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {hash && <a href={`https://livenet.xrpl.org/transactions/${hash}`} target="_blank" rel="noopener noreferrer" className="block truncate text-center text-xs text-[rgba(212,175,55,0.9)] underline">View XRPL transaction</a>}

        <button
          type="button"
          onClick={!address ? connect : needsTrustline ? enableTrustline : swap}
          disabled={busy || Boolean(address && !needsTrustline && (!quote || insufficient))}
          className="w-full rounded-[22px] bg-[rgba(255,222,85,0.98)] px-4 py-4 text-base font-bold text-black disabled:opacity-50"
        >
          {insufficient ? `Insufficient ${sell.symbol}` : primaryLabel}
        </button>
      </div>
    </div>
  );
}

function AssetButton({ asset }: { asset: XrplAsset }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2">
      <TokenLogo symbol={asset.symbol} logo={asset.logo} size="xs" />
      <span className="text-sm font-semibold text-white">{asset.symbol}</span>
    </div>
  );
}
