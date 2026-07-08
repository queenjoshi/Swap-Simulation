import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "House of Joshi — Swap & Bridge",
  description:
    "Swap and bridge HOJ community tokens across Ethereum, Base, Polygon, BNB Chain, Arbitrum, Optimism, Cronos, and XRP EVM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2QDL68W4EG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2QDL68W4EG');
          `}
        </Script>
      </head>
      <body className="flex min-h-dvh flex-col bg-[#0b0b0d] text-[#f5f1e6] font-sans">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8905064413166970"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
