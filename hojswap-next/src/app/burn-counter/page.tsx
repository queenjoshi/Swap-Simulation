import type { Metadata } from "next";
import Link from "next/link";
import { Flame, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "SHIB Burn Counter - House of Joshi Swap",
  description: "Track verified SHIB burns associated with the House of Joshi Swap burn program.",
  alternates: { canonical: "/burn-counter" },
};

export default function BurnCounterPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center px-4 py-10 sm:px-6 sm:py-14">
      <section className="relative w-full overflow-hidden rounded-[2rem] border border-orange-400/20 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.2),transparent_38%),linear-gradient(145deg,#17120f,#0d0d0f_70%)] px-5 py-14 text-center shadow-2xl shadow-black/30 sm:px-10 sm:py-20">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#d4af37]/8 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-orange-300/25 bg-orange-400/10 text-orange-300 shadow-[0_0_45px_rgba(249,115,22,0.18)] sm:h-24 sm:w-24">
            <Flame className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c85f]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Coming soon
          </div>

          <h1 className="hoj-display mt-5 text-4xl font-semibold tracking-tight text-[#f4d776] sm:text-6xl">
            SHIB Burn Counter
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-lg sm:leading-8">
            We are building a transparent dashboard for independently verifiable SHIB burns associated with House of Joshi Swap. The counter will go live after the on-chain tracking system is complete.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-left sm:p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#dfbd51]" aria-hidden="true" />
            <p className="text-xs leading-6 text-white/45 sm:text-sm">
              Only confirmed, publicly verifiable burn transactions will be displayed. No estimates or placeholder totals will be published.
            </p>
          </div>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-xl bg-[linear-gradient(135deg,#e7c45b,#b78312)] px-6 py-3 text-sm font-semibold text-[#171106] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d776]"
            >
              Return to Swap
            </Link>
            <a
              href="https://x.com/thehouseofjoshi"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-[#d4af37]/40 hover:text-[#f4d776] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d776]"
            >
              Follow Updates on X
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
