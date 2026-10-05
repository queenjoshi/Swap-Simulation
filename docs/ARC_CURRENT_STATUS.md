# Arc follow-up — 6 October 2026

## Read-only production evidence

The production token-catalog endpoint returned HTTP 200, source `registry`,
`registryEnforced: true`, and exactly one token:

- USDC: `0x3600000000000000000000000000000000000000`, 6 ERC-20 decimals.

The existing screening worker checked 20 new candidates without `--execute`.
None passed the current policy. No listing transaction or swap was submitted.
EURC at `0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1` was quarantined:
the report indicates a proxy, omits mandatory control/sellability fields,
and does not show a pool meeting the $100,000 liquidity requirement.
This is a discovery candidate, not an issuer-verified recommendation.
The address in Arc's testnet documentation must not be substituted on mainnet.

## App changes

- Suppress quote requests and clear pending/stale quotes while registry checks
  fail or fewer than two active tokens exist.
- Display registry lookup failures separately from loading.
- When another token is admitted, refresh the catalog and select a distinct pair.
  Removed selections are reset to remaining active entries.
- About displays the live Arc registry list/status, refreshed every minute.
  It no longer implies that catalog counts mean executable routes.
- Correct About's network count to include Stellar.

## Required before enabling a new token

1. Confirm the mainnet address through the issuer's official published source.
2. Review contract metadata, upgrade/admin controls, transfer restrictions,
   liquidity and the intended quote route. Missing evidence is not a clean result.
3. If a centralized stablecoin needs an exception, document and explicitly approve
   that manual-review exception; do not weaken the generic automatic policy.
4. The registry owner must sign the reviewed token admission in their wallet.
   Do not share private keys or put an owner signer in the frontend.
5. After the catalog refresh, quote both directions, simulate the exact wallet
   transaction and approvals, then let the user sign a small funded test.
6. Verify its receipt using `hojswap-next/scripts/verify-arc-swap.mjs`.

On-chain admission is still pending. The frontend cannot add tokens to an
owner-only registry through a source-code change, and registry admission alone
does not establish available liquidity or successful execution.
