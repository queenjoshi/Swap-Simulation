"use client";

import type { WalletManager } from "xrpl-connect";

let walletManagerPromise: Promise<WalletManager> | null = null;

export function getXrplWalletManager() {
  if (walletManagerPromise) return walletManagerPromise;

  walletManagerPromise = import("xrpl-connect").then(({
    CrossmarkAdapter,
    GemWalletAdapter,
    LedgerAdapter,
    OtsuAdapter,
    WalletConnectAdapter,
    WalletManager,
    XamanAdapter,
    XyraAdapter,
  }) => {
    const xamanApiKey = process.env.NEXT_PUBLIC_XAMAN_API_KEY;
    const walletConnectProjectId =
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
      "804fd92cee82146454ccc0a3c75a55f4";
    const adapters = [
      new XamanAdapter({ apiKey: xamanApiKey }),
      new CrossmarkAdapter(),
      new GemWalletAdapter(),
      new XyraAdapter(),
      new OtsuAdapter(),
      new LedgerAdapter(),
    ];

    adapters.push(new WalletConnectAdapter({
      projectId: walletConnectProjectId,
      themeMode: "dark",
      // The app renders the URI itself so WalletConnect remains usable in
      // embedded browsers (including Xaman xApps) where the vendor modal may
      // not mount or may be blocked by the host webview.
      useModal: false,
      metadata: {
        name: "House of Joshi Swap",
        description: "Non-custodial swaps on the XRP Ledger and EVM networks",
        url: window.location.origin,
        icons: ["https://swap.thehouseofjoshi.com/icon.png"],
      },
    }));

    return new WalletManager({ adapters, network: "mainnet", autoConnect: true });
  }).catch((error) => {
    walletManagerPromise = null;
    throw error;
  });

  return walletManagerPromise;
}
