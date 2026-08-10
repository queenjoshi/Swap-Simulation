# House of Joshi Swap — Independent Security Review

Date: 2026-08-10

## Status and limitations

This is an independent source-code review performed during development. It is not a certified third-party audit and must not be represented as one. The review covered `HojswapRouterV2.sol`, the legacy `HojswapFeeRouter.sol`, quote construction, fee collection, approvals, and browser-side transaction execution. It did not include formal verification, fuzzing, infrastructure penetration testing, dependency auditing, or review of third-party router implementations.

## Executive summary

`HojswapRouterV2` contains meaningful protections: exact approvals are reset after calls, router/spender pairs are allowlisted, swaps are non-reentrant and pausable, output is measured by balance delta, and minimum output is enforced on-chain. No critical issue was identified in the reviewed V2 source.

The legacy `HojswapFeeRouter` should not be deployed or used. One high-severity native-asset refund issue and one unsafe allowlist design were corrected by V2. The frontend's manual-fee fallback also creates a user-loss scenario when the separate fee transaction succeeds but the subsequent swap fails.

## Remediation update

The source fixes below were completed after the initial review:

- H-01: fixed with pre-swap native-balance delta accounting in the legacy source.
- H-02: fixed by requiring an explicitly approved router/spender pair in the legacy source.
- M-01: fixed by disabling swaps on networks without an atomic V2 fee router.
- M-02: partially fixed in code with two-step V2 ownership transfer. The deployed owner still needs to be transferred to a multisig.
- L-01: mitigated with per-client request throttling. Production edge/platform rate limiting is still recommended for distributed deployments.
- I-01: compiler and production-build validation now pass; dedicated fuzz and invariant coverage remains recommended.

## Findings

### H-01 — Legacy router can transfer pre-existing native balance to a swap recipient

Severity: High
Affected: `contracts/HojswapFeeRouter.sol:130`, `contracts/HojswapFeeRouter.sol:215-218`

After a native swap, `_refundNative` transfers the contract's entire native balance to the caller-selected recipient. Any native currency already held by the contract—sent normally, forced through `selfdestruct`, or left by another route—can therefore be collected by the next successful native swap.

Recommendation: Retire the legacy router. V2's `_refundNativeDelta` approach preserves the pre-swap balance and should remain the only implementation used.

### H-02 — Legacy router approves targets and spenders independently

Severity: High
Affected: `contracts/HojswapFeeRouter.sol:93-102`, `contracts/HojswapFeeRouter.sol:147-148`

The legacy router separately allowlists a call target and token spender, allowing combinations that were never reviewed together. Aggregator integrations frequently require the calldata target and allowance holder to be a specific pair. Combining independently approved components expands the effects of arbitrary calldata and increases the chance of an unsafe approval/call path.

Recommendation: Retire the legacy router. V2's `approvedRouterSpenders[router][spender]` pair allowlist is the correct model.

### M-01 — Manual fee can remain paid when the swap fails

Severity: Medium
Affected: `hojswap-next/src/components/SwapCard.tsx` (`payManualHouseFee` followed by the swap transaction)

On chains without a configured V2 router, the UI sends the 1% House fee in a separate transaction before submitting the swap. If the quote expires, the user rejects the second transaction, or the swap reverts, the fee remains paid even though no swap completes.

Recommendation: Disable the manual-fee fallback for production swaps, or collect the fee and execute the swap atomically through a reviewed router contract. At minimum, disclose the non-refundable two-transaction behavior before the first signature.

### M-02 — A single owner controls operationally sensitive settings

Severity: Medium
Affected: `contracts/HojswapRouterV2.sol:138-160`, `contracts/HojswapRouterV2.sol:221-231`

The owner can change the fee recipient, approve router/spender pairs, pause swaps, and rescue all contract assets. Ownership transfer is immediate and one-step. Compromise or accidental transfer of this key can redirect fees or authorize unsafe external call paths.

Recommendation: Use a multisig owner, add two-step ownership transfer, and consider a delay for router/spender approval changes. Monitor every administrative event.

### L-01 — Quote endpoints can be used to consume third-party API quota

Severity: Low
Affected: `hojswap-next/src/app/api/quote/route.ts`, `hojswap-next/src/app/api/price/route.ts`

The public endpoints proxy requests to 0x without visible authentication, rate limiting, or caching. Automated traffic can exhaust the project's API quota and make swaps unavailable.

Recommendation: Add per-IP and global rate limits, cache identical price requests briefly, validate supported chain IDs and token addresses before the upstream request, and monitor quota usage.

### I-01 — Security regression tests are absent

Severity: Informational

No contract test suite was found for fee rounding, reentrancy, malicious tokens, partial fills/refunds, forced native balances, administrative permissions, or router/spender pair enforcement.

Recommendation: Add Foundry invariant and fuzz tests before further deployment. Include tests proving that a caller can never receive balances that existed before their swap.

## Positive controls observed in V2

- Non-reentrancy protection on all swap entry points.
- On-chain `minBuyAmount` enforcement.
- Balance-delta accounting for purchased and refunded assets.
- Exact per-swap approvals followed by allowance reset.
- Pausable swap execution.
- Router/spender pair allowlisting.
- Fee amount emitted for transparent accounting.
- Owner-only rescue and configuration functions.

## Recommended release decision

Use V2 only. Before describing V2 as externally audited, transfer ownership to a multisig, add contract fuzz/invariant tests, verify deployed bytecode and owner configuration on every supported chain, and commission an independent professional audit.
