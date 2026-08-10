# Hammy Swap on XRPL EVM

HOJSwap integrates Hammy directly through its Uniswap V2-compatible contracts
on XRPL EVM mainnet (`1440000`). No provider API key is required.

## Published contracts

- Factory: `0x1f2da94B4c1D917b47A080aB2B6CdC65c0AA3679`
- Router: `0x822f68f302792D4DEF4BCc8368683f2f6F375667`
- Native XRP sentinel: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
- USDC: `0xa16148c6Ac9EDe0D82f0c52899e22a575284f131` (6 decimals)
- WETH: `0x50498dC52bCd3dAeB54B7225A7d2FA8D536F313E` (18 decimals)

The addresses are published at `https://docs.hammy.finance/contracts` and
`https://docs.hammy.finance/tokens`. Their mainnet bytecode and pair state were
checked through `https://rpc.xrplevm.org` before integration.

## Verified routes

- XRP/USDC pair: `0x611Fc9E618ada71C3B91022a64fAb1DbfEB4C403`
- XRP/WETH pair: `0xdC1c3636cBC24Ca479dD0178e814D0b173750517`
- USDC/WETH routes through XRP when both legs have reserves.

The server reads the factory and reserves on every route request, calls the
router's `getAmountsOut`, computes the slippage-protected minimum output, and
builds calldata for `swapExactETHForTokens`, `swapExactTokensForETH`, or
`swapExactTokensForTokens`.

## Important limitations

Hammy's published mainnet router and factory have bytecode, but their source is
not verified on the XRPL EVM explorer. Liquidity was small when this integration
was written, so users must review price impact and test with small amounts.
RLUSD is intentionally not listed because it is absent from Hammy's official
supported-token deployment table.

For an atomic 1% HOJ fee, deploy `HojswapRouterV2` on XRPL EVM, allow Hammy's
router as both target and spender, then set `NEXT_PUBLIC_HOJSWAP_ROUTER_XRP`.
Until then, the existing manual fee path uses a separate transaction.
