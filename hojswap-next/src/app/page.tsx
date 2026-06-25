import { Suspense } from "react";
import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Swap & Bridge</h1>
        </div>
        <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
          <SwapCard />
        </Suspense>
      </div>
    </div>
  );
}
