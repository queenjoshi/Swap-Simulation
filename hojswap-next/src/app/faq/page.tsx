import type { Metadata } from "next";
import Link from "next/link";

const faqs = [
  {
    question: "What is Hojswap?",
    answer:
      "Hojswap is a House of Joshi swap and bridge interface for trading supported tokens across Ethereum, Base, Polygon, BNB Chain, Arbitrum, Optimism, Avalanche, Unichain, Cronos, and XRP EVM.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. Hojswap is wallet-first. Connect your wallet, choose a chain, select the tokens, and approve or sign transactions directly from your wallet.",
  },
  {
    question: "Which chains are supported?",
    answer:
      "The app lists Ethereum, Base, Cronos, XRP EVM, Polygon, BNB Chain, Arbitrum, Optimism, Avalanche, and Unichain. Swap availability depends on routing support and liquidity for each chain.",
  },
  {
    question: "Why do some chains show bridge instead of swap?",
    answer:
      "Some networks may not have direct swap routing available in the app yet. When swap routing is not supported, the interface guides users toward the bridge flow instead.",
  },
  {
    question: "What is the House fee?",
    answer:
      "Hojswap shows a 1% House fee on swaps. The fee is displayed before submitting a transaction so users can review the cost before confirming.",
  },
  {
    question: "Where do the swap prices come from?",
    answer:
      "Swap quotes are routed through 0x where supported. Bridge routes use integrated bridge providers such as Stargate and Li.Fi where available.",
  },
  {
    question: "Why do I need to approve a token?",
    answer:
      "ERC-20 tokens require approval before a contract or swap route can spend them. Native tokens like ETH do not need ERC-20 approval.",
  },
  {
    question: "Where can I see my transactions?",
    answer:
      "Use the Transactions page to see Hojswap-related transaction activity with direct links to each chain explorer.",
  },
  {
    question: "Can I list a token?",
    answer:
      "Token listing and partnership requests can be sent through the Contact page or the House of Joshi community channels.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Hojswap is a trading interface. Always verify token addresses, review quotes carefully, and make your own decisions before signing transactions.",
  },
];

export const metadata: Metadata = {
  title: "FAQ - House of Joshi",
  description: "Answers to common questions about Hojswap swaps, bridges, fees, approvals, and transactions.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.07)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.82)]">
          FAQ
        </div>
        <h1 className="hoj-display text-3xl font-semibold text-[rgba(212,175,55,0.95)] sm:text-4xl">
          Questions before entering the House.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60">
          Quick answers for swaps, bridges, fees, approvals, transaction links, and supported networks.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 transition open:border-[rgba(212,175,55,0.28)] open:bg-[rgba(212,175,55,0.06)] sm:px-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white/90">
              <span>{item.question}</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-[rgba(212,175,55,0.85)] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.05)] p-5 text-center">
        <h2 className="text-sm font-semibold text-white/90">Still need help?</h2>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-white/55">
          Reach the House of Joshi team for listings, support, or bridge questions.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-2xl bg-[rgba(212,175,55,0.95)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)]"
          >
            Contact
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-[rgba(212,175,55,0.35)] px-5 py-2.5 text-sm font-medium text-[rgba(212,175,55,0.9)] transition hover:bg-[rgba(212,175,55,0.08)]"
          >
            Open Swap
          </Link>
        </div>
      </div>
    </div>
  );
}
