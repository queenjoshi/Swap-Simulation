import { Suspense } from "react";
import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center overflow-hidden px-3 pb-8 pt-6 sm:px-4 sm:pb-12 sm:pt-10">
      <div className="relative w-full max-w-[500px]">
        <div className="mb-5 text-center sm:mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(212,175,55,0.86)]">
            House of Joshi
          </p>
          <h1 className="text-4xl font-semibold leading-[1.03] text-white sm:text-5xl">
            Swap from<br className="sm:hidden" /> the House.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
            Simple swaps, bridge access, and House Guide checks in one clean flow.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
          <SwapCard />
        </Suspense>
      </div>
    </div>
  );
}
