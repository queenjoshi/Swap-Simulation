"use client";

import { useConnect, useWallets } from "@solana/kit-plugin-wallet/react";
import { solanaClient } from "@/lib/solana-client";

const MOBILE_WALLETS = [
  { name: "Phantom", logo: "https://assets.coingecko.com/coins/images/40752/standard/phantom-token.png", kind: "phantom" },
  { name: "Solflare", logo: "https://assets.coingecko.com/coins/images/28356/standard/solflare.png", kind: "solflare" },
  { name: "Backpack", logo: "https://backpack.app/favicon.ico", kind: "backpack" },
  { name: "Coinbase Wallet", logo: "https://www.coinbase.com/favicon.ico", kind: "coinbase" },
  { name: "Trust Wallet", logo: "https://trustwallet.com/favicon.ico", kind: "trust" },
  { name: "OKX Wallet", logo: "https://www.okx.com/favicon.ico", kind: "okx" },
  { name: "Glow", logo: "https://glow.app/favicon.ico", kind: "glow" },
] as const;

function mobileWalletHref(kind: (typeof MOBILE_WALLETS)[number]["kind"]) {
  if (typeof window === "undefined") return "#";
  const appUrl = encodeURIComponent(window.location.href);
  const ref = encodeURIComponent(window.location.origin);
  if (kind === "phantom") return `https://phantom.app/ul/browse/${appUrl}?ref=${ref}`;
  if (kind === "solflare") return `https://solflare.com/ul/v1/browse/${appUrl}?ref=${ref}`;
  if (kind === "backpack") return "https://backpack.app/download";
  if (kind === "coinbase") return "https://www.coinbase.com/wallet/downloads";
  if (kind === "trust") return "https://trustwallet.com/download";
  if (kind === "okx") return "https://www.okx.com/web3";
  return "https://glow.app/download";
}

export function SolanaWalletOptions({ onConnected }: { onConnected?: () => void }) {
  const wallets = useWallets(solanaClient);
  const connect = useConnect(solanaClient);

  return (
    <div className="space-y-2">
      {wallets.map((wallet) => (
        <button key={wallet.name} type="button" disabled={connect.isRunning} onClick={async () => { await connect.dispatchAsync(wallet); onConnected?.(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06] disabled:opacity-50">
          <img src={wallet.icon} alt="" className="h-9 w-9 rounded-xl" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white/88">{wallet.name}</span><span className="block text-[10px] text-emerald-200/60">Detected on this device</span></span>
          <span className="text-xs text-[#e7c45b]">Connect</span>
        </button>
      ))}
      <p className="px-2 pt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Open or install a mobile wallet</p>
      {MOBILE_WALLETS.filter((mobile) => !wallets.some((wallet) => wallet.name.toLowerCase().includes(mobile.name.toLowerCase()))).map((wallet) => (
        <a key={wallet.name} href={mobileWalletHref(wallet.kind)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]">
          <img src={wallet.logo} alt="" className="h-9 w-9 rounded-xl bg-white/5 object-cover" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white/88">{wallet.name}</span><span className="block text-[10px] text-white/40">Opens the wallet app or its official download page</span></span>
          <span className="text-xs text-[#e7c45b]">Open ↗</span>
        </a>
      ))}
    </div>
  );
}
