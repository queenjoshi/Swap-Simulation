import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const displayFont = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

const sansFont = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "House of Joshi — Swap & Bridge",
  description: "Swap and bridge BONE, TREAT, OSCAR, ETH, USDC, USDT across Ethereum, Base, Cronos, and XRP EVM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[#0b0b0d] text-[#f5f1e6] font-sans">
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
