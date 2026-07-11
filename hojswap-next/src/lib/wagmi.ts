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
import { arbitrum, avalanche, bsc, cronos, optimism, polygon, unichain, xrp } from "@/lib/chains";
import { getRpcTransport } from "@/lib/rpc";

const walletConnectProjectId =
  (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string | undefined) ??
  "804fd92cee82146454ccc0a3c75a55f4";

const appUrl =
  (process.env.NEXT_PUBLIC_APP_URL as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "https://hojswap.com");

export const wagmiConfig = getDefaultConfig({
  appName: "House of Joshi — Swap & Bridge",
  appDescription:
    "Swap and bridge BONE, TREAT, OSCAR, ETH, USDC, USDT across Ethereum, Base, Cronos, XRP EVM, Polygon, BNB Chain, Arbitrum, Optimism, Avalanche, and Unichain.",
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
    avalanche as Chain,
    unichain as Chain,
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
    [avalanche.id]: getRpcTransport(avalanche.id),
    [unichain.id]: getRpcTransport(unichain.id),
  },
  walletConnectParameters: {
    metadata: {
      name: "House of Joshi — Swap & Bridge",
      description:
        "Swap and bridge HOJ tokens across Ethereum, Base, Cronos, XRP EVM, Polygon, BNB Chain, Arbitrum, Optimism, Avalanche, and Unichain.",
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
