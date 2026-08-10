import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — House of Joshi Swap",
  description: "How House of Joshi Swap handles wallet, usage, analytics, and support information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate="August 9, 2026"
      summary="This Policy explains what information may be processed when you use House of Joshi Swap, why it is used, and the choices available to you. Public blockchains are transparent and should not be treated as private."
      sections={[
        {
          title: "Information processed",
          content: <><p><strong>Wallet and transaction information.</strong> When you connect a wallet, the interface processes the public wallet address, selected network, asset balances, token approvals, transaction requests, and public transaction identifiers needed to provide the service.</p><p><strong>Device and usage information.</strong> Hosting, security, analytics, and advertising providers may process IP address, browser and device type, operating system, referring pages, approximate location derived from IP, timestamps, pages viewed, interactions, and diagnostic events.</p><p><strong>Communications.</strong> If you contact us, we process the information you choose to provide, such as your email address, wallet address, screenshots, and support message.</p></>,
        },
        {
          title: "Public blockchain data",
          content: <p>Transactions submitted to the XRP Ledger or an EVM network are publicly visible and may permanently reveal wallet addresses, token amounts, timestamps, contract interactions, destinations, memos, and transaction status. Blockchain records are controlled by decentralized networks, not House of Joshi, and generally cannot be altered or deleted by us.</p>,
        },
        {
          title: "How information is used",
          content: <ul><li>Provide wallet connection, balances, quotes, routing, swaps, bridges, transaction status, and support.</li><li>Protect the service, detect abuse, debug errors, and maintain reliability.</li><li>Understand aggregate usage and improve features and design.</li><li>Display, measure, and manage advertising where enabled.</li><li>Comply with legal obligations and enforce our <Link href="/terms">Terms of Service</Link>.</li></ul>,
        },
        {
          title: "Wallet credentials",
          content: <p>House of Joshi does not request or store your private key or recovery phrase. Wallet connections and signatures are handled by the wallet or connection provider you select. Never send a private key or recovery phrase through the service, email, Discord, or support.</p>,
        },
        {
          title: "Cookies and local storage",
          content: <p>The site and its providers may use cookies, local storage, pixels, or similar technologies for wallet sessions, preferences, security, analytics, and advertising. Google Analytics and Google AdSense are loaded on the site and may set or read identifiers according to Google’s policies. Browser settings and applicable consent controls can be used to limit non-essential storage, although disabling storage may affect functionality.</p>,
        },
        {
          title: "Third-party recipients",
          content: <><p>Information may be sent to providers that are necessary for a feature you choose, including wallet providers, WalletConnect, Xaman, XRPL Connect, RPC and node providers, blockchain networks, liquidity and bridge protocols, token and price services, explorers, hosting and security providers, Google Analytics, and Google AdSense.</p><p>We may also disclose information when legally required, to protect users or the service, or in connection with a reorganization or transfer of the service. We do not sell private keys or recovery phrases because we never collect them.</p></>,
        },
        {
          title: "Retention",
          content: <p>We retain information only as reasonably needed for the purposes described above, legal compliance, security, dispute resolution, and support. Retention periods differ by data type and provider. Public blockchain information may remain available indefinitely even when information under our control is deleted.</p>,
        },
        {
          title: "Security",
          content: <p>We use reasonable safeguards, but no internet service, wallet integration, smart contract, or blockchain is completely secure. You are responsible for wallet security and for verifying every signature request. Contact us promptly if you believe the interface has been impersonated or compromised.</p>,
        },
        {
          title: "Your choices and rights",
          content: <p>You may disconnect your wallet, clear browser storage, block cookies, use browser privacy controls, or stop using the service. Depending on your location, you may have rights to request access, correction, deletion, restriction, objection, portability, or withdrawal of consent for information under our control. These rights may be limited where data is public on a blockchain or retention is legally required.</p>,
        },
        {
          title: "Children",
          content: <p>The service is not directed to children, and we do not knowingly collect personal information from children. If you believe a child has provided personal information, contact us so we can review and take appropriate action.</p>,
        },
        {
          title: "International processing",
          content: <p>The service and its providers may process information in countries other than your own. Those countries may have different data-protection laws. Where required, appropriate safeguards will be used for transfers under our control.</p>,
        },
        {
          title: "Policy updates and contact",
          content: <><p>We may update this Policy as the service or legal requirements change. The revised version will be posted here with a new effective date.</p><p>Privacy questions or requests may be sent to <a href="mailto:support@thehouseofjoshi.com">support@thehouseofjoshi.com</a>. Include enough detail for us to understand the request, but never include a private key or recovery phrase.</p></>,
        },
      ]}
    />
  );
}
