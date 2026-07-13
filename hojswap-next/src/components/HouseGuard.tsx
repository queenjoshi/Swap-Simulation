"use client";

import { AlertTriangle, CheckCircle2, LoaderCircle, ReceiptText, ShieldCheck, X } from "lucide-react";
import { explorerName, explorerTxUrl } from "@/lib/chains";

export type HouseGuardVerification = {
  quoteKey: string;
  status: "idle" | "checking" | "verified" | "failed";
  blockNumber?: bigint;
  message?: string;
};

export type HouseGuardReceiptData = {
  txHash: `0x${string}`;
  chainId: number;
  blockNumber?: bigint;
  status: "verified" | "failed" | "not_verified";
  sellAmount: string;
  sellToken: string;
  expectedReceive: string;
  minimumReceive: string;
  actualReceive?: string;
  buyToken: string;
  approvalScope: "none" | "exact" | "unknown";
  message: string;
};

export function HouseGuard({
  quoteKey,
  hasQuote,
  isConnected,
  sellAmount,
  sellToken,
  expectedReceive,
  minimumReceive,
  hasMinimumReceive,
  approvalScope,
  verification,
  receipt,
  onDismissReceipt,
}: {
  quoteKey: string;
  hasQuote: boolean;
  isConnected: boolean;
  sellAmount: string;
  sellToken: string;
  expectedReceive: string;
  minimumReceive: string;
  hasMinimumReceive: boolean;
  approvalScope: "none" | "exact" | "unknown";
  verification: HouseGuardVerification;
  receipt: HouseGuardReceiptData | null;
  onDismissReceipt: () => void;
}) {
  const currentVerification = verification.quoteKey === quoteKey
    ? verification
    : { quoteKey, status: "idle" as const };

  return (
    <div className="space-y-2.5">
      <section
        aria-label="House Guard verification"
        className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.045)] p-3"
      >
        <div className="flex items-start gap-2.5">
          <GuardIcon status={currentVerification.status} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="hoj-display text-xs font-semibold text-[rgba(226,190,72,0.96)]">House Guard</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/35">Verify before signing</p>
              </div>
              <GuardStatus status={currentVerification.status} blockNumber={currentVerification.blockNumber} />
            </div>

            {hasQuote ? (
              <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-white/58">
                <GuardRow
                  label="Promise"
                  value={hasMinimumReceive ? `Send ${sellAmount} ${sellToken}; receive at least ${minimumReceive}` : "Minimum receive is missing; House Guard will block submission"}
                  good={hasMinimumReceive}
                  warn={!hasMinimumReceive}
                />
                <GuardRow label="Expected" value={expectedReceive} />
                <GuardRow
                  label="Approval"
                  value={approvalScope === "none" ? "No token approval required" : approvalScope === "exact" ? "Limited to this trade amount" : "Approval scope not verified"}
                  good={approvalScope !== "unknown"}
                  warn={approvalScope === "unknown"}
                />
                <GuardRow
                  label="Simulation"
                  value={simulationMessage(currentVerification.status, currentVerification.message, isConnected)}
                  good={currentVerification.status === "verified"}
                  warn={currentVerification.status === "failed"}
                />
              </div>
            ) : (
              <p className="mt-3 text-[11px] leading-relaxed text-white/48">
                Enter an amount and connect your wallet. House Guard will verify the executable transaction before the final wallet signature.
              </p>
            )}
          </div>
        </div>
      </section>

      {receipt ? (
        <HouseGuardReceipt receipt={receipt} onDismiss={onDismissReceipt} />
      ) : null}
    </div>
  );
}

function GuardIcon({ status }: { status: HouseGuardVerification["status"] }) {
  const className = "mt-0.5 h-5 w-5 shrink-0";
  if (status === "checking") return <LoaderCircle className={`${className} animate-spin text-amber-200`} />;
  if (status === "verified") return <ShieldCheck className={`${className} text-emerald-300`} />;
  if (status === "failed") return <AlertTriangle className={`${className} text-red-300`} />;
  return <ShieldCheck className={`${className} text-[rgba(226,190,72,0.82)]`} />;
}

