"use client";

import {
  CrossmarkAdapter,
  GemWalletAdapter,
  LedgerAdapter,
  OtsuAdapter,
  WalletConnectAdapter,
  WalletManager,
  XamanAdapter,
  XyraAdapter,
} from "xrpl-connect";

let walletManager: WalletManager | null = null;

export function getXrplWalletManager() {
  if (walletManager) return walletManager;

  const xamanApiKey = process.env.NEXT_PUBLIC_XAMAN_API_KEY;
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  const adapters = [
    new XamanAdapter({ apiKey: xamanApiKey }),
    new CrossmarkAdapter(),
    new GemWalletAdapter(),
    new XyraAdapter(),
    new OtsuAdapter(),
    new LedgerAdapter(),
  ];

  if (walletConnectProjectId) {
    adapters.push(new WalletConnectAdapter({
      projectId: walletConnectProjectId,
      themeMode: "dark",
      metadata: {
        name: "House of Joshi Swap",
        description: "Non-custodial swaps on the XRP Ledger and EVM networks",
        url: typeof window === "undefined" ? "https://swap.thehouseofjoshi.com" : window.location.origin,
        icons: ["https://swap.thehouseofjoshi.com/icon.png"],
      },
    }));
  }

  walletManager = new WalletManager({ adapters, network: "mainnet", autoConnect: true });
  return walletManager;
}
