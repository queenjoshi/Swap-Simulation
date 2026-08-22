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
import { arbitrum, avalanche, berachain, bsc, cronos, hyperEvm, ink, linea, mantle, monad, optimism, plasma, polygon, robinhood, scroll, sonic, unichain, worldchain, zora } from "@/lib/chains";
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
    "Swap, bridge, and discover assets across supported EVM networks, Solana, and the native XRP Ledger.",
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
    linea as Chain, scroll as Chain, mantle as Chain, worldchain as Chain, sonic as Chain,
    berachain as Chain, ink as Chain, monad as Chain, hyperEvm as Chain, plasma as Chain,
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
    [linea.id]: getRpcTransport(linea.id),
    [scroll.id]: getRpcTransport(scroll.id),
    [mantle.id]: getRpcTransport(mantle.id),
    [worldchain.id]: getRpcTransport(worldchain.id),
    [sonic.id]: getRpcTransport(sonic.id),
    [berachain.id]: getRpcTransport(berachain.id),
    [ink.id]: getRpcTransport(ink.id),
    [monad.id]: getRpcTransport(monad.id),
    [hyperEvm.id]: getRpcTransport(hyperEvm.id),
    [plasma.id]: getRpcTransport(plasma.id),
  },
  walletConnectParameters: {
    metadata: {
      name: "House of Joshi — Swap & Bridge",
      description:
        "Swap, bridge, and discover assets across supported EVM networks, Solana, and the native XRP Ledger.",
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
