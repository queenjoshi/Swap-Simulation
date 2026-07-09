import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base, mainnet } from "wagmi/chains";
import { arbitrum, bsc, cronos, optimism, polygon, xrp } from "@/lib/chains";
import { getRpcTransport } from "@/lib/rpc";

const walletConnectProjectId =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ??
  "804fd92cee82146454ccc0a3c75a55f4";

const appUrl =
  (import.meta.env.VITE_APP_URL as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "https://hojswap.com");

export const wagmiConfig = getDefaultConfig({
  appName: "House of Joshi — Swap & Bridge",
  appDescription:
    "Swap and bridge BONE, TREAT, OSCAR, ETH, USDC, USDT across Ethereum, Base, Cronos, XRP EVM, Polygon, BNB Chain, Arbitrum, and Optimism.",
  appUrl,
  appIcon: `${appUrl}/logo.png`,
  projectId: walletConnectProjectId,
  chains: [
    base,
    mainnet,
    cronos as Chain,
    xrp as Chain,
    polygon as Chain,
    bsc as Chain,
    arbitrum as Chain,
    optimism as Chain,
  ],
  transports: {
    [base.id]: getRpcTransport(base.id),
    [mainnet.id]: getRpcTransport(mainnet.id),
    [cronos.id]: getRpcTransport(cronos.id),
    [xrp.id]: getRpcTransport(xrp.id),
    [polygon.id]: getRpcTransport(polygon.id),
    [bsc.id]: getRpcTransport(bsc.id),
    [arbitrum.id]: getRpcTransport(arbitrum.id),
    [optimism.id]: getRpcTransport(optimism.id),
  },
  walletConnectParameters: {
    metadata: {
      name: "House of Joshi — Swap & Bridge",
      description:
        "Swap and bridge HOJ tokens across Ethereum, Base, Cronos, XRP EVM, Polygon, BNB Chain, Arbitrum, and Optimism.",
      url: appUrl,
      icons: [`${appUrl}/logo.png`],
    },
    qrModalOptions: {
      themeMode: "dark",
      themeVariables: {
        "--wcm-accent-color": "#D4AF37",
        "--wcm-background-color": "#0b0b0d",
      },
    },
  },
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, trustWallet],
    },
    {
      groupName: "Popular",
      wallets: [
        rainbowWallet,
        okxWallet,
        phantomWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: "Other",
      wallets: [injectedWallet],
    },
  ],
});
