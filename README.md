# House of Joshi Swap

House of Joshi Swap is a non-custodial, multichain token-swap interface. Users connect their own wallet, request executable routes, review minimum received amounts and fees, and submit transactions directly from the wallet.

- Application: https://swap.thehouseofjoshi.com
- X: https://x.com/thehouseofjoshi
- Category: DeFi / Swap / DEX aggregator
- License: MIT

## Features

- Multichain token discovery and swapping
- On-chain minimum-output enforcement through `HojswapRouterV2`
- Exact ERC-20 approvals for routed swaps
- Native-token and ERC-20 swap support
- Transaction simulation and receipt verification through House Guard
- Cross-chain routing integrations
- Transparent 1% House fee

## Supported networks

Swap routes are exposed for Ethereum, Base, BNB Chain, Polygon, Arbitrum, Optimism, Avalanche, Unichain and Robinhood Chain. Additional network catalogs and integrations include Cronos, Zora and XRP EVM where supported by the configured providers.

### BNB Chain deployment

| Item | Value |
| --- | --- |
| Network | BNB Smart Chain mainnet |
| Chain ID | `56` |
| Router | `0x2C5F372746330465C3f4084CE6C6aBce22a48B4d` |
| House fee | 1% (`100` basis points) |
| Contract source | [`contracts/HojswapRouterV2.sol`](contracts/HojswapRouterV2.sol) |

The interface routes swaps through third-party liquidity providers. House of Joshi Swap does not claim the underlying liquidity as its own.

## Repository structure

```text
contracts/       Solidity router contracts and deployment documentation
hojswap-next/    Production Next.js application
scripts/         Contract compilation, deployment and administration scripts
artifacts/       Shared application and API packages
```

## Local development

Requirements:

- Node.js 22 or newer
- pnpm 11.7.0

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Create a local environment file from the documented template:

```bash
cp .env.example .env.local
```

Never commit API keys, private keys or wallet seed phrases.

Run the web application:

```bash
pnpm --filter hojswap-next dev
```

Create a production build:

```bash
pnpm --filter hojswap-next build
```

Compile the router contracts:

```bash
pnpm run compile:contracts
```

## Configuration

Public configuration and secret names are documented in [`.env.example`](.env.example). Important server-side integrations include:

- `ZEROX_API_KEY`
- `ETHERSCAN_API_KEY`
- `LIFI_API_KEY`

Wallet and application configuration includes:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_HOJSWAP_ROUTER_*`

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Private API keys must remain server-side environment variables.

## Contracts and fee model

`HojswapRouterV2` collects a 1% fee from the gross sell amount and sends it to the configured House wallet. The remaining amount is routed to an approved swap target. The contract measures received output by balance delta and enforces the user's minimum output before settlement.

Router deployment and administration instructions are available in [`contracts/README.md`](contracts/README.md).

## Security

- Users retain custody of their wallets and approve transactions themselves.
- Swap execution is protected by reentrancy guards, minimum-output checks, router/spender pair allowlisting and emergency pause control.
- The application simulates executable transactions before submission when the selected network supports simulation.
- Token addresses, price impact, slippage and transaction details should always be reviewed before signing.

There is currently **no external audit**. The development review and known limitations are documented in [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md).

## Disclaimer

House of Joshi Swap is a trading interface, not financial advice. Digital assets and third-party liquidity routes involve risk. Users are responsible for verifying token contracts, networks, quoted outputs and wallet transaction details.

## Contact

- Website: https://swap.thehouseofjoshi.com
- X: https://x.com/thehouseofjoshi
