import { useState, useEffect } from "react";
import { base, mainnet } from "wagmi/chains";
import {
  arbitrum, avalanche, berachain, bsc, cronos, hyperEvm, ink, linea, mantle,
  monad, optimism, plasma, polygon, robinhood, scroll, sonic, unichain, worldchain,
} from "@/lib/chains";
import { formatCompactNumber } from "@/lib/format";
import { apiUrl } from "@/lib/api";

const NATIVE_ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const SELL_AMOUNT = "100000000000000000"; // 0.1 native token

const USDC_BY_CHAIN: Record<number, string> = {
  [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [base.id]:    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [cronos.id]:  "0xc21223249CA28397B4B6541dfFaEEC539BfF0c59",
  [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  [bsc.id]:     "0x8AC76a51cc950d9822D68b83FE1Ad97B32Cd580d",
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [optimism.id]: "0x0b2C639c533813f4Aa9D7837CAe62653423a6504",
  [avalanche.id]: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  [unichain.id]: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
  [robinhood.id]: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  [linea.id]: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  [scroll.id]: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
  [mantle.id]: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
  [worldchain.id]: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
  [sonic.id]: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
  [berachain.id]: "0x549943e04f40284185054145c6E4e9568C1D3241",
  [ink.id]: "0x2D270e6886d130D724215A266106e6832161EAEd",
  [monad.id]: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
  [hyperEvm.id]: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
  [plasma.id]: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
};

export function getNativeSymbol(chainId: number): string {
  if (chainId === cronos.id) return "CRO";
  if (chainId === polygon.id) return "POL";
  if (chainId === bsc.id) return "BNB";
  if (chainId === avalanche.id) return "AVAX";
  if (chainId === mantle.id) return "MNT";
  if (chainId === sonic.id) return "S";
  if (chainId === berachain.id) return "BERA";
  if (chainId === monad.id) return "MON";
  if (chainId === hyperEvm.id) return "HYPE";
  if (chainId === plasma.id) return "XPL";
  return "ETH";
}

export function useNativeTokenPrice(chainId: number): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const usdcAddr = USDC_BY_CHAIN[chainId];
    if (!usdcAddr) { setPrice(null); return; }

    let cancelled = false;
    const doFetch = () => {
      fetch(apiUrl("/api/price"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellToken: NATIVE_ETH, buyToken: usdcAddr, sellAmount: SELL_AMOUNT, chainId }),
      })
        .then((r) => r.json())
        .then((data: { buyAmount?: string }) => {
          if (cancelled || !data?.buyAmount) return;
          const usdc = Number(data.buyAmount) / 1e6; // USDC has 6 decimals
          setPrice(usdc / 0.1); // price per 1 native token
        })
        .catch(() => {});
    };

    doFetch();
    const id = setInterval(doFetch, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [chainId]);

  return price;
}

export type GasFeeDisplay = { eth: string; usd: string | null };

export function formatNetworkFee(
  totalNetworkFeeWei: string | null | undefined,
  gasWei: string | null | undefined,
  gasPriceWei: string | null | undefined,
  nativeUsdPrice: number | null,
  nativeSymbol: string,
): GasFeeDisplay | null {
  let wei: bigint | null = null;

  if (totalNetworkFeeWei) {
    try { wei = BigInt(totalNetworkFeeWei); } catch {}
  }
  if (!wei && gasWei && gasPriceWei) {
    try { wei = BigInt(gasWei) * BigInt(gasPriceWei); } catch {}
  }
  if (!wei || wei === 0n) return null;

  const native = Number(wei) / 1e18;
  const ethStr = native < 0.0001
    ? `<0.0001 ${nativeSymbol}`
    : `~${formatCompactNumber(native, native < 0.001 ? 6 : 5)} ${nativeSymbol}`;

  const usdStr = nativeUsdPrice != null
    ? native * nativeUsdPrice < 0.01 ? "<$0.01"
      : `~$${formatCompactNumber(native * nativeUsdPrice, native * nativeUsdPrice < 1 ? 3 : 2)}`
    : null;

  return { eth: ethStr, usd: usdStr };
}
