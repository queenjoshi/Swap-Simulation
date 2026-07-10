import { Suspense } from "react";
import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-14">
      <div className="w-full max-w-[520px]">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Trade from the House.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50">
            Trade and bridge HOJ community tokens across supported chains with a House of Joshi finish.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
          <SwapCard />
        </Suspense>
      </div>
    </div>
  );
}
