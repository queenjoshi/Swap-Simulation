"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Swap & Bridge", href: "/" },
  { label: "Prices", href: "/prices" },
  { label: "Transactions", href: "/transactions" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
  { label: "Community", href: "https://thehouseofjoshi.com", external: true },
  { label: "Contact", href: "/contact" },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Swap & Bridge",
  "/about": "About",
  "/faq": "FAQ",
  "/prices": "Prices",
  "/transactions": "Transactions",
};

function getPageTitle(location: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (path === "/" && (location === "/" || location === "")) return title;
    if (path !== "/" && location.startsWith(path)) return title;
  }
  return "House of Joshi";
}

function isActive(linkHref: string, location: string) {
  if (linkHref === "/") return location === "/" || location === "";
  return location === linkHref || location.startsWith(linkHref + "/");
}

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return <div className="h-10 w-20 rounded-full bg-white/5 sm:w-32" aria-hidden="true" />;
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="h-10 rounded-full bg-[rgba(212,175,55,0.95)] px-4 text-sm font-semibold leading-none text-black transition hover:bg-[rgba(212,175,55,0.85)]"
            >
              <span className="sm:hidden">Connect</span>
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="h-10 rounded-full bg-red-400/90 px-3 text-xs font-semibold text-black transition hover:bg-red-300 sm:px-4"
            >
              Wrong network
            </button>
          );
        }

        return (
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openChainModal}
              className="hidden h-10 items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/75 transition hover:border-[rgba(212,175,55,0.3)] hover:text-white sm:inline-flex"
            >
              {chain.name}
            </button>
            <button
              type="button"
              onClick={openAccountModal}
              className="h-10 max-w-[7.25rem] truncate rounded-full bg-[rgba(212,175,55,0.95)] px-3 text-sm font-semibold leading-none text-black transition hover:bg-[rgba(212,175,55,0.85)] sm:max-w-[10rem]"
              title={account.address}
            >
              {account.displayName || shortAddress(account.address)}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Header() {
  const location = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(11,11,13,0.84)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.png"
            alt="House of Joshi"
            className="h-8 w-8 object-contain transition group-hover:scale-105 sm:h-9 sm:w-9"
          />
          <div className="hidden sm:block">
            <span className="hoj-display block text-sm font-semibold leading-tight text-[rgba(212,175,55,0.95)]">
              House of Joshi
            </span>
            <span className="block text-[9px] text-white/35 leading-tight tracking-[0.18em] uppercase">
              Swap &amp; Bridge
            </span>
          </div>
          <span className="hoj-display text-sm font-semibold text-[rgba(212,175,55,0.95)] sm:hidden">
            HOJ
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3 py-2 text-[13px] text-white/60 transition hover:bg-white/5 hover:text-[rgba(212,175,55,0.9)]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-[13px] transition ${
                  isActive(link.href, location)
                    ? "bg-[rgba(212,175,55,0.12)] text-[rgba(212,175,55,0.95)]"
                    : "text-white/60 hover:bg-white/5 hover:text-[rgba(212,175,55,0.9)]"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:hidden">
          <span className="hidden text-[13px] text-white/40 min-[380px]:inline">{getPageTitle(location)}</span>
        </div>

        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-[rgba(212,175,55,0.3)] hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/8 bg-[rgba(11,11,13,0.98)] px-4 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white/65 hover:bg-white/5 hover:text-[rgba(212,175,55,0.9)]"
              >
                {link.label} <span className="text-white/30">↗</span>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-3 py-3 text-sm transition ${
                  isActive(link.href, location)
                    ? "text-[rgba(212,175,55,0.95)]"
                    : "text-white/65 hover:bg-white/5 hover:text-[rgba(212,175,55,0.9)]"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
      )}
    </header>
  );
}
