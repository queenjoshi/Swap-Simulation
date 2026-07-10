"use client";

import { TransactionsPanel } from "@/components/TransactionsPanel";

export function TransactionsPageClient() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          Track transactions completed through Hojswap, with direct links to each chain explorer.
        </p>
      </div>

      <TransactionsPanel variant="page" scope="swap" />
    </div>
  );
}
