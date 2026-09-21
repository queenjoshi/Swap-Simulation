# Registry and screening rollout

## Implemented locally

- Arc defaults to registry `0x6aCaf964bCf4551CC55Afaf12d6e6a8ef7138875`. Other EVM networks can opt in with server-side `TOKEN_REGISTRY_<chainId>` addresses. They need their own deployed registry. Unconfigured networks retain their existing catalog policy; they are **not registry verified**.
- Active registry tokens replace provider catalog results. Both price and executable quote endpoints read the registry fresh and fail closed on read failure or unlisted tokens. This is application enforcement, not a router-contract restriction; direct callers can still use the router independently.
- Quote requests validate chain, addresses, amount, distinct tokens, wallet (executable quotes), and 1–500 bps slippage. Executable routes must pass the router's paused and target/spender approval checks. Exact wallet simulation still happens before submission; upstream `skipValidation` is not proof of safety.
- Known router revert data is decoded for House Guard. Unknown errors remain blocking.
- Arc history uses RPC router events with 12-block confirmation depth and bounded 2,000-block windows. API `before=<nextCursor>` pages backwards. It is **not a durable full-chain indexer**, does not show failed swaps or every wallet transfer, and the current UI displays the latest window. Responses and UI disclose partial coverage. A persistent indexer/backfill service is still required for full history.

## Screening worker

Run from `hojswap-next`:

```sh
CHAIN_ID=5042 RPC_URL=https://rpc.mainnet.arc.io TOKEN_REGISTRY_ADDRESS=0x6aCaf964bCf4551CC55Afaf12d6e6a8ef7138875 node scripts/screen-and-list.mjs
node --test scripts/screening-policy.test.mjs
```

Default is read-only. Discovery comes from LI.FI, security reports from GoPlus, and metadata/code from the chain. Unsupported chains, missing fields, nonzero transfer taxes, risky control features, metadata mismatch, or absence of a reported pool with at least $100,000 liquidity are quarantined. These are conservative defaults, not an audit, exhaustive checks, or a guarantee. Centralized stablecoins may need a separate, documented manual review because issuer controls fail this generic policy.

The worker processes at most 20 new candidates per run, rotating its starting position hourly. Existing registry entries, including inactive entries, are never automatically overwritten/reactivated. It emits JSON decision records to stdout; production must retain them. It currently screens admissions only, not ongoing risk changes to previously listed tokens. Listing does not guarantee the swap provider supports a route.

To enable actual writes, a trusted worker must provide `LISTING_PRIVATE_KEY` through a secret manager and explicitly run with `--execute`. The deployed contract permits only its owner to list; the worker checks ownership, simulates each write and checks receipts. **Do not put the signer in browser variables, source control, chat, or the frontend hosting environment.** A dedicated limited-role registry contract is preferable to exposing the existing owner's authority. No signer, ownership transfer, scheduler, or live listing has been configured by this change. A scheduler must prevent overlapping runs and enforce operational spending limits.

Choose a protected worker host, signer design, retention and scheduling before enabling unattended operation. Keep dry-run enabled until reviewed.

## Live read-only evidence (2026-09-21)

- Arc RPC returned chain ID 5042.
- Registry returned only USDC at `0x3600000000000000000000000000000000000000`, decimals 6.
- GoPlus supported-chain endpoint included Arc, but EURC's token report did not satisfy the required risk/liquidity fields. The first dry-run batch admitted no tokens.
- Explorer API returned a browser challenge; RPC history avoids depending on that endpoint.

**Consequence:** strict Arc registry enforcement leaves no two-token pair until a second token is admitted. Do not bypass the registry or label EURC safe merely to make a test pass.

## End-to-end acceptance

1. Review/admit the second asset using the registry owner. Record why any conservative-screening exception is acceptable.
2. Deploy these app changes and check registry catalog and quote rejection behavior.
3. With a connected funded Arc wallet, select an approved pair and retain USDC for gas.
4. Review exact allowance, fee, minimum received, and successful House Guard simulation; approve a small test amount and submit from the wallet.
5. Check recipient output, House fee, remaining allowance, gas usage and history.
6. Run `TX_HASH=0x... node scripts/verify-arc-swap.mjs` from `hojswap-next`. This checks the confirmed direct ERC-20 router call, matching swap/fee events and minimum output; it does not verify the browser interaction itself.

No real swap has been submitted in this work. End-to-end success remains unverified.

## Validation

- Production Next build passed (existing ox/viem dynamic-dependency warning).
- TypeScript passed after final catalog-refresh changes.
- Five screening-policy tests passed.
- Nine local production API integration tests passed, including malformed inputs, overflow, unsupported chain, registry catalog and unregistered-token rejection.
- Arc history RPC endpoint returned HTTP 200 with an explicit partial-coverage response. No swaps were found in that tested recent window; that is not a claim about older history.
