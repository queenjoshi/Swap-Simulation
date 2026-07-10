# Hojswap Fee Router

`HojswapFeeRouter.sol` enforces the 1% house fee on-chain before executing a swap.

`HojswapRouterV2.sol` is the recommended next version for the app. It keeps the 1% fee behavior, adds pause control, approves router/spender pairs together, and can emit bridge route metadata for cross-chain swaps.

## What It Does

- Pulls the full sell amount from the user.
- Sends 1% to the configured house wallet.
- Executes an owner-approved swap target with the remaining 99%.
- Sends the bought token back to the user.
- Collects the fee and executes the swap in one router transaction. ERC-20 approval can still be a separate prerequisite before the first swap.
- Does not maintain a token allowlist. Any ERC-20 token or native-chain token can be used if the chosen swap target can route it.
- Calculates ERC-20 fees from the amount actually received by the router, which keeps fee-on-transfer sell tokens from overcharging or over-approving.

House wallet:

```text
0x6736d2eA9807297F0e56967361B9410854B86a5f
```

## Deployment Notes

Deploy one router per supported chain. The constructor takes:

1. `initialHouseWallet`
2. `initialSwapTargets`
3. `initialSpenders`

For 0x integration:

- Approve the 0x transaction `to` address as a swap target.
- Approve the 0x allowance/spender address as a spender.
- Quote ERC-20 swaps through an allowance-holder style endpoint, not Permit2. Contracts cannot sign Permit2 typed data.
- Quote with the router as the taker and make the router receive the bought token, then the router forwards it to the user.
- Let 0x produce the best route, then pass that route calldata into the router. The router does not search liquidity itself; it enforces the fee and executes the route in one transaction.

The app should call:

- `swapExactNative(...)` for native-token sells.
- `swapExactToken(...)` for ERC-20 sells after the user has approved this router for the full sell amount.

The current Next.js app still uses 0x fee params directly until deployed router addresses are available.

## Compile

Install dependencies, then run:

```bash
pnpm run compile:contracts
```

This workspace is pinned to `pnpm@11.7.0`, which requires Node.js 22 or newer. The compiler script uses `solc@0.8.26` with optimizer and `viaIR` enabled.

## HojswapRouterV2 Integration

Deploy `HojswapRouterV2.sol` on every chain where the swap page should execute routes.

The constructor takes:

1. `initialHouseWallet`
2. `initialRouters`
3. `initialSpenders`

For native-token sells, approve the swap router with `spender` set to the zero address. For ERC-20 sells, approve the exact router and allowance spender pair returned by the provider. This prevents mixing one approved router with a different approved spender.

The app should call:

- `swapExactNative((swapTarget, swapCallData, buyToken, minBuyAmount, recipient))` for native sells.
- `swapExactToken((sellToken, sellAmount, spender, swapTarget, swapCallData, buyToken, minBuyAmount, recipient))` for ERC-20 sells.
- `swapExactNativeWithBridgeMetadata(...)` or `swapExactTokenWithBridgeMetadata(...)` when the quote is a bridge route and the UI should record the destination chain/address on-chain.

Before using the bridge metadata functions, call `setDestinationChainSupport(destinationChainId, true)` for every supported destination chain.

## Deploy And Approve

Use Node.js 22 or newer, then deploy:

```bash
RPC_URL="https://mainnet.base.org" \
CHAIN_ID="8453" \
PRIVATE_KEY="0x..." \
pnpm run deploy:router
```

Optionally seed approved pairs at deploy time:

```bash
INITIAL_ROUTERS="0xRouterForNative,0xRouterForErc20" \
INITIAL_SPENDERS="native,0xAllowanceSpender" \
pnpm run deploy:router
```

Approve or revoke one provider pair after deploy:

```bash
RPC_URL="https://mainnet.base.org" \
CHAIN_ID="8453" \
PRIVATE_KEY="0x..." \
SWAP_TARGET="0x0xTransactionToAddress" \
SPENDER="0xAllowanceSpenderOrNative" \
APPROVED="true" \
pnpm run router:approve-pair
```
