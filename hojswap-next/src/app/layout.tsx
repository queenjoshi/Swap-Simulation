import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://swap.thehouseofjoshi.com";

const displayFont = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const bodyFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "House of Joshi",
  title: "House of Joshi — Swap & Bridge",
  description:
    "Swap and bridge assets across 21 EVM networks—including Linea, Scroll, Mantle, World Chain, Sonic, Berachain, Ink, Monad, HyperEVM, and Plasma—plus Solana and the XRP Ledger.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "House of Joshi",
    title: "House of Joshi — Swap & Bridge",
    description:
      "Swap and bridge assets across 21 EVM networks—including Linea, Scroll, Mantle, World Chain, Sonic, Berachain, Ink, Monad, HyperEVM, and Plasma—plus Solana and the XRP Ledger.",
    images: [
      {
        url: "/social/hojswap-share-cover.png",
        width: 1200,
        height: 630,
        alt: "Hojswap — Swap & Bridge Across Chains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "House of Joshi — Swap & Bridge",
    description:
      "Swap and bridge assets across 21 EVM networks—including Linea, Scroll, Mantle, World Chain, Sonic, Berachain, Ink, Monad, HyperEVM, and Plasma—plus Solana and the XRP Ledger.",
    images: ["/social/hojswap-share-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8905064413166970"
          crossOrigin="anonymous"
        />
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
      <body className="flex min-h-dvh flex-col bg-[#0b0b0d] text-[#f5f1e6]">
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
