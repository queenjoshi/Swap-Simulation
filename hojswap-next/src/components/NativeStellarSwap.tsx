"use client";

import { useEffect, useRef, useState } from "react";
import { TokenLogo } from "@/components/TokenLogo";
import { saveTransaction } from "@/lib/transactions";
import { STELLAR_HORIZON, STELLAR_LOGO, STELLAR_NETWORK_ID, STELLAR_PASSPHRASE, STELLAR_TOKENS,
  stellarAtomic, stellarDecimal, type StellarQuote } from "@/lib/stellar";
import type { SolanaNetworkOption } from "./NativeSolanaSwap";

export function NativeStellarSwap({ networks, onNetworkChange }: {
  networks: SolanaNetworkOption[]; onNetworkChange: (id: number) => void;
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [sell, setSell] = useState("XLM");
  const [buy, setBuy] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(100);
  const [quote, setQuote] = useState<StellarQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState<"sell" | "buy" | null>(null);
  const [balances, setBalances] = useState<Record<string, string> | null>(null);
  const [spendable, setSpendable] = useState<Record<string, bigint> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function close(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) { setNetworkOpen(false); setAssetOpen(null); }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setNetworkOpen(false); setAssetOpen(null); }
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    setBalances(null); setSpendable(null);
    if (!address) return;
    const controller = new AbortController();
    async function load() {
      try {
        const [accountResponse, ledgerResponse] = await Promise.all([
          fetch(`${STELLAR_HORIZON}/accounts/${address}`, { signal: controller.signal }),
          fetch(`${STELLAR_HORIZON}/ledgers?order=desc&limit=1`, { signal: controller.signal }),
        ]);
        if (!accountResponse.ok || !ledgerResponse.ok) return;
        const account = await accountResponse.json();
        const ledger = (await ledgerResponse.json())._embedded.records[0];
        const available: Record<string, bigint> = {};
        const display: Record<string, string> = {};
        for (const token of STELLAR_TOKENS) {
          const balance = account.balances.find((b: { asset_type: string; asset_code?: string; asset_issuer?: string }) =>
            token.issuer ? b.asset_code === token.symbol && b.asset_issuer === token.issuer : b.asset_type === "native");
          const total = stellarAtomic(balance?.balance ?? "0");
          let remaining = total - stellarAtomic(balance?.selling_liabilities ?? "0");
          if (!token.issuer) {
            const reserveUnits = 2 + account.subentry_count + (account.num_sponsoring ?? 0) - (account.num_sponsored ?? 0);
            // Leave reserve and a conservative two-operation fee buffer untouched.
            remaining -= BigInt(reserveUnits) * BigInt(ledger.base_reserve_in_stroops) + 200000n;
          }
          available[token.symbol] = balance?.is_authorized === false ? 0n : remaining > 0n ? remaining : 0n;
          display[token.symbol] = stellarDecimal(total);
        }
        if (!controller.signal.aborted) { setBalances(display); setSpendable(available); }
      } catch { /* Balance controls remain disabled when Horizon is unavailable. */ }
    }
    void load();
    return () => controller.abort();
  }, [address, hash]);
  function percentage(percent: number) {
    if (!spendable) return;
    setAmount(stellarDecimal((spendable[sell] ?? 0n) * BigInt(percent) / 100n)); reset();
  }
  function reset() { setQuote(null); setError(null); setHash(null); }
  async function wallet() {
    const api = await import("@stellar/freighter-api");
    const connected = await api.isConnected();
    if (!connected.isConnected) throw new Error("Install the Freighter Stellar wallet extension to connect.");
    const network = await api.getNetworkDetails();
    if (network.networkPassphrase !== STELLAR_PASSPHRASE) throw new Error("Switch Freighter to Stellar Mainnet.");
    return api;
  }
  async function connect() {
    setBusy(true); reset();
    try {
      const api = await wallet();
      const result = await api.requestAccess();
      if (result.error || !result.address) throw new Error("Wallet connection was declined or unavailable.");
      setAddress(result.address);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to connect Freighter."); }
    finally { setBusy(false); }
  }
  async function requestQuote() {
    setBusy(true); reset();
    try {
      const response = await fetch("/api/stellar/quote", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sell, buy, amount, slippageBps: slippage, ...(address ? { account: address } : {}) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to quote this Stellar pair.");
      setQuote(result);
    } catch (e) { setError(e instanceof Error ? e.message : "Quote failed."); }
    finally { setBusy(false); }
  }
  async function swap() {
    if (!quote?.transaction || !address) return;
    setBusy(true); setError(null);
    try {
      if (Date.now() >= quote.expiresAt) throw new Error("This quote expired. Get a fresh quote.");
      const api = await wallet();
      const current = await api.getAddress();
      if (current.address !== address) throw new Error("Your Stellar wallet account changed. Reconnect and quote again.");
      const sdk = await import("@stellar/stellar-sdk");
      const { reviewedStellarTransaction } = await import("@/lib/stellar-transaction");
      const tx = reviewedStellarTransaction(quote, address, { sell, buy, amount, slippage });
      const signed = await api.signTransaction(quote.transaction, { networkPassphrase: STELLAR_PASSPHRASE, address });
      if (signed.error || !signed.signedTxXdr) throw new Error("The wallet did not sign this transaction.");
      const signedTx = sdk.TransactionBuilder.fromXDR(signed.signedTxXdr, STELLAR_PASSPHRASE);
      if (!(signedTx instanceof sdk.Transaction) || !tx.hash().every((byte, index) => byte === signedTx.hash()[index])) throw new Error("The signed transaction differs from the reviewed swap.");
      if (!signedTx.signatures.some(signature => sdk.Keypair.fromPublicKey(address).verify(signedTx.hash(), signature.signature))) throw new Error("The selected account did not sign this transaction.");
      const server = new sdk.Horizon.Server(STELLAR_HORIZON);
      let result;
      try { result = await server.submitTransaction(signedTx); }
      catch {
        const submittedHash = Array.from(signedTx.hash(), byte => byte.toString(16).padStart(2, "0")).join("");
        setHash(submittedHash);
        throw new Error("Submission was not confirmed. Check the transaction link before retrying.");
      }
      if (!result.successful) throw new Error("Stellar rejected the transaction.");
      setHash(result.hash); setQuote(null);
      let received = quote.minimumReceive + " minimum";
      try {
        const response = await fetch(STELLAR_HORIZON + "/transactions/" + result.hash + "/operations", { signal: AbortSignal.timeout(10000) });
        const operations = response.ok ? (await response.json())._embedded?.records ?? [] : [];
        const settled = operations.find((op: { type?: string; to?: string; amount?: string }) =>
          op.type === "path_payment_strict_send" && op.to === address && typeof op.amount === "string");
        if (settled) received = settled.amount;
      } catch { /* The successful receipt is retained if indexing is delayed. */ }
      saveTransaction({ hash: result.hash, chainId: STELLAR_NETWORK_ID, chain: "Stellar", timestamp: Date.now(),
        status: "success", sellAmount: quote.sellAmount, sellToken: sell, buyAmount: received, buyToken: buy });
    } catch (e) { setError(e instanceof Error ? e.message : "Stellar swap failed."); }
    finally { setBusy(false); }
  }
  function assetSelector(side: "sell" | "buy") {
    const symbol = side === "sell" ? sell : buy;
    const token = STELLAR_TOKENS.find(t => t.symbol === symbol)!;
    return <div className="relative w-[8.5rem] shrink-0 sm:w-[9.25rem]">
      <button type="button" disabled={busy} aria-label={`${side === "sell" ? "Sell" : "Buy"} asset`} aria-haspopup="listbox" aria-expanded={assetOpen === side}
        onClick={() => { setNetworkOpen(false); setAssetOpen(assetOpen === side ? null : side); }}
        className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-2 text-left text-white transition hover:border-[rgba(212,175,55,0.25)] focus:border-[rgba(212,175,55,0.45)]">
        <span className="flex min-w-0 items-center gap-2"><TokenLogo symbol={symbol} logo={token.logo} size="xs" /><span className="truncate text-sm font-semibold">{symbol}</span></span>
        <span className="text-xs text-[rgba(212,175,55,0.9)]">▾</span>
      </button>
      {assetOpen === side && <div role="listbox" aria-label={`${side} assets`} className="absolute right-0 top-full z-[100] mt-2 w-60 rounded-2xl border border-white/10 bg-[#111113] p-1.5 shadow-2xl">
        {STELLAR_TOKENS.map(t => <button key={t.symbol} type="button" role="option" aria-selected={t.symbol === symbol}
          onClick={() => { setSell(side === "sell" ? t.symbol : t.symbol === "XLM" ? "USDC" : "XLM"); setBuy(side === "buy" ? t.symbol : t.symbol === "XLM" ? "USDC" : "XLM"); setAssetOpen(null); reset(); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-white/80 hover:bg-white/[0.06]">
          <TokenLogo symbol={t.symbol} logo={t.logo} size="sm" /><span><span className="block text-sm font-semibold">{t.symbol}</span><span className="block text-xs text-white/40">{t.name}</span></span>
        </button>)}
      </div>}
    </div>;
  }
  return <div ref={menuRef} className="w-full max-w-[450px]">
    <div className="hoj-card space-y-2 rounded-[24px] p-2 sm:rounded-[26px] sm:p-2.5">
      <div className="relative z-[90] flex items-center justify-between gap-2 px-1 pb-1">
        <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Trade</p><p className="truncate text-sm font-semibold text-white/80">Stellar</p></div>
        <div className="relative">
          <button type="button" disabled={busy} aria-label="Select network" aria-haspopup="listbox" aria-expanded={networkOpen} onClick={() => { setAssetOpen(null); setNetworkOpen(!networkOpen); }}
            className="flex min-w-[8.25rem] items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-left transition hover:border-[rgba(212,175,55,0.3)] sm:min-w-[8.75rem] sm:py-2">
            <span className="flex items-center gap-2"><TokenLogo symbol="XLM" logo={STELLAR_LOGO} size="xs" /><span className="text-xs font-semibold text-white/80">Stellar</span></span><span className="text-xs text-[rgba(212,175,55,0.9)]">▾</span>
          </button>
          {networkOpen && <div role="listbox" aria-label="Networks" className="absolute right-0 top-full z-[100] mt-2 max-h-72 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-1.5 shadow-2xl">
            {networks.map(n => <button type="button" key={n.id} role="option" aria-selected={n.id === STELLAR_NETWORK_ID} onClick={() => { setNetworkOpen(false); onNetworkChange(n.id); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${n.id === STELLAR_NETWORK_ID ? "bg-[rgba(212,175,55,0.14)] text-white" : "text-white/80 hover:bg-white/[0.06]"}`}>
              <TokenLogo symbol={n.ticker} logo={n.logo} size="sm" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{n.name}</span><span className="block text-xs text-white/40">{n.ticker}</span></span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">{n.mode}</span>
            </button>)}
          </div>}
        </div>
      </div>
      <div className="flex gap-1 rounded-full border border-white/8 bg-black/25 p-1">
        <button type="button" className="min-w-0 flex-1 rounded-full bg-[rgba(212,175,55,0.95)] px-2 py-1.5 text-[12px] font-semibold text-black sm:px-3 sm:py-2">Swap</button>
        <button type="button" disabled title="Stellar bridging is not available" className="min-w-0 flex-1 rounded-full px-2 py-1.5 text-[12px] font-semibold text-white/30 sm:px-3 sm:py-2">Bridge</button>
      </div>
      <div className="hoj-panel relative z-40 rounded-[22px] p-3.5 sm:rounded-[24px] sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-3 sm:mb-2.5"><span className="text-[15px] font-semibold text-white/55">Sell</span>{assetSelector("sell")}</div>
        <input aria-label="Sell amount" inputMode="decimal" value={amount} disabled={busy} onChange={e => { setAmount(e.target.value); reset(); }} placeholder="0.0" className="hoj-input w-full min-w-0 bg-transparent text-[2.65rem] font-semibold leading-none text-white outline-none placeholder:text-white/25 sm:text-5xl" />
        <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Choose percentage of spendable balance">
          {[25, 50, 75, 100].map(p => <button key={p} type="button" disabled={busy || !spendable || !spendable[sell]} onClick={() => percentage(p)} className="min-h-9 rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-1.5 text-[11px] font-semibold tabular-nums text-white/60 transition hover:border-[rgba(212,175,55,0.45)] hover:bg-[rgba(212,175,55,0.1)] disabled:cursor-not-allowed disabled:opacity-30 sm:px-2 sm:text-xs">{p}%</button>)}
        </div>
        {address && <p className="mt-2 text-[11px] text-white/45">Balance: {balances ? `${balances[sell]} ${sell}` : "unavailable"}{sell === "XLM" && " · reserve and fee buffer excluded from Max"}</p>}
      </div>
      <button type="button" disabled={busy} aria-label="Flip Stellar assets" onClick={() => { setSell(buy); setBuy(sell); reset(); }} className="relative z-50 mx-auto !-my-2.5 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[#101012] bg-[#19191b] text-xl text-[rgba(212,175,55,0.95)] shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition hover:bg-[#202022] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">↓</button>
      <div className="hoj-panel relative z-30 rounded-[22px] p-3.5 pt-6 sm:rounded-[24px] sm:p-4 sm:pt-7">
        <div className="mb-2 flex items-start justify-between gap-3 sm:mb-2.5"><span className="text-[15px] font-semibold text-white/55">Buy</span>{assetSelector("buy")}</div>
        <div className="truncate text-[2.25rem] font-semibold leading-none tabular-nums text-white/90 sm:text-[2.65rem]">{quote?.expectedReceive ?? "0.0"}</div>
        <p className="mt-1 truncate text-xs text-white/45">{quote ? `Minimum: ${quote.minimumReceive} ${buy}` : "Enter an amount to get a quote"}</p>
        {address && <p className="mt-2 text-[11px] text-white/45">Balance: {balances ? `${balances[buy]} ${buy}` : "unavailable"}</p>}
      </div>
      <div className="flex items-center justify-between px-1 text-[11px] text-white/45"><span>House fee · 1%</span><span className="font-mono tabular-nums">{quote ? `${quote.houseFee} ${sell}` : "—"}</span></div>
      <section aria-label="House Guard verification" className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.045)] p-3">
        <div className="flex items-center justify-between"><span className="hoj-display text-xs font-semibold text-[rgba(212,175,55,0.95)]">House Guard</span><span className="text-[9px] uppercase tracking-[0.16em] text-white/40">Verify before signing</span></div>
        <div className="mt-2 space-y-1 text-[11px] leading-5 text-white/55">
          {quote ? <><p>Promise: send {quote.sellAmount} {sell}; receive at least {quote.minimumReceive} {buy}.</p><p>Approval: no ERC-20 allowance. Only this transaction is signed.</p><p>Review: transaction contents and account signature are checked before submission; no EVM simulation.</p></> : <p>Get a Stellar quote to review the minimum received and fee. The fee and swap execute together in one transaction.</p>}
        </div>
      </section>
      <details className="group hoj-panel rounded-2xl">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/55">Show more <span>▾</span></summary>
        <div className="space-y-3 border-t border-white/10 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Slippage tolerance</p>
          <div className="flex gap-2">{[50, 100, 200].map(bps => <button key={bps} type="button" disabled={busy} onClick={() => { setSlippage(bps); reset(); }} className={`rounded-xl px-3 py-2 text-sm font-medium ${slippage === bps ? "bg-[rgba(212,175,55,0.95)] text-black" : "border border-white/10 bg-black/30 text-white/80"}`}>{bps / 100}%</button>)}</div>
          <p className="text-[11px] leading-5 text-white/40">Native XLM and Circle USDC through Stellar order books and liquidity pools. Keep XLM for reserves and fees. Receiving USDC requires a Circle USDC trustline.</p>
          {quote?.networkFeeXlm && <p className="text-xs text-white/55">Network fee: {quote.networkFeeXlm} XLM</p>}
        </div>
      </details>
      {quote?.warning && <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-200">{quote.warning}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-400/10 p-3 text-xs leading-5 text-red-200">{error}</p>}
      {hash && <a className="block p-2 text-sm text-amber-200 underline" href={"https://stellar.expert/explorer/public/tx/" + hash} target="_blank" rel="noopener noreferrer">View Stellar transaction</a>}
      <button type="button" disabled={busy || !amount} onClick={quote?.transaction ? swap : requestQuote} className="min-h-12 w-full rounded-[20px] bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40">{busy ? "Working…" : quote?.transaction ? "Review and sign swap" : quote ? "Refresh quote" : "Get quote"}</button>
      <button type="button" disabled={busy} onClick={address ? () => { setAddress(null); reset(); } : connect} className="min-h-12 w-full rounded-[20px] border border-[rgba(212,175,55,0.3)] px-4 py-3 text-sm font-semibold text-[rgba(212,175,55,0.95)]">{address ? address.slice(0, 8) + "…" + address.slice(-6) + " · Disconnect" : "Connect Freighter"}</button>
    </div>
  </div>;
}
