import Image from "next/image";
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "X / Twitter",
    href: "https://x.com/thehouseofjoshi",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com/invite/uH9zVeAwDu",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thehouseofjoshi",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:support@thehouseofjoshi.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

const PROTOCOL_LINKS = [
  { label: "0x Protocol", href: "https://0x.org/" },
  { label: "Jupiter", href: "https://jup.ag/" },
  { label: "XRP Ledger", href: "https://xrpl.org/" },
  { label: "Stargate V2 (LayerZero)", href: "https://stargate.finance/" },
  { label: "Li.Fi Bridge", href: "https://li.fi/" },
  { label: "RainbowKit", href: "https://rainbowkit.com/" },
  { label: "Wagmi", href: "https://wagmi.sh/" },
];

const PRODUCT_LINKS = [
  { label: "Dreamweaver", href: "https://dreamweaver.thehouseofjoshi.com/" },
  { label: "Kingdom Within", href: "https://kingdomwithin.thehouseofjoshi.com/" },
  { label: "NFT Marketplace", href: "https://nftmarketplace.thehouseofjoshi.com/" },
];

const HOUSE_LINKS = [
  { label: "Website", href: "https://thehouseofjoshi.com", external: true },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "Burn Counter", href: "/burn-counter" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="House of Joshi footer"
      className="border-t border-[rgba(212,175,55,0.14)] bg-[linear-gradient(180deg,#0d0d0f_0%,#070708_100%)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-5 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="House of Joshi"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
              <p className="hoj-display text-base font-semibold text-[rgba(226,190,72,0.95)]">
                House of Joshi
              </p>
              <p className="text-xs text-white/45">Swap & Bridge with House Guide checks.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={link.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.08)] hover:text-[rgba(226,190,72,0.95)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(226,190,72,0.95)]"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-7 sm:grid-cols-3 sm:gap-8">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-white/42">House</h3>
            <ul className="space-y-2.5">
              {HOUSE_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/58 transition hover:text-[rgba(226,190,72,0.95)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(226,190,72,0.95)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-white/58 transition hover:text-[rgba(226,190,72,0.95)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(226,190,72,0.95)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-white/42">Products</h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/58 transition hover:text-[rgba(226,190,72,0.95)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(226,190,72,0.95)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="mb-3 text-xs font-semibold uppercase text-white/42">Protocol</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:block sm:space-y-2.5">
              {PROTOCOL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/58 transition hover:text-[rgba(226,190,72,0.95)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(226,190,72,0.95)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 pt-4 text-xs leading-relaxed text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} The House of Joshi. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/terms" className="transition hover:text-[rgba(226,190,72,0.95)]">Terms of Service</Link>
            <Link href="/privacy" className="transition hover:text-[rgba(226,190,72,0.95)]">Privacy Policy</Link>
            <span>Verify tokens before swapping. Not financial advice.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
