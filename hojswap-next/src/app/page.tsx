import { Suspense } from "react";
import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
        <SwapCard />
      </Suspense>
    </div>
  );
}
