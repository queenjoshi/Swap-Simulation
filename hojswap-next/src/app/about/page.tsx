import Link from "next/link";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-12 text-center">
        <img src="/logo.png" alt="House of Joshi" className="mx-auto mb-6 h-24 w-24 object-contain" />
        <h1 className="hoj-display text-2xl font-semibold text-[rgba(212,175,55,0.95)] sm:text-3xl">
          House of Joshi — Swap &amp; Bridge
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65">
          The <strong className="text-white/85">House of Joshi</strong> is a decentralised
          token exchange and cross-chain bridge built for the HOJ community. Trade and bridge
          ETH, USDC, USDT, SHIB, BONE, TREAT, OSCAR, BNB, MAME, WETH, DAI, LINK, UNI, AAVE, PEPE, FLOKI, BRETT, and Base community tokens across 8 supported networks — directly from your
          wallet, with no custodian and no sign-up required.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="hoj-display mb-4 text-base font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.8)]">
          What is HOJ Swap &amp; Bridge?
        </h2>
        <div className="hoj-panel rounded-2xl p-5 text-sm leading-relaxed text-white/70 space-y-3">
          <p>
            HOJ Swap &amp; Bridge is the official trading and bridging interface for the House of Joshi
            ecosystem. The <strong className="text-white/85">Swap</strong> feature connects directly to the{" "}
            <a href="https://0x.org" target="_blank" rel="noopener noreferrer" className="text-[rgba(212,175,55,0.85)] hover:underline">
              0x Protocol
            </a>
            , routing trades through the best available on-chain liquidity — across Uniswap,
            Curve, and dozens of other sources.
          </p>
          <p>
            The <strong className="text-white/85">Bridge</strong> feature offers real in-app cross-chain bridging on all supported routes.
            Between <strong className="text-white/85">Ethereum and Base</strong> it uses{" "}
            <a href="https://stargate.finance" target="_blank" rel="noopener noreferrer" className="text-[rgba(212,175,55,0.85)] hover:underline">
              Stargate V2 (LayerZero)
            </a>{" "}
            to move USDC and ETH trustlessly. Between <strong className="text-white/85">Ethereum / Base and Cronos</strong> it routes
            through{" "}
            <a href="https://li.fi" target="_blank" rel="noopener noreferrer" className="text-[rgba(212,175,55,0.85)] hover:underline">
              Li.Fi
            </a>{" "}
            (cBridge / Connext) for the best available rate. XRP EVM bridging is not yet supported by any major
            bridge aggregator and will be added when a reliable protocol becomes available.
          </p>
          <p>
            A <strong className="text-white/85">1% House Fee</strong> is applied to every swap and bridge,
            sent directly to the House of Joshi treasury to support the community and its ongoing development.
          </p>
          <p>
            Fully non-custodial. Your wallet is never exposed to a third party — all transactions are
            signed directly in your browser using MetaMask, Rabby, Coinbase Wallet, Trust Wallet, or
            any WalletConnect-compatible mobile wallet.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="hoj-display mb-4 text-base font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.8)]">
          Supported Tokens
        </h2>
        <div className="space-y-3">
          <div className="hoj-panel rounded-2xl p-4">
            <div className="mb-3 text-[11px] uppercase tracking-widest text-[rgba(212,175,55,0.7)]">Base</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { symbol: "QUEENJOSHI", name: "Queen Joshi", logo: "/logo.png" },
                { symbol: "KINGJOSHI", name: "King Joshi", logo: "/logo.png" },
                { symbol: "AERO", name: "Aerodrome Finance", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x940181a94A35A4569E4529A3CDfB74e38FD98631/logo.png" },
                { symbol: "BRETT", name: "Brett", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x532f27101965dd16442E59d40670FaF5eBB142E4/logo.png" },
                { symbol: "MOG", name: "Mog Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x2Da56AcB9Ea78330F947bD57C54119Debda7AF71/logo.png" },
                { symbol: "TOSHI", name: "Toshi", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2b4/logo.png" },
              ].map((t) => <TokenRow key={t.symbol} {...t} />)}
            </div>
          </div>
          <div className="hoj-panel rounded-2xl p-4">
            <div className="mb-3 text-[11px] uppercase tracking-widest text-[rgba(212,175,55,0.7)]"> Ethereum</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { symbol: "SHIB", name: "Shiba Inu", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/logo.png" },
                { symbol: "BONE", name: "Bone ShibaSwap", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9813037ee2218799597d83D4a5B6F3b6778218d9/logo.png" },
                { symbol: "TREAT", name: "Treat146b" },
                { symbol: "OSCAR", name: "Oscar" },
                { symbol: "BNB", name: "Binance Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB8c77482e45F1F44dE1745F52C74426C631bDD52/logo.png" },
                { symbol: "MAME", name: "Mame Inu" },
                { symbol: "WETH", name: "Wrapped Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
                { symbol: "DAI", name: "Dai Stablecoin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
                { symbol: "LINK", name: "Chainlink", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png" },
                { symbol: "UNI", name: "Uniswap", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png" },
                { symbol: "AAVE", name: "Aave", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png" },
                { symbol: "PEPE", name: "Pepe", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6982508145454Ce325dDbE47a25d4ec3d2311933/logo.png" },
                { symbol: "FLOKI", name: "FLOKI", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xcf0c122c6b73ff809c693db761e7baebe62b6a2e/logo.png" },
              ].map((t) => <TokenRow key={t.symbol} {...t} />)}
            </div>
          </div>
          <div className="hoj-panel rounded-2xl p-4">
            <div className="mb-3 text-[11px] uppercase tracking-widest text-[rgba(212,175,55,0.7)]">Stablecoins &amp; Bridgeable — All Chains</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
                { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
                { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
              ].map((t) => <TokenRow key={t.symbol} {...t} />)}
            </div>
          </div>
          <div className="hoj-panel rounded-2xl p-4">
            <div className="mb-3 text-[11px] uppercase tracking-widest text-[rgba(212,175,55,0.7)]">Chain-Native Tokens</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { symbol: "CRO", name: "Cronos", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png" },
                { symbol: "XRP", name: "XRP", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xrp/info/logo.png" },
                { symbol: "KIND", name: "Kindred" },
                { symbol: "NBAA", name: "NBAA" },
                { symbol: "POL", name: "Polygon", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
                { symbol: "BNB", name: "BNB Chain", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
                { symbol: "ARB", name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png" },
                { symbol: "OP", name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x4200000000000000000000000000000000000042/logo.png" },
              ].map((t) => <TokenRow key={t.symbol} {...t} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="hoj-display mb-4 text-base font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.8)]">
          Supported Networks
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "Ethereum", badge: "Swap + Bridge", desc: "Home chain for SHIB, BONE, TREAT, OSCAR, BNB, MAME, WETH, DAI, LINK, UNI, AAVE, PEPE, FLOKI, USDC, USDT, and ETH. Bridge to Base (Stargate V2) or Cronos (Li.Fi) directly in-app." },
            { name: "Base", badge: "Swap + Bridge", desc: "Coinbase's L2 — home of QUEENJOSHI, KINGJOSHI, AERO, BRETT, MOG, and TOSHI. Lower fees, faster confirmations. Bridge to Ethereum (Stargate V2) or Cronos (Li.Fi) directly in-app." },
            { name: "Polygon", badge: "Swap", desc: "High-throughput EVM chain. Swap POL, WETH, WBTC, USDC, and USDT through 0x liquidity." },
            { name: "BNB Chain", badge: "Swap", desc: "Binance's EVM chain. Swap BNB, USDT, USDC, FDUSD, CAKE, and BabyDoge through 0x liquidity." },
            { name: "Arbitrum", badge: "Swap", desc: "Ethereum L2 for scaling. Swap ARB, ETH, USDC, GMX, and MAGIC through 0x liquidity." },
            { name: "Optimism", badge: "Swap", desc: "Ethereum L2 for scaling. Swap OP, ETH, USDC, and VELO through 0x liquidity." },
            { name: "Cronos", badge: "Bridge", desc: "High-throughput EVM chain. Bridge USDC/USDT/ETH to Ethereum or Base via Li.Fi — fully in-app, no redirects." },
            { name: "XRP Ledger EVM", badge: "Coming Soon", desc: "XRP's EVM sidechain is listed for network continuity. In-app swap and bridge routes will expand as reliable liquidity and bridge support become available." },
          ].map((c) => (
            <div key={c.name} className="hoj-panel rounded-2xl p-4">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white/90">{c.name}</h3>
                <span className="rounded-full border border-[rgba(212,175,55,0.3)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[rgba(212,175,55,0.7)]">{c.badge}</span>
              </div>
              <p className="text-xs leading-relaxed text-white/55">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="hoj-display mb-4 text-base font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.8)]">
          How it Works
        </h2>
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          {[
            { step: "1", title: "Connect Wallet", desc: "Connect MetaMask, Rabby, Coinbase Wallet, Trust Wallet, or any WalletConnect-compatible mobile wallet." },
            { step: "2", title: "Choose Tokens &amp; Chains", desc: "Select which token to sell (or bridge) and the destination. Adjust slippage if needed." },
            { step: "3", title: "Confirm &amp; Execute", desc: "Review the 0x or Stargate quote — including route, fees, and price impact — then confirm in your wallet." },
          ].map((s) => (
            <div key={s.step} className="hoj-panel rounded-2xl p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(212,175,55,0.15)] text-sm font-bold text-[rgba(212,175,55,0.9)]">
                {s.step}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white/90" dangerouslySetInnerHTML={{ __html: s.title }} />
              <p className="text-xs leading-relaxed text-white/55">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="hoj-panel rounded-2xl p-4 text-xs text-white/55 space-y-1.5">
          <p><strong className="text-white/75">Swapping</strong> — powered by 0x Protocol. Best price across all major DEXes on Ethereum, Base, Polygon, BNB Chain, Arbitrum, and Optimism. 1% house fee included in the quote.</p>
          <p><strong className="text-white/75">Bridging (Ethereum ↔ Base)</strong> — powered by Stargate V2 (LayerZero). Transfers USDC or ETH trustlessly. Requires a small LayerZero messaging fee paid in ETH, plus 1% house fee.</p>
          <p><strong className="text-white/75">Bridging (Multi-chain)</strong> — powered by Li.Fi (cBridge / Connext). Routes USDC, USDT, or ETH between Ethereum, Base, and Cronos entirely in-app. Live quote fetched before each bridge, 1% house fee applies.</p>
          <p><strong className="text-white/75">Bridging (XRP EVM)</strong> — coming soon. No major bridge aggregator supports the XRP EVM sidechain yet. Swap on XRP EVM is fully available in the meantime.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] p-6 text-center">
        <h2 className="hoj-display mb-2 text-base font-semibold text-[rgba(212,175,55,0.9)]">Ready to trade?</h2>
        <p className="mb-4 text-sm text-white/60">Connect your wallet and swap or bridge in seconds.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-[rgba(212,175,55,0.95)] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[rgba(212,175,55,0.85)] transition"
          >
            Start Swapping
          </Link>
          <Link
            href="/contact"
            className="rounded-2xl border border-[rgba(212,175,55,0.35)] px-6 py-2.5 text-sm font-medium text-[rgba(212,175,55,0.9)] hover:bg-[rgba(212,175,55,0.08)] transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}

function TokenRow({ symbol, name, logo }: { symbol: string; name: string; logo?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] text-[10px] font-bold text-[rgba(212,175,55,0.9)]">
        <span>{symbol.slice(0, 4)}</span>
        {logo ? (
          <img
            src={logo}
            alt={`${symbol} logo`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
      <div>
        <div className="text-sm font-semibold text-white/90">{symbol}</div>
        <div className="text-[11px] text-white/45">{name}</div>
      </div>
    </div>
  );
}
