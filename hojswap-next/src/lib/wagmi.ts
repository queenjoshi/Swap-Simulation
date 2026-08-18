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
import { arbitrum, avalanche, bsc, cronos, optimism, polygon, robinhood, unichain, zora } from "@/lib/chains";
import { getRpcTransport } from "@/lib/rpc";

const walletConnectProjectId =
  (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string | undefined) ??
  "804fd92cee82146454ccc0a3c75a55f4";

const appUrl =
  (process.env.NEXT_PUBLIC_APP_URL as string | undefined) ??
  "https://swap.thehouseofjoshi.com";

export const wagmiConfig = getDefaultConfig({
  ssr: true,
  appName: "House of Joshi — Swap & Bridge",
  appDescription:
    "Swap, bridge, and discover assets across Ethereum, Base, Zora, Cronos, Polygon, BNB Chain, Arbitrum, Optimism, Avalanche, Robinhood Chain, Unichain, and the native XRP Ledger.",
  appUrl,
  appIcon: `${appUrl}/logo.png`,
  projectId: walletConnectProjectId,
  chains: [
    base,
    mainnet,
    cronos as Chain,
    polygon as Chain,
    bsc as Chain,
    arbitrum as Chain,
    optimism as Chain,
    avalanche as Chain,
    robinhood as Chain,
    unichain as Chain,
    zora as Chain,
  ],
  transports: {
    [base.id]: getRpcTransport(base.id),
    [mainnet.id]: getRpcTransport(mainnet.id),
    [cronos.id]: getRpcTransport(cronos.id),
    [polygon.id]: getRpcTransport(polygon.id),
    [bsc.id]: getRpcTransport(bsc.id),
    [arbitrum.id]: getRpcTransport(arbitrum.id),
    [optimism.id]: getRpcTransport(optimism.id),
    [avalanche.id]: getRpcTransport(avalanche.id),
    [robinhood.id]: getRpcTransport(robinhood.id),
    [unichain.id]: getRpcTransport(unichain.id),
    [zora.id]: getRpcTransport(zora.id),
  },
  walletConnectParameters: {
    metadata: {
      name: "House of Joshi — Swap & Bridge",
      description:
        "Swap, bridge, and discover assets across Ethereum, Base, Zora, Cronos, Polygon, BNB Chain, Arbitrum, Optimism, Avalanche, Robinhood Chain, Unichain, and the native XRP Ledger.",
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
