"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Transaction } from "xrpl";
import { TokenLogo } from "@/components/TokenLogo";
import { RLUSD_CURRENCY, RLUSD_ISSUER, XRPL_ASSETS, XRPL_HOUSE_WALLET, type XrplAsset } from "@/lib/xrpl-native";
import { getXrplWalletManager } from "@/lib/xrpl-wallet";

type Quote = {
  receiveAmount: string;
  minimumReceive: string;
  houseFeeXrp: string;
  price: number;
  transaction: Transaction;
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
  const [showWallets, setShowWallets] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);
  const manager = useMemo(() => getXrplWalletManager(), []);

  const refreshAccount = useCallback(async (walletAddress: string) => {
    const response = await fetch(`/api/xrpl/account?account=${encodeURIComponent(walletAddress)}`, { cache: "no-store" });
    const payload = await response.json() as AccountState & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Unable to load account");
    setAccount(payload);
  }, []);

  async function connect(walletId: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await manager.connect(walletId, { network: "mainnet" });
      setAddress(result.address);
      setWalletName(manager.wallet?.name ?? null);
      setShowWallets(false);
      await refreshAccount(result.address);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to connect XRP Ledger wallet");
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
        ? status || `Waiting for ${walletName ?? "wallet"}…`
        : "Swap on XRP Ledger";

  async function enableTrustline() {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      const response = await manager.signAndSubmit({
        TransactionType: "TrustSet",
        Account: address,
        LimitAmount: { currency: RLUSD_CURRENCY, issuer: RLUSD_ISSUER, value: "1000000000" },
      });
      if (!response.hash) throw new Error("Trust-line transaction was rejected");
      setHash(response.hash);
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
    setStatus(`Confirm the native XRPL offer in ${walletName ?? "your wallet"}…`);
    try {
      const response = await manager.signAndSubmit(quote.transaction);
      if (!response.hash) throw new Error("Swap transaction was rejected");
      const swapHash = response.hash;
      setHash(swapHash);
      setStatus("Waiting for the native swap to validate…");
      await waitForValidatedSwap(swapHash);
      setStatus(`Confirm the 1% House fee in ${walletName ?? "your wallet"}…`);
      const feeDrops = String(Math.floor(Number(quote.houseFeeXrp) * 1_000_000));
      if (feeDrops === "0") throw new Error("Trade amount is too small for the 1% XRP fee");
      const feeResponse = await manager.signAndSubmit({
        TransactionType: "Payment",
        Account: address,
        Destination: XRPL_HOUSE_WALLET,
        Amount: feeDrops,
        Memos: [{ Memo: { MemoData: "484F4A205377617020486F75736520466565", MemoType: "486F757365466565" } }],
      });
      if (!feeResponse.hash) throw new Error("Swap succeeded, but the House fee was not approved");
      setHash(feeResponse.hash);
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
          {quote && <p className="mt-1 text-xs text-white/40">House fee: {quote.houseFeeXrp} XRP (1%, requested after swap validation)</p>}
        </div>

        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-xs leading-5 text-amber-100/65">
          Uses native XRPL DEX and AMM liquidity. Token identity includes its issuer address. This route does not use Hammy or an EVM contract.
        </div>

        {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {hash && <a href={`https://livenet.xrpl.org/transactions/${hash}`} target="_blank" rel="noopener noreferrer" className="block truncate text-center text-xs text-[rgba(212,175,55,0.9)] underline">View XRPL transaction</a>}

        {showWallets && !address && (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
            {manager.wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => void connect(wallet.id)}
                disabled={busy}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-white/80 hover:border-amber-300/40 hover:bg-white/5 disabled:opacity-50"
              >
                {wallet.icon ? <Image src={wallet.icon} alt="" width={28} height={28} unoptimized className="h-7 w-7 rounded-lg" /> : <span className="h-7 w-7 rounded-lg bg-white/10" />}
                <span>{wallet.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={!address ? () => setShowWallets((visible) => !visible) : needsTrustline ? enableTrustline : swap}
          disabled={busy || Boolean(address && !needsTrustline && (!quote || insufficient))}
          className="w-full rounded-[22px] bg-[rgba(255,222,85,0.98)] px-4 py-4 text-base font-bold text-black disabled:opacity-50"
        >
          {insufficient ? `Insufficient ${sell.symbol}` : primaryLabel}
        </button>
      </div>
    </div>
  );
}

async function waitForValidatedSwap(hash: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`/api/xrpl/transaction?hash=${encodeURIComponent(hash)}`, { cache: "no-store" });
    if (response.ok) {
      const payload = await response.json() as { validated?: boolean; result?: string };
      if (payload.validated) {
        if (payload.result !== "tesSUCCESS") throw new Error(`Native XRPL swap failed: ${payload.result ?? "unknown result"}`);
        return;
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, 2_000));
  }
  throw new Error("Swap validation timed out; no House fee was charged")
}

function AssetButton({ asset }: { asset: XrplAsset }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2">
      <TokenLogo symbol={asset.symbol} logo={asset.logo} size="xs" />
      <span className="text-sm font-semibold text-white">{asset.symbol}</span>
    </div>
  );
}
