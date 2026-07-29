const steps = [
  {
    number: "01",
    title: "Connect your wallet",
    description: "Open HOJSwap and connect the wallet that holds the tokens you want to use.",
  },
  {
    number: "02",
    title: "Choose the network",
    description: "Select the token’s real network, such as Base, Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, or Avalanche.",
  },
  {
    number: "03",
    title: "Choose your tokens",
    description: "Pick the token you want to pay with and the token you want to receive. You can search by name, symbol, or contract address.",
  },
  {
    number: "04",
    title: "Enter an amount",
    description: "Enter how much you want to swap, then review the rate, network fee, House fee, and minimum received.",
  },
  {
    number: "05",
    title: "Approve and swap",
    description: "Approve the token if your wallet asks, press Swap, and confirm the transaction in your wallet.",
  },
  {
    number: "06",
    title: "You’re done",
    description: "Your new tokens will appear after the network confirms the transaction. Track it from the Transactions page.",
  },
];

export function HowToSwap({ expanded = false }: { expanded?: boolean }) {
  return (
    <section className="mt-7 w-full" aria-labelledby="how-to-swap-title">
      <details open={expanded} className="group overflow-hidden rounded-[26px] border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.045)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(212,175,55,0.72)]">
              New to HOJSwap?
            </span>
            <span id="how-to-swap-title" className="mt-1 block text-base font-semibold text-white/90">
              How to swap any supported token
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(212,175,55,0.25)] text-lg text-[rgba(212,175,55,0.9)] transition group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-white/8 px-4 pb-5 pt-4 sm:px-5">
          <div className="space-y-2.5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-3 rounded-2xl border border-white/8 bg-black/20 p-3.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(212,175,55,0.12)] text-[10px] font-bold text-[rgba(212,175,55,0.9)]">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white/88">{step.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/48">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3">
            <p className="text-xs leading-5 text-amber-100/65">
              Keep a little native currency for gas—such as ETH, BNB, POL, or AVAX. Always verify the network and contract address. Swap availability depends on live liquidity; Zora Network tokens are currently discovery-only.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
