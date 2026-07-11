"use client";
import { useRef } from "react";
import { Transak } from "@transak/transak-sdk";
import { useToast } from "@/components/Toast";

type FastOnRampButtonProps = {
  walletAddress: string;
  selectedChainId: number;
  onSuccess?: (orderData: unknown) => void;
};

export function FastOnRampButton({ walletAddress, selectedChainId, onSuccess }: FastOnRampButtonProps) {
  const { showToast } = useToast();
  const transakRef = useRef<InstanceType<typeof Transak> | null>(null);

  const getChainNameForTransak = (chainId: number): string => {
    const chainMap: Record<number, string> = {
      8453: "base",
      1: "ethereum",
      25: "cronos",
      201: "xrpl",
      137: "polygon",
      56: "bsc",
      42161: "arbitrum",
      10: "optimism",
      43114: "avalanche",
      130: "unichain",
    };
    return chainMap[chainId] || "ethereum";
  };

  const launchOnRamp = () => {
    const apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY;
    if (!apiKey) {
      showToast({
        kind: "error",
        title: "On-ramp unavailable",
        message: "Set NEXT_PUBLIC_TRANSAK_API_KEY before enabling card purchases.",
      });
      return;
    }

    try {
      const transak = new Transak({
        apiKey,
        environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "STAGING",
        widgetWidth: "450px",
        widgetHeight: "700px",
        fiatCurrency: "USD",
        cryptoCurrencyCode: "USDC",
        network: getChainNameForTransak(selectedChainId),
        paymentMethod: "credit_debit_card",
        walletAddress,
        disableWalletAddressForm: true,
        themeColor: "D4AF37",
        hideMenu: false,
        exchangeScreenTitle: "House of Joshi",
        defaultFiatAmount: 50,
      } as any);

      transakRef.current = transak;

      Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (data: unknown) => {
        showToast({ kind: "success", title: "Purchase successful", message: "Your crypto purchase is on the way!" });
        if (onSuccess) onSuccess(data);
        transak.close();
      });

      Transak.on(Transak.EVENTS.TRANSAK_ORDER_FAILED, (_data: unknown) => {
        showToast({ kind: "error", title: "Purchase failed", message: "There was an issue with your purchase. Please try again." });
      });

      Transak.on(Transak.EVENTS.TRANSAK_ORDER_CANCELLED, () => {
        showToast({ kind: "info", title: "Purchase cancelled", message: "Your purchase was cancelled." });
      });

      Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
        transakRef.current = null;
      });

      transak.init();
    } catch {
      showToast({ kind: "error", title: "Error", message: "Failed to open the payment widget. Please try again." });
    }
  };

  return (
    <button
      type="button"
      onClick={launchOnRamp}
      className="w-full rounded-2xl bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black shadow-[0_12px_25px_-12px_rgba(212,175,55,0.9)] hover:bg-[rgba(212,175,55,0.85)] disabled:opacity-60 transition"
    >
      Buy with Card
    </button>
  );
}
