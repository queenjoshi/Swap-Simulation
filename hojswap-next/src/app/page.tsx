import { Suspense } from "react";
import Link from "next/link";
import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center overflow-x-hidden px-2 pb-7 pt-3 min-[380px]:px-2.5 sm:px-4 sm:pb-10 sm:pt-7 lg:pt-8">
      <div className="relative min-w-0 w-full max-w-[470px]">
        <div className="mb-4 text-center sm:mb-5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(212,175,55,0.86)] sm:text-[11px]">
            House of Joshi
          </p>
          <h1 className="text-[2rem] font-semibold leading-[1.04] text-white sm:text-[2.65rem]">
            Swap from<br className="sm:hidden" /> the House.
          </h1>
          <p className="mx-auto mt-2 max-w-sm px-2 text-xs leading-relaxed text-white/50 sm:mt-2.5 sm:text-sm">
            Simple swaps, bridge access, and House Guide checks in one clean flow.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
          <SwapCard />
        </Suspense>
        <div className="mx-auto mt-4 max-w-[450px] px-2 text-center text-[10px] leading-4 text-white/38 sm:text-[11px] sm:leading-5">
          <p>Digital assets are risky. House of Joshi is not responsible for any loss or gain.</p>
          <p className="mt-1">
            Anyone can request a token listing.{" "}
            <Link href="/contact" className="font-semibold text-[rgba(212,175,55,0.82)] underline decoration-[rgba(212,175,55,0.35)] underline-offset-2 hover:text-[rgba(255,222,85,0.95)]">
              Contact us to add your token.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
