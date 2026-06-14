"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { ToastProvider } from "@/components/Toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create query client inside useState to avoid sharing cache between requests in server environment
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            retry: 2,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "rgba(212,175,55,0.95)",
            accentColorForeground: "black",
            borderRadius: "large",
            fontStack: "rounded",
            overlayBlur: "small",
          })}
          locale="en-US"
        >
          <ToastProvider>{children}</ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
