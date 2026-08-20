import type { Metadata } from "next";
import { BurnCounter } from "@/components/BurnCounter";

export const metadata: Metadata = {
  title: "SHIB Burn Counter - House of Joshi Swap",
  description: "Track verified SHIB burns associated with the House of Joshi Swap burn program.",
  alternates: { canonical: "/burn-counter" },
};

export default function BurnCounterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300/70">Transparency dashboard</p>
        <h1 className="hoj-display mt-3 text-3xl font-semibold text-[#f4d776] sm:text-5xl">SHIB Burn Counter</h1>
        <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
          A public dashboard for SHIB permanently removed from circulation through the House of Joshi Swap burn program. On-chain tracking is being prepared; no unverified or estimated burns are included.
        </p>
      </header>

      <BurnCounter />

      <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-5 text-white/35">
        The counter is informational and does not guarantee future burns, fee allocations, token prices, or transaction frequency. All displayed totals must be independently verifiable on-chain.
      </p>
    </main>
  );
}
