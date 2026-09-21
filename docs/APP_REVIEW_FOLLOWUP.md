# App review follow-up

Scope: active Next.js app (`hojswap-next`), Arc integration, public content,
quote/price endpoints, token metadata, funding and transaction history.
This is a targeted code review, not a complete security audit.

## Corrected

- About and FAQ describe Arc, gas currency, simulation and actual listing limitations.
- SEO and social descriptions include Arc and 22 EVM networks without promising every route.
- Unknown card-purchase networks no longer silently route purchases to Ethereum.
- Token-decimal requests reject unsupported networks and invalid addresses.
- Quote/price endpoints require a real API key in development as well as production;
  fabricated executable-looking quotes have been removed.
- Native fee labels honor the selected network rather than always displaying ETH.
- Transaction parsing preserves zero-decimal token amounts.

## Remaining work, in priority order

1. **Registry and automatic screening rollout:** local code now enforces configured
   registries in token selection and price/quote APIs. A conservative admission
   worker exists, but unattended hosting/signing and other chains' registries are
   not configured. See [rollout status](REGISTRY_SCREENING_ROLLOUT.md). Ongoing
   risk monitoring and durable decision storage remain deployment work.
2. **Quote validation and error reporting:** local code now validates requests,
   checks router pause/approval pairs and decodes known simulation reverts.
   Upstream `skipValidation=true` remains necessary for pre-transfer router quotes;
   exact funded-wallet simulation and adversarial response tests remain important.
3. **Arc execution evidence:** routing-pair approval was confirmed on chain, but
   an end-to-end successful customer trade has not been verified here. Test both
   directions with actual funded-wallet simulation, minimum output, allowance,
   gas reserve and fee rounding. Arc's native/ ERC-20 USDC shared balance needs
   dedicated contract tests. Compilation is not evidence of correct settlement.
4. **History coverage:** Arc now has bounded RPC router-event history, not a full
   persistent indexer. Other legacy transaction adapters may still return empty
   results for unsupported explorer integrations. Existing explorer integrations
   use legacy per-chain endpoints; verify/migrate provider support and distinguish
   an unavailable indexer from an empty wallet. Local history is not full indexing.
5. **Bridge and funding coverage:** a chain appearing in the selector does not
   establish bridge or card-purchase support. Add provider capability checks and
   test route availability independently of same-chain swaps.
6. **Deployment/admin tooling:** root scripts import `viem`, while it is currently
   a dependency of app packages rather than the root package. Declare the runtime
   dependency before relying on these commands in a clean installation. Validate
   RPC chain ID and simulate owner actions before broadcasting.
7. **Legacy app:** `artifacts/hojswap` remains in the repository with older swap
   behavior. Vercel builds `hojswap-next`. Document or retire the legacy target so
   new changes and checks do not accidentally target the wrong application.

No on-chain writes, customer transactions or automated listing-agent wallets were
created during this review.