function GuardStatus({
  status,
  blockNumber,
}: {
  status: HouseGuardVerification["status"];
  blockNumber?: bigint;
}) {
  if (status === "checking") return <StatusPill tone="checking">Checking…</StatusPill>;
  if (status === "verified") {
    return <StatusPill tone="good">Verified{blockNumber != null ? ` · #${blockNumber}` : ""}</StatusPill>;
  }
  if (status === "failed") return <StatusPill tone="bad">Blocked</StatusPill>;
  return <StatusPill tone="idle">Pending</StatusPill>;
}

function StatusPill({
  tone,
  children,
}: {
  tone: "idle" | "checking" | "good" | "bad";
  children: React.ReactNode;
}) {
  const colors = tone === "good"
    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
    : tone === "bad"
      ? "border-red-400/25 bg-red-400/10 text-red-200"
      : tone === "checking"
        ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
        : "border-white/10 bg-white/[0.04] text-white/45";

  return <span className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${colors}`}>{children}</span>;
}

function GuardRow({
  label,
  value,
  good = false,
  warn = false,
}: {
  label: string;
  value: string;
  good?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      {good ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/90" /> : warn ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200/90" /> : <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />}
      <p className="min-w-0 break-words"><span className="font-semibold text-white/70">{label}:</span> {value}</p>
    </div>
  );
}

function HouseGuardReceipt({
  receipt,
  onDismiss,
}: {
  receipt: HouseGuardReceiptData;
  onDismiss: () => void;
}) {
  const verified = receipt.status === "verified";
  const failed = receipt.status === "failed";
  const colors = verified
    ? "border-emerald-400/25 bg-emerald-400/[0.07]"
    : failed
      ? "border-red-400/25 bg-red-400/[0.07]"
      : "border-amber-300/25 bg-amber-300/[0.07]";

  return (
    <section aria-label="House Guard receipt" className={`rounded-2xl border p-3 ${colors}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <ReceiptText className={`mt-0.5 h-5 w-5 shrink-0 ${verified ? "text-emerald-300" : failed ? "text-red-300" : "text-amber-200"}`} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/85">House Guard receipt</p>
            <p className="mt-0.5 text-[10px] text-white/45">
              {verified ? "Outcome verified on-chain" : failed ? "Transaction failed on-chain" : "Mined; output could not be independently verified"}
            </p>
          </div>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss House Guard receipt" className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[10.5px]">
        <ReceiptValue label="Sent" value={`${receipt.sellAmount} ${receipt.sellToken}`} />
        <ReceiptValue label="Expected" value={`${receipt.expectedReceive} ${receipt.buyToken}`} />
        <ReceiptValue label="Minimum" value={`${receipt.minimumReceive} ${receipt.buyToken}`} />
        <ReceiptValue label="Received" value={receipt.actualReceive ? `${receipt.actualReceive} ${receipt.buyToken}` : "Not verified"} />
      </div>

      <p className="mt-3 text-[10.5px] leading-relaxed text-white/58">{receipt.message}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/38">
        <span>{receipt.blockNumber != null ? `Block #${receipt.blockNumber}` : "Block unavailable"}</span>
        <a href={explorerTxUrl(receipt.chainId, receipt.txHash)} target="_blank" rel="noopener noreferrer" className="font-semibold text-[rgba(226,190,72,0.9)] hover:underline">
          Verify on {explorerName(receipt.chainId)} →
        </a>
      </div>
    </section>
  );
}

function ReceiptValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-2.5 py-2">
      <p className="uppercase tracking-[0.1em] text-white/32">{label}</p>
      <p className="mt-1 break-words font-mono text-white/75">{value}</p>
    </div>
  );
}

function simulationMessage(
  status: HouseGuardVerification["status"],
  message: string | undefined,
  isConnected: boolean,
) {
  if (!isConnected) return "Connect wallet for executable verification";
  if (status === "checking") return "Simulating the exact final transaction against current chain state";
  if (status === "verified") return "Exact transaction completed successfully in simulation";
  if (status === "failed") return message ?? "Simulation failed; transaction was not submitted";
  return "Runs immediately before the final wallet signature";
}
