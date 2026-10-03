# Stellar / XLM setup

The app has a separate native Stellar mainnet selector and swap panel. It offers native XLM and Circle USDC, using Circle's issuer:

`GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`

Stellar assets use 7 decimals. The internal app network ID is `-3`; it is not an EVM chain ID and must not be sent to 0x or added to an EVM wallet.

Public quotes use Horizon strict-send paths across Stellar order books / liquidity pools. Freighter is supported on Stellar mainnet. Before signing, the app checks that the transaction matches the displayed assets, account, input, 1% fee and minimum output. The signed transaction body must match the reviewed body, and the selected wallet's signature must verify.

## Enable signing

House fee recipient supplied for this deployment:

```dotenv
STELLAR_HOUSE_WALLET=GBQVPEKHD4LQU5KO7MYB7MIXFSMNNZAN4JM4AHKZIZOLZ33TWKAOGXED
```

This is a public address, not a signing key. Its initial mainnet account lookup returned no account record; activate it and configure the Circle USDC trustline before testing swaps. Local configuration does not set the production host's environment variable.

1. Use your existing House Stellar public G-address, or create a Stellar account in your wallet.
2. Activate it with sufficient XLM, and add a trustline for Circle USDC using the issuer above.
3. Set server environment variable `STELLAR_HOUSE_WALLET` to that public address on the app host and redeploy. No private key or seed phrase is needed by the app.
4. Connect a funded trading account in Freighter on Stellar mainnet. A USDC trustline is required for USDC trades.
5. Get a fresh quote and test a small trade in both directions.

The 1% fee is charged in the sell asset. A fee payment and a path-payment swap are placed in the same Stellar transaction, so neither operation succeeds independently. The server checks balances, selling liabilities, USDC trustline authorization/capacity, account reserve, fee-wallet activation and fee-wallet USDC trustline.

With no configured fee wallet, the app provides public quotes and reports why signing is unavailable. It does not route fees to an invented address.

Minimum output is enforced by Stellar's `destMin`. Classic path payments do not use the EVM House Guard simulation; do not advertise a Stellar simulation as completed.

Successful submissions are saved to local app history under Stellar, with Stellar Expert transaction links. This change does not implement Stellar bridging, card funding, or persistent wallet-wide indexing.

## Verify

`node --test hojswap-next/scripts/stellar.test.mjs`

TypeScript and a production Next build should pass. Public mainnet path quotes can be tested without connecting a wallet or submitting transactions. Actual Freighter signing and funded settlement require the wallet owner.

Sources:

- [Stellar path payments](https://developers.stellar.org/docs/build/guides/transactions/path-payments)
- [Circle USDC issuer on Stellar](https://developers.stellar.org/docs/tools/lab/api-explorer/horizon-endpoint)
- Freighter's installed official SDK API definitions (`@stellar/freighter-api`).
