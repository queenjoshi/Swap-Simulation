import type { Metadata } from "next";
import Link from "next/link";

const PDF_PATH = "/house-of-joshi-swap-whitepaper.pdf";

export const metadata: Metadata = {
  title: "Whitepaper - House of Joshi Swap",
  description:
    "Read the House of Joshi Swap technical whitepaper covering supported chains, deployed routers, native XRP Ledger support, fees, security, governance, and roadmap.",
  alternates: { canonical: "/whitepaper" },
};

export default function WhitepaperPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(145deg,rgba(212,175,55,0.09),rgba(255,255,255,0.025)_45%,rgba(0,0,0,0.18))] p-6 shadow-2xl shadow-black/20 sm:p-9">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(226,190,72,0.86)]">
          Project documentation
        </p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="hoj-display text-3xl font-semibold text-[#f4d776] sm:text-5xl">
              Technical Whitepaper
            </h1>
            <p className="mt-4 text-base leading-7 text-white/68 sm:text-lg">
              The architecture, chain deployments, native XRP Ledger integration, 1% fee model,
              wallet design, security controls, governance assumptions, and roadmap for House of
              Joshi Swap.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[linear-gradient(135deg,#e7c45b,#b78312)] px-5 py-3 text-sm font-semibold text-[#171106] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d776]"
            >
              Open PDF
            </a>
            <a
              href={PDF_PATH}
              download="House-of-Joshi-Swap-Whitepaper.pdf"
              className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/82 transition hover:border-[rgba(212,175,55,0.5)] hover:text-[#f4d776] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d776]"
            >
              Download PDF
            </a>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["11 pages", "Technical product documentation"],
          ["13 environments", "EVM networks plus native XRPL"],
          ["Transparent fees", "Current 1% House fee model"],
          ["No protocol token", "No token sale or yield promise"],
        ].map(([title, description]) => (
          <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
            <p className="hoj-display text-lg font-semibold text-[#f0cf68]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[#111114]">
        <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="hoj-display text-xl font-semibold text-white/90">Read online</h2>
            <p className="mt-1 text-sm text-white/45">Version 1.0 - August 2026</p>
          </div>
          <Link href="/terms" className="text-sm text-[#dfbd51] transition hover:text-[#f4d776]">
            Terms of Service
          </Link>
        </div>
        <object
          data={PDF_PATH}
          type="application/pdf"
          aria-label="House of Joshi Swap technical whitepaper"
          className="h-[76vh] min-h-[620px] w-full bg-[#f8f5ed]"
        >
          <div className="p-8 text-center text-white/70">
            Your browser cannot display the PDF inline.{" "}
            <a href={PDF_PATH} className="text-[#dfbd51] underline">
              Open the whitepaper PDF
            </a>
            .
          </div>
        </object>
      </section>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-white/38">
        This whitepaper is provided for technical and informational purposes only. It is not
        financial, investment, legal, tax, or accounting advice.
      </p>
    </div>
  );
}
