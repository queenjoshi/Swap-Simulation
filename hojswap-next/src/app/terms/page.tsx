import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — House of Joshi Swap",
  description: "Terms governing use of the House of Joshi non-custodial swap and bridge interface.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      effectiveDate="August 9, 2026"
      summary="These Terms govern your access to House of Joshi Swap. By connecting a wallet or using the interface, you agree to these Terms. If you do not agree, do not use the service."
      sections={[
        {
          title: "The service",
          content: <p>House of Joshi Swap provides a non-custodial interface that helps users discover quotes and submit transactions to public blockchain networks and third-party protocols. We do not operate the underlying networks, liquidity pools, bridges, tokens, wallets, or third-party protocols, and we do not guarantee that any route or transaction will be available or completed.</p>,
        },
        {
          title: "Non-custodial use",
          content: <><p>You remain solely responsible for your wallet, private keys, recovery phrase, assets, approvals, and transactions. We cannot access, freeze, reverse, recover, or return assets controlled by your wallet.</p><p>Always review the network, token contract or XRPL issuer, destination, amounts, price impact, slippage, fees, and wallet request before signing.</p></>,
        },
        {
          title: "Eligibility and lawful use",
          content: <><p>You may use the service only if you can legally enter into these Terms and your use is lawful where you are located. You must not use the service to violate sanctions, anti-money-laundering rules, intellectual-property rights, security laws, or any other applicable law.</p><p>You must not interfere with the service, bypass access controls, introduce malicious code, manipulate quotes, abuse infrastructure, or use the service for fraud, theft, market manipulation, or other unlawful conduct.</p></>,
        },
        {
          title: "Quotes, routes, and transactions",
          content: <><p>Quotes are estimates and may change before execution. Blockchain congestion, liquidity, gas, slippage, price movement, MEV, token taxes, issuer settings, bridge conditions, and third-party failures can change the result or cause a transaction to fail.</p><p>A submitted blockchain transaction may be final and irreversible. Displaying a token, route, price, logo, trend, or third-party protocol is not an endorsement, listing guarantee, or statement that it is safe or legitimate.</p></>,
        },
        {
          title: "Fees",
          content: <><p>The interface displays applicable House fees before you authorize them. Native XRP Ledger swaps currently request a separate <strong>1% House fee in XRP after the swap validates</strong>. Network fees, liquidity-provider fees, bridge fees, wallet fees, token taxes, and other third-party charges may also apply.</p><p>Fees and fee mechanics may change prospectively. The transaction presented by your wallet is the final record you must review before approval.</p></>,
        },
        {
          title: "Third-party services",
          content: <p>The service may interact with or link to wallets, RPC providers, blockchain explorers, analytics services, advertising providers, price sources, 0x, LI.FI, Stargate, WalletConnect, Xaman, XRPL Connect, and other third parties. Their own terms and privacy practices apply. We are not responsible for their availability, security, content, conduct, or losses they cause.</p>,
        },
        {
          title: "Risks and no financial advice",
          content: <><p>Digital assets are experimental and highly risky. Risks include total loss, smart-contract defects, malicious or counterfeit tokens, depegging, issuer freezes, trust-line restrictions, bridge failures, validator or network failures, governance changes, regulatory action, and loss of wallet access.</p><p>Nothing on the service is financial, investment, legal, tax, or accounting advice. You are responsible for independent research and professional advice.</p></>,
        },
        {
          title: "No warranties",
          content: <p>To the maximum extent permitted by law, the service is provided “as is” and “as available,” without warranties of accuracy, availability, merchantability, fitness for a particular purpose, non-infringement, security, or uninterrupted operation. We do not warrant token data, logos, balances, quotes, routes, or transaction results.</p>,
        },
        {
          title: "Limitation of liability",
          content: <p>To the maximum extent permitted by law, House of Joshi and its contributors will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, loss of profits, data, goodwill, opportunities, digital assets, or transaction value arising from the service, wallets, blockchains, tokens, smart contracts, bridges, or third parties. Nothing in these Terms excludes liability that cannot legally be excluded.</p>,
        },
        {
          title: "Changes and termination",
          content: <p>We may modify, suspend, restrict, or discontinue any part of the service and may update these Terms. Updated Terms become effective when posted with a revised effective date. Continued use after an update means you accept the revised Terms.</p>,
        },
        {
          title: "General terms",
          content: <p>If a provision is unenforceable, the remaining provisions remain effective. Failure to enforce a provision is not a waiver. These Terms, together with the <Link href="/privacy">Privacy Policy</Link>, form the agreement concerning your use of the service, subject to rights that cannot be waived under applicable law.</p>,
        },
        {
          title: "Contact",
          content: <p>Questions about these Terms may be sent to <a href="mailto:support@thehouseofjoshi.com">support@thehouseofjoshi.com</a>.</p>,
        },
      ]}
    />
  );
}
