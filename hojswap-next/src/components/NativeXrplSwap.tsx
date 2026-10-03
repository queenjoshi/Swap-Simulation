"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Transaction } from "xrpl";
import type { WalletManager } from "xrpl-connect";
import { TokenLogo } from "@/components/TokenLogo";
import { NativeSwapGuard, NativeSwapHeader } from "./NativeSwapChrome";
import type { SolanaNetworkOption } from "./NativeSolanaSwap";
import { XRPL_ASSETS, XRPL_HOUSE_WALLET, xrplAssetId, type XrplAsset } from "@/lib/xrpl-native";
import { getXrplWalletManager } from "@/lib/xrpl-wallet";
import { saveTransaction } from "@/lib/transactions";

type Quote = {
  receiveAmount: string;
  minimumReceive: string;
  houseFeeXrp: string;
  price: number;
  transaction: Transaction;
};

type AccountState = {
  xrpBalance: number;
  balances: Record<string, number>;
  trustlines: Record<string, boolean>;
  assetBalances: Record<string, number>;
  assetTrustlines: Record<string, boolean>;
};

export function NativeXrplSwap({ networks, onNetworkChange }: { networks: SolanaNetworkOption[]; onNetworkChange: (id: number) => void }) {
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
  const [manager, setManager] = useState<WalletManager | null>(null);
  const [selecting, setSelecting] = useState<"sell" | "buy" | null>(null);

  useEffect(() => {
    let active = true;
    void getXrplWalletManager().then((walletManager) => {
      if (active) setManager(walletManager);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to initialize XRP Ledger wallets");
    });
    return () => { active = false; };
  }, []);

  const refreshAccount = useCallback(async (walletAddress: string) => {
    const response = await fetch(`/api/xrpl/account?account=${encodeURIComponent(walletAddress)}`, { cache: "no-store" });
    const payload = await response.json() as AccountState & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Unable to load account");
    setAccount(payload);
  }, []);

  async function connect(walletId: string) {
    if (!manager) return;
    setBusy(true);
    setError(null);
    try {
      const result = await manager.connect(walletId, {
        network: "mainnet",
      });
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
        body: JSON.stringify({ account: address, sellAsset: sell, buyAsset: buy, amount, slippageBps: 50 }),
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
  }, [address, amount, buy, sell]);

  const needsTrustline = Boolean(buy.issuer && account && !account.assetTrustlines?.[xrplAssetId(buy)]);
  const sellBalance = sell.symbol === "XRP" ? account?.xrpBalance : account?.assetBalances?.[xrplAssetId(sell)];
  const selectedIssuedAsset = buy.issuer ? buy : sell.issuer ? sell : XRPL_ASSETS[1]!;
  const insufficient = sellBalance != null && Number(amount) > sellBalance;
  const primaryLabel = !address
    ? "Connect native XRP wallet"
    : needsTrustline
      ? `Enable ${buy.symbol} trust line`
      : busy
        ? status || `Waiting for ${walletName ?? "wallet"}…`
        : "Swap on XRP Ledger";

  async function enableTrustline() {
    if (!address || !manager || !buy.issuer) return;
    setBusy(true);
    setError(null);
    try {
      const response = await manager.signAndSubmit({
        TransactionType: "TrustSet",
        Account: address,
        LimitAmount: { currency: buy.currency, issuer: buy.issuer, value: "100000000000000" },
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
    if (!address || !quote || !manager) return;
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
      saveTransaction({
        hash: swapHash,
        chainId: -1,
        chain: "XRP Ledger",
        timestamp: Date.now(),
        status: "success",
        sellAmount: amount,
        sellToken: sell.symbol,
        buyAmount: quote.receiveAmount,
        buyToken: buy.symbol,
      });
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

  function chooseAsset(side: "sell" | "buy", asset: XrplAsset) {
    if (side === "sell") {
      setSell(asset);
      if (asset.symbol !== "XRP") setBuy(XRPL_ASSETS[0]!);
      else if (buy.symbol === "XRP") setBuy(XRPL_ASSETS[1]!);
    } else {
      setBuy(asset);
      if (asset.symbol !== "XRP") setSell(XRPL_ASSETS[0]!);
      else if (sell.symbol === "XRP") setSell(XRPL_ASSETS[1]!);
    }
    setSelecting(null);
    setQuote(null);
    setError(null);
  }

  return (
    <div className="w-full max-w-[450px]">
      <div className="hoj-card space-y-2 rounded-[24px] p-2 sm:rounded-[26px] sm:p-2.5">
        <NativeSwapHeader networks={networks} activeId={-1} onNetworkChange={onNetworkChange} disabled={busy} />

        {address && (
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/50">
            <span className="block truncate font-mono">{address}</span>
            <span>{account ? `${account.xrpBalance.toFixed(6)} XRP · ${(account.assetBalances?.[xrplAssetId(selectedIssuedAsset)] ?? 0).toLocaleString()} ${selectedIssuedAsset.symbol}` : "Loading balances…"}</span>
          </div>
        )}

        <div className="hoj-panel rounded-[22px] p-3.5 sm:rounded-[24px] sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-3 sm:mb-2.5">
            <span className="text-[15px] font-semibold text-white/55">Sell</span>
            <AssetButton asset={sell} disabled={busy} expanded={selecting === "sell"} label="Sell asset" onClick={() => setSelecting(selecting === "sell" ? null : "sell")} />
          </div>
            <input
              aria-label="Sell amount"
              disabled={busy}
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value.replace(/[^0-9.]/g, ""));
                setQuote(null);
              }}
              placeholder="0.0"
              className="hoj-input w-full min-w-0 bg-transparent text-[2.65rem] font-semibold leading-none text-white outline-none placeholder:text-white/25 sm:text-5xl"
            />
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Choose percentage of issued-token balance">
            {[25, 50, 75, 100].map(percent => <button key={percent} type="button" disabled={busy || !sell.issuer || !sellBalance || sellBalance <= 0}
              title={!sell.issuer ? "XRP percentage controls require a reserve-aware spendable balance" : undefined}
              onClick={() => { setAmount(((sellBalance ?? 0) * percent / 100).toLocaleString("en-US", { useGrouping: false, maximumSignificantDigits: 15 })); setQuote(null); }}
              className="min-h-9 rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-1.5 text-[11px] font-semibold tabular-nums text-white/60 transition hover:border-[rgba(212,175,55,0.45)] hover:bg-[rgba(212,175,55,0.1)] disabled:cursor-not-allowed disabled:opacity-30 sm:px-2 sm:text-xs">{percent}%</button>)}
          </div>
          {sellBalance != null && <p className="mt-2 text-[11px] text-white/45">Balance: {sellBalance.toLocaleString()} {sell.symbol}</p>}
        </div>


        <button type="button" disabled={busy} onClick={flip} aria-label="Flip XRP tokens" className="relative z-10 mx-auto !-my-2.5 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[#101012] bg-[#19191b] text-xl text-[rgba(212,175,55,0.95)] shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition hover:bg-[#202022] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">↓</button>

        <div className="hoj-panel rounded-[22px] p-3.5 pt-6 sm:rounded-[24px] sm:p-4 sm:pt-7">
          <div className="mb-2 flex items-start justify-between gap-3 sm:mb-2.5">
            <span className="text-[15px] font-semibold text-white/55">Buy</span>
            <AssetButton asset={buy} disabled={busy} expanded={selecting === "buy"} label="Buy asset" onClick={() => setSelecting(selecting === "buy" ? null : "buy")} />
          </div>
          <div className="truncate text-[2.25rem] font-semibold leading-none tabular-nums text-white/90 sm:text-[2.65rem]">{quote?.receiveAmount ?? "—"}</div>
          <p className="mt-1 truncate text-xs text-white/45">{quote ? `Minimum: ${quote.minimumReceive} ${buy.symbol}` : "Connect a wallet and enter an amount"}</p>
          {account && <p className="mt-2 text-[11px] text-white/45">Balance: {(buy.issuer ? account.assetBalances?.[xrplAssetId(buy)] ?? 0 : account.xrpBalance).toLocaleString()} {buy.symbol}</p>}
        </div>


        <div className="flex items-center justify-between px-1 text-[11px] text-white/45"><span>House fee · 1%</span><span className="font-mono">{quote ? `${quote.houseFeeXrp} XRP` : "—"}</span></div>
        <NativeSwapGuard>
          {quote ? <p>Quoted minimum: {quote.minimumReceive} {buy.symbol} · 0.5% slippage.</p> : <p>Connect a native XRP wallet to quote XRPL DEX and AMM liquidity.</p>}
          <p>Approval: native XRPL signing; no ERC-20 allowance or EVM simulation.</p>
          <p>The swap is validated first. The 1% House fee is requested separately afterward.</p>
        </NativeSwapGuard>
        <details className="group hoj-panel rounded-2xl">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/55">Show more <span>▾</span></summary>
          <div className="space-y-3 border-t border-white/10 px-4 py-3 text-[11px] leading-5 text-white/45">
            <div className="flex justify-between"><span>Provider</span><span>XRPL DEX / AMM</span></div>
            <div className="flex justify-between"><span>Slippage tolerance</span><span>0.5%</span></div>
            <p>Token identity includes its issuer address. Receiving issued assets requires a trust line.</p>
            <p>Keep XRP for account reserves, trust lines, and fees. XRP percentage controls remain disabled until a reserve-aware spendable balance is available.</p>
          </div>
        </details>
        {status && <p role="status" className="px-1 text-xs text-white/55">{status}</p>}

        {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {hash && <a href={`https://livenet.xrpl.org/transactions/${hash}`} target="_blank" rel="noopener noreferrer" className="block truncate text-center text-xs text-[rgba(212,175,55,0.9)] underline">View XRPL transaction</a>}

        {showWallets && !address && (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
            {manager?.wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => void connect(wallet.id)}
                disabled={busy}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-white/80 hover:border-amber-300/40 hover:bg-white/5 disabled:opacity-50"
              >
                {wallet.icon ? <Image src={wallet.icon} alt="" width={28} height={28} unoptimized className="h-7 w-7 rounded-lg" /> : <span className="h-7 w-7 rounded-lg bg-white/10" />}
                <span>{wallet.id === "walletconnect" ? "WalletConnect (XRPL only)" : wallet.name}</span>
              </button>
            ))}
            <p className="col-span-2 px-2 py-1 text-[10px] leading-4 text-white/40">
              Trust Wallet can hold XRP, but does not currently expose the XRPL transaction-signing methods this swap requires through WalletConnect. Use Xaman or another wallet with XRPL dApp signing.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={!address ? () => setShowWallets((visible) => !visible) : needsTrustline ? enableTrustline : swap}
          disabled={!manager || busy || Boolean(address && !needsTrustline && (!quote || insufficient))}
          className="min-h-12 w-full rounded-[20px] bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
        >
          {!manager ? "Loading XRP wallets…" : insufficient ? `Insufficient ${sell.symbol}` : primaryLabel}
        </button>
      </div>
      {selecting && <AssetDialog selected={selecting === "sell" ? sell : buy} onClose={() => setSelecting(null)} onChoose={asset => chooseAsset(selecting, asset)} />}
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

function AssetButton({ asset, onClick, disabled, expanded, label }: { asset: XrplAsset; onClick: () => void; disabled?: boolean; expanded: boolean; label: string }) {
  return (
    <button type="button" disabled={disabled} aria-label={label} aria-haspopup="listbox" aria-expanded={expanded} onClick={onClick} className="flex w-[8.5rem] shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-2 text-left transition hover:border-[rgba(212,175,55,0.25)] focus:border-[rgba(212,175,55,0.45)] sm:w-[9.25rem]">
      <TokenLogo symbol={asset.symbol} logo={asset.logo} size="xs" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{asset.symbol}</span>
      <span className="text-xs text-[rgba(212,175,55,0.9)]">▾</span>
    </button>
  );
}

function AssetSelector({ selected, onChoose }: { selected: XrplAsset; onChoose: (asset: XrplAsset) => void }) {
  const [registryTokens, setRegistryTokens] = useState<XrplAsset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [registryOffset, setRegistryOffset] = useState(0);
  const [registryError, setRegistryError] = useState<string | null>(null);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setRegistryError(null);
    try {
      const response = await fetch(`/api/xrpl/tokens?offset=${registryOffset}&limit=50`, { cache: "no-store" });
      const payload = await response.json() as { tokens?: XrplAsset[]; nextOffset?: number; hasMore?: boolean };
      if (!response.ok) throw new Error("Registry unavailable");
      const incoming = payload.tokens ?? [];
      setRegistryTokens((current) => {
        const seen = new Set(current.map(xrplAssetId));
        return [...current, ...incoming.filter((asset) => !seen.has(xrplAssetId(asset)))];
      });
      setRegistryOffset(Number(payload.nextOffset ?? registryOffset + 50));
      setHasMore(Boolean(payload.hasMore));
    } catch {
      setRegistryError("The token registry is unavailable. Curated assets are still shown.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadMore(); }, []);

  const assets = useMemo(() => {
    const seen = new Set<string>();
    const combined = [XRPL_ASSETS[0]!, ...XRPL_ASSETS.slice(1), ...registryTokens].filter((asset) => {
      const id = xrplAssetId(asset);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const ordered = combined.sort((a, b) =>
      a.symbol.localeCompare(b.symbol, undefined, { sensitivity: "base" })
      || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    const needle = query.trim().toLowerCase();
    if (!needle) return ordered;
    return ordered.filter((asset) =>
      asset.symbol.toLowerCase().includes(needle)
      || asset.name.toLowerCase().includes(needle)
      || asset.issuer?.toLowerCase().includes(needle)
      || asset.currency.toLowerCase().includes(needle),
    );
  }, [query, registryTokens]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-2">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name, ticker, issuer or currency"
        className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-base text-white outline-none placeholder:text-white/30 focus:border-amber-300/40 sm:text-sm"
      />
      <div role="listbox" aria-label="XRP assets" className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto">
      {assets.map((asset) => (
        <button
          key={xrplAssetId(asset)}
          type="button"
          role="option"
          aria-selected={xrplAssetId(selected) === xrplAssetId(asset)}
          onClick={() => onChoose(asset)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/8 ${xrplAssetId(selected) === xrplAssetId(asset) ? "bg-amber-300/10" : ""}`}
        >
          <TokenLogo symbol={asset.symbol} logo={asset.logo} size="sm" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">{asset.symbol}</span>
            <span className="block truncate text-[11px] text-white/45">{asset.name}</span>
            {asset.issuer && <span className="block max-w-44 truncate font-mono text-[9px] text-white/25">{asset.issuer}</span>}
          </span>
          {asset.verified && <span className="ml-auto text-[9px] font-semibold text-emerald-300/80">VERIFIED</span>}
        </button>
      ))}
      </div>
      {registryError && <p role="status" className="px-2 py-2 text-xs text-amber-200">{registryError}</p>}
      {hasMore && !query && <button type="button" onClick={() => void loadMore()} disabled={loading} className="mt-2 w-full rounded-xl border border-white/10 px-3 py-2 text-xs text-white/55 hover:border-amber-300/35 disabled:opacity-50">{loading ? "Loading XRPL tokens…" : "Load more XRPL tokens"}</button>}
      <p className="px-2 py-2 text-[10px] leading-4 text-white/35">Only curated assets and registry-verified issuers are shown. Always confirm the issuer address; swaps remain limited to pairs with live XRP liquidity.</p>
    </div>
  );
}

function AssetDialog({ selected, onChoose, onClose }: { selected: XrplAsset; onChoose: (asset: XrplAsset) => void; onClose: () => void }) {
  useEffect(() => {
    function escape(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);
  return createPortal(<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <div role="dialog" aria-modal="true" aria-label="Select XRP token" onMouseDown={event => event.stopPropagation()} className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[24px] border border-white/10 bg-[#151517] p-3 shadow-2xl">
      <div className="mb-3 flex items-center justify-between px-1"><span className="text-sm font-semibold text-white/90">Select a token · XRP Ledger</span><button type="button" aria-label="Close token selector" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/55">×</button></div>
      <AssetSelector selected={selected} onChoose={onChoose} />
    </div>
  </div>, document.body);
}
