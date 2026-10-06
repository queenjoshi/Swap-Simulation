# Arc EURC manual review — 6 October 2026

Read-only investigation. No token admission, policy exception, approval or swap
transaction was executed. This is not an audit or safety guarantee.

## Identity confirmed

Arc's official mainnet contract list identifies EURC at
`0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1`, with 6 decimals:
https://docs.arc.io/arc/references/contract-addresses

The official Circle repository independently lists that mainnet address:
https://github.com/circlefin/skills/blob/master/plugins/circle/skills/use-arc/SKILL.md

Do not confuse it with testnet EURC:
`0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`.

## Current on-chain reads

Arc RPC chain ID: 5042.

| Read | Result |
| --- | --- |
| name / symbol | EURC / EURC |
| decimals | 6 |
| paused | false |
| owner | 0x1B127715BB61d1561227748CABeAeF51A745F371 |
| masterMinter | 0x75F7E0800bB98aB6a965B0D9cb0Ff5C27355Bb57 |
| pauser | 0xeA2F020633b235f14aaa24930238CC211F874e0B |
| blacklister | 0x24584e31AdA775628f72DFea5829122Cf65a5C01 |

These reads identify privileged role addresses, not independent proof of who
controls each key. Being unpaused now does not guarantee a future transfer.
Issuer-controlled minting, pausing, freezing and proxy upgrades require a
documented stablecoin-specific risk decision, not generic automatic acceptance.

## Screening and liquidity

Fresh GoPlus report: proxy flag 1, buy/sell/transfer tax fields 0,
honeypot flag 0. These are provider observations, not guarantees.
The largest reported pool in this snapshot was approximately $29,459.67,
below the existing $100,000 single-pool threshold.

Generic screening returned failures for the proxy and mandatory fields
including mintability, sell-all restrictions, pausing and blocklisting; many
fields are absent, rather than confirmed dangerous or confirmed clean.
Unknown fields must not be treated as safe.

## Route / execution evidence

The existing local environment has no ZEROX_API_KEY available to the read-only
price check. Therefore no fresh HOJ-compatible 0x quote or exact-wallet
simulation was verified in this investigation. Discovery in LI.FI is not
proof of an executable HOJ swap. No funded end-to-end swap was performed.

## Decision

Issuer identity is confirmed. EURC remains ineligible for generic automatic
admission. No listing exception has been approved.

Before registry-owner admission:

1. Review verified proxy implementation, administrator and transfer controls.
2. Explicitly document acceptance (or rejection) of issuer-controlled stablecoin
   risks and a justified liquidity-policy exception, if desired.
3. Check current 0x routes in both directions with the configured backend,
   target/spender allowlisting, exact-wallet simulation, fee and gas reserve.
4. Only then let the registry owner review and sign token admission.
5. The user must sign any funded test swap; verify its receipt separately.
