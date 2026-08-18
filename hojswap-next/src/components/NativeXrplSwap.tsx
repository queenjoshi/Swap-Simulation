"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Transaction } from "xrpl";
import type { WalletManager } from "xrpl-connect";
import { TokenLogo } from "@/components/TokenLogo";
import { XRPL_ASSETS, XRPL_HOUSE_WALLET, xrplAssetId, type XrplAsset } from "@/lib/xrpl-native";
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
  balances: Record<string, number>;
  trustlines: Record<string, boolean>;
  assetBalances: Record<string, number>;
  assetTrustlines: Record<string, boolean>;
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
            <span>{account ? `${account.xrpBalance.toFixed(6)} XRP · ${(account.assetBalances?.[xrplAssetId(selectedIssuedAsset)] ?? 0).toLocaleString()} ${selectedIssuedAsset.symbol}` : "Loading balances…"}</span>
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
            <AssetButton asset={sell} onClick={() => setSelecting(selecting === "sell" ? null : "sell")} />
          </div>
          {sellBalance != null && <p className="mt-2 text-xs text-white/40">Balance: {sellBalance.toLocaleString()} {sell.symbol}</p>}
        </div>

        {selecting === "sell" && <AssetSelector selected={sell} onChoose={(asset) => chooseAsset("sell", asset)} />}

        <button type="button" onClick={flip} className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#19191b] text-[rgba(212,175,55,0.95)]">↓</button>

        <div className="hoj-panel rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-3xl font-semibold text-white/85">{quote?.receiveAmount ?? "—"}</span>
            <AssetButton asset={buy} onClick={() => setSelecting(selecting === "buy" ? null : "buy")} />
          </div>
          {quote && <p className="mt-2 text-xs text-white/40">Minimum received: {quote.minimumReceive} {buy.symbol} · 0.5% slippage</p>}
          {quote && <p className="mt-1 text-xs text-white/40">House fee: {quote.houseFeeXrp} XRP (1%, requested after swap validation)</p>}
        </div>

        {selecting === "buy" && <AssetSelector selected={buy} onChoose={(asset) => chooseAsset("buy", asset)} />}

        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-xs leading-5 text-amber-100/65">
          Uses native XRPL DEX and AMM liquidity. Token identity includes its issuer address and swaps use XRPL-native transactions rather than an EVM contract.
        </div>

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
          className="w-full rounded-[22px] bg-[rgba(255,222,85,0.98)] px-4 py-4 text-base font-bold text-black disabled:opacity-50"
        >
          {!manager ? "Loading XRP wallets…" : insufficient ? `Insufficient ${sell.symbol}` : primaryLabel}
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

function AssetButton({ asset, onClick }: { asset: XrplAsset; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 hover:border-amber-300/40">
      <TokenLogo symbol={asset.symbol} logo={asset.logo} size="xs" />
      <span className="text-sm font-semibold text-white">{asset.symbol}</span>
      <span className="text-[10px] text-white/45">▼</span>
    </button>
  );
}

function AssetSelector({ selected, onChoose }: { selected: XrplAsset; onChoose: (asset: XrplAsset) => void }) {
  const [registryTokens, setRegistryTokens] = useState<XrplAsset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [registryOffset, setRegistryOffset] = useState(0);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadMore(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const assets = useMemo(() => {
    const seen = new Set<string>();
    const combined = [XRPL_ASSETS[0]!, ...XRPL_ASSETS.slice(1), ...registryTokens].filter((asset) => {
      const id = xrplAssetId(asset);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const needle = query.trim().toLowerCase();
    if (!needle) return combined;
    return combined.filter((asset) =>
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
        className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/40"
      />
      <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
      {assets.map((asset) => (
        <button
          key={xrplAssetId(asset)}
          type="button"
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
      {hasMore && !query && <button type="button" onClick={() => void loadMore()} disabled={loading} className="mt-2 w-full rounded-xl border border-white/10 px-3 py-2 text-xs text-white/55 hover:border-amber-300/35 disabled:opacity-50">{loading ? "Loading XRPL tokens…" : "Load more XRPL tokens"}</button>}
      <p className="px-2 py-2 text-[10px] leading-4 text-white/35">Only curated assets and registry-verified issuers are shown. Always confirm the issuer address; swaps remain limited to pairs with live XRP liquidity.</p>
    </div>
  );
}
