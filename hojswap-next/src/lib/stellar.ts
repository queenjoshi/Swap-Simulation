export const STELLAR_NETWORK_ID = -3;
export const STELLAR_PASSPHRASE = "Public Global Stellar Network ; September 2015";
export const STELLAR_HORIZON = "https://horizon.stellar.org";
export const STELLAR_LOGO = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/stellar/info/logo.png";
export const STELLAR_USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
export type StellarToken = { symbol: string; name: string; issuer?: string; decimals: 7; logo: string };
export const STELLAR_TOKENS: StellarToken[] = [
  { symbol: "XLM", name: "Stellar Lumens", decimals: 7, logo: STELLAR_LOGO },
  { symbol: "USDC", name: "USD Coin", issuer: STELLAR_USDC_ISSUER, decimals: 7, logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
];

export function stellarAtomic(value: string): bigint {
  if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,7})?$/.test(value)) throw new Error("Enter a positive amount with up to 7 decimal places.");
  const [whole, fraction = ""] = value.split(".");
  const amount = BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0"));
  if (amount > 9223372036854775807n) throw new Error("Amount is outside Stellar's supported range.");
  return amount;
}
export function stellarDecimal(value: bigint): string {
  const padded = value.toString().padStart(8, "0");
  const fraction = padded.slice(-7).replace(/0+$/, "");
  return padded.slice(0, -7) + (fraction ? "." + fraction : "");
}
export type StellarQuote = {
  sell: string; buy: string; sellAmount: string; swapAmount: string; houseFee: string;
  expectedReceive: string; minimumReceive: string; slippageBps: number; expiresAt: number;
  feeReady: boolean; houseWallet?: string; account?: string; transaction?: string;
  networkFeeXlm?: string; warning?: string;
};
