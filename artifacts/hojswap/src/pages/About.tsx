import { Link } from "wouter";

type Token = {
  symbol: string;
  name: string;
  logo?: string;
};

const HOUSE_LOGO = "/logo.png";

const tokenGroups: Array<{ title: string; eyebrow: string; tokens: Token[] }> = [
  {
    title: "Base Community",
    eyebrow: "Base",
    tokens: [
      { symbol: "QUEENJOSHI", name: "Queen Joshi", logo: HOUSE_LOGO },
      { symbol: "KINGJOSHI", name: "King Joshi", logo: HOUSE_LOGO },
      { symbol: "AERO", name: "Aerodrome Finance", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x940181a94A35A4569E4529A3CDfB74e38FD98631/logo.png" },
      { symbol: "BRETT", name: "Brett", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x532f27101965dd16442E59d40670FaF5eBB142E4/logo.png" },
      { symbol: "MOG", name: "Mog Coin", logo: "/tokens/mog.png" },
      { symbol: "TOSHI", name: "Toshi", logo: "/tokens/toshi.png" },
    ],
  },
  {
    title: "Ethereum Tokens",
    eyebrow: "Ethereum",
    tokens: [
      { symbol: "SHIB", name: "Shiba Inu", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/logo.png" },
      { symbol: "BONE", name: "Bone ShibaSwap", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9813037ee2218799597d83D4a5B6F3b6778218d9/logo.png" },
      { symbol: "TREAT", name: "Treat146b", logo: "/tokens/treat146b.png" },
      { symbol: "OSCAR", name: "Oscar", logo: "/tokens/oscar.png" },
      { symbol: "BNB", name: "Binance Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB8c77482e45F1F44dE1745F52C74426C631bDD52/logo.png" },
      { symbol: "MAME", name: "Mame Inu", logo: "/tokens/mame-inu.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
      { symbol: "DAI", name: "Dai Stablecoin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png" },
      { symbol: "LINK", name: "Chainlink", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png" },
      { symbol: "UNI", name: "Uniswap", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png" },
      { symbol: "AAVE", name: "Aave", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png" },
      { symbol: "PEPE", name: "Pepe", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6982508145454Ce325dDbE47a25d4ec3d2311933/logo.png" },
      { symbol: "FLOKI", name: "FLOKI", logo: "/tokens/floki.png" },
    ],
  },
  {
    title: "Bridgeable Assets",
    eyebrow: "All chains",
    tokens: [
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
    ],
  },
  {
    title: "Polygon",
    eyebrow: "Polygon",
    tokens: [
      { symbol: "POL", name: "Polygon Ecosystem Token", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x3c499c542cef5e3811e1192ce70d8cc03d5c3359/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png" },
      { symbol: "WBTC", name: "Wrapped BTC", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x1BFD62B7D66453f26932296AB7c5409E839A7656/logo.png" },
    ],
  },
  {
    title: "BNB Chain",
    eyebrow: "BNB Chain",
    tokens: [
      { symbol: "BNB", name: "Binance Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
      { symbol: "USDT", name: "Tether USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x55d398326f99059fF775485246999027B3197955/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x8AC76a51cc950d9822D68b83FE1Ad97B32Cd580d/logo.png" },
      { symbol: "FDUSD", name: "First Digital USD", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xc5f0f7b66764F6ec8C8Dff7BA684102245B16472/logo.png" },
      { symbol: "CAKE", name: "PancakeSwap Token", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x0E09FaBB73Bd3Ade0A17ECC321fD13a19E81cE82/logo.png" },
      { symbol: "BabyDoge", name: "Baby Doge Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xc748673057861a797275CD8A068AbB95A902e8de/logo.png" },
    ],
  },
  {
    title: "Arbitrum",
    eyebrow: "Arbitrum",
    tokens: [
      { symbol: "ARB", name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png" },
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xaf88d065e77c8cC2239327C5EDb3A432268e5831/logo.png" },
      { symbol: "GMX", name: "GMX", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a/logo.png" },
      { symbol: "MAGIC", name: "MAGIC", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x539bdE0d7Dbd336b79148AA742883198BBF60342/logo.png" },
    ],
  },
  {
    title: "Optimism",
    eyebrow: "Optimism",
    tokens: [
      { symbol: "OP", name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x4200000000000000000000000000000000000042/logo.png" },
      { symbol: "ETH", name: "Ether", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
      { symbol: "USDC", name: "USD Coin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x0b2C639c533813f4Aa9D7837CAe62653423a6504/logo.png" },
      { symbol: "VELO", name: "Velodrome", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db/logo.png" },
    ],
  },
  {
    title: "Chain-Native",
    eyebrow: "Cronos & XRP",
    tokens: [
      { symbol: "CRO", name: "Cronos", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png" },
      { symbol: "XRP", name: "XRP", logo: "/tokens/xrp.png" },
      { symbol: "KIND", name: "Kindred", logo: HOUSE_LOGO },
      { symbol: "NBAA", name: "NBAA", logo: HOUSE_LOGO },
      { symbol: "POL", name: "Polygon", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
      { symbol: "BNB", name: "BNB Chain", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
      { symbol: "ARB", name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png" },
      { symbol: "OP", name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/0x4200000000000000000000000000000000000042/logo.png" },
    ],
  },
];

const networks = [
  { name: "Ethereum", badge: "Swap + Bridge", desc: "Deep liquidity for SHIB, BONE, TREAT, OSCAR, BNB, MAME, WETH, DAI, LINK, UNI, AAVE, PEPE, FLOKI, USDC, USDT, and ETH." },
  { name: "Base", badge: "Swap + Bridge", desc: "Home for QUEENJOSHI, KINGJOSHI, AERO, BRETT, MOG, and TOSHI with faster, lower-cost trading." },
  { name: "Polygon", badge: "Swap", desc: "POL, WETH, WBTC, USDC, and USDT routed through 0x liquidity." },
  { name: "BNB Chain", badge: "Swap", desc: "BNB, USDT, USDC, FDUSD, CAKE, and BabyDoge through 0x liquidity." },
  { name: "Arbitrum", badge: "Swap", desc: "ARB, ETH, USDC, GMX, and MAGIC across Ethereum L2 liquidity." },
  { name: "Optimism", badge: "Swap", desc: "OP, ETH, USDC, and VELO across Ethereum L2 liquidity." },
  { name: "Cronos", badge: "Bridge", desc: "USDC, USDT, and ETH routes via Li.Fi between Ethereum, Base, and Cronos." },
  { name: "XRP Ledger EVM", badge: "Coming Soon", desc: "Listed for network continuity while swap and bridge routes mature." },
];

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <section className="mb-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.07)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.82)]">
            Swap &amp; Bridge
          </div>
          <h1 className="hoj-display max-w-2xl text-3xl font-semibold leading-tight text-[rgba(212,175,55,0.96)] sm:text-4xl">
            House of Joshi across every chain that matters.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
            Trade community tokens, blue-chip assets, stablecoins, and chain-native coins across 8 supported networks from one non-custodial interface.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="rounded-2xl bg-[rgba(212,175,55,0.95)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)]">
              Start Swapping
            </Link>
            <Link href="/prices" className="rounded-2xl border border-[rgba(212,175,55,0.35)] px-5 py-2.5 text-sm font-medium text-[rgba(212,175,55,0.9)] transition hover:bg-[rgba(212,175,55,0.08)]">
              View Prices
            </Link>
          </div>
        </div>

        <div className="hoj-panel rounded-2xl p-5">
          <div className="mb-5 flex items-center gap-4">
            <img src="/logo.png" alt="House of Joshi" className="h-16 w-16 rounded-2xl object-contain" />
            <div>
              <div className="text-sm font-semibold text-white/90">HOJ Swap &amp; Bridge</div>
              <div className="text-xs text-white/50">Non-custodial trading with in-app route execution.</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "8", label: "Supported chains" },
              { value: "46", label: "Shown assets" },
              { value: "1%", label: "House fee" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                <div className="text-xl font-semibold text-[rgba(212,175,55,0.92)]">{item.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        {[
          { title: "Best route", desc: "0x aggregates swap liquidity across major DEX sources." },
          { title: "Bridge inside the app", desc: "Stargate and Li.Fi routes keep transfers in one flow." },
          { title: "Wallet-first", desc: "You sign every transaction directly from your own wallet." },
        ].map((item) => (
          <div key={item.title} className="hoj-panel rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white/90">{item.title}</h2>
            <p className="mt-2 text-xs leading-6 text-white/55">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <SectionHeading
          eyebrow="Supported tokens"
          title="Logo-first token coverage"
          desc="Token groups are organized by chain so users can quickly see every configured asset on Base, Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, Cronos, and XRP."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {tokenGroups.map((group) => (
            <div key={group.title} className="hoj-panel rounded-2xl p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.65)]">{group.eyebrow}</div>
                  <h3 className="mt-1 text-base font-semibold text-white/90">{group.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/45">{group.tokens.length} assets</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.tokens.map((token) => (
                  <TokenTile key={`${group.title}-${token.symbol}`} {...token} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeading
          eyebrow="Supported networks"
          title="Clear routes by chain"
          desc="Each network shows what users can do today, with bridge-only and coming-soon states separated from active swap routes."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {networks.map((network) => (
            <div key={network.name} className="hoj-panel rounded-2xl p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white/90">{network.name}</h3>
                <span className="shrink-0 rounded-full border border-[rgba(212,175,55,0.3)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[rgba(212,175,55,0.75)]">{network.badge}</span>
              </div>
              <p className="text-xs leading-6 text-white/54">{network.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="hoj-panel rounded-2xl p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.65)]">How it works</div>
          <h2 className="mt-2 text-lg font-semibold text-white/90">Three actions, one route.</h2>
          <p className="mt-3 text-sm leading-7 text-white/58">
            Connect a wallet, choose tokens and chains, then confirm the quote. The app handles routing, fee display, and transaction history.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { step: "1", title: "Connect", desc: "Use MetaMask, Rabby, Coinbase Wallet, Trust Wallet, or WalletConnect." },
            { step: "2", title: "Route", desc: "Pick a swap or bridge path and review slippage, fees, and outputs." },
            { step: "3", title: "Confirm", desc: "Sign from your wallet and track the transaction in-app." },
          ].map((item) => (
            <div key={item.step} className="hoj-panel rounded-2xl p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(212,175,55,0.15)] text-sm font-bold text-[rgba(212,175,55,0.9)]">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-white/90">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-white/52">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.055)] p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="hoj-display text-lg font-semibold text-[rgba(212,175,55,0.92)]">Ready to trade?</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">
              A 1% house fee applies to swaps and bridges, supporting the House of Joshi treasury and ongoing development.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-2xl bg-[rgba(212,175,55,0.95)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)]">
              Open Swap
            </Link>
            <a href="https://thehouseofjoshi.com/contact" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[rgba(212,175,55,0.35)] px-5 py-2.5 text-sm font-medium text-[rgba(212,175,55,0.9)] transition hover:bg-[rgba(212,175,55,0.08)]">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-5 max-w-2xl">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.65)]">{eyebrow}</div>
      <h2 className="hoj-display mt-2 text-xl font-semibold text-[rgba(212,175,55,0.92)]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/56">{desc}</p>
    </div>
  );
}

function TokenTile({ symbol, name, logo }: Token) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] text-[11px] font-bold text-[rgba(212,175,55,0.9)]">
        <span>{symbol.slice(0, 4)}</span>
        {logo ? <img src={logo} alt={`${symbol} logo`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : null}
      </div>
      <div className="mt-3 w-full truncate text-sm font-semibold text-white/90" title={symbol}>{symbol}</div>
      <div className="mt-1 w-full truncate text-[11px] text-white/45" title={name}>{name}</div>
    </div>
  );
}
