import type { Metadata } from "next";
import Link from "next/link";
import { HowToSwap } from "@/components/HowToSwap";

export const metadata: Metadata = {
  title: "How to Swap — House of Joshi",
  description: "A simple step-by-step guide to swapping supported tokens with HOJSwap.",
};

export default function HowToSwapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.07)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.82)]">
          Easy guide
        </div>
        <h1 className="hoj-display text-3xl font-semibold text-[rgba(212,175,55,0.95)] sm:text-4xl">
          How to use HOJSwap
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60">
          Connect, choose your tokens, review the quote, and confirm—all while keeping control of your wallet.
        </p>
      </div>

      <HowToSwap expanded />

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex rounded-2xl bg-[rgba(212,175,55,0.95)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)]"
        >
          Open Swap
        </Link>
      </div>
    </div>
  );
}
