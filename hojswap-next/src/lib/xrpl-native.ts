export const XRPL_MAINNET_RPC = process.env.XRPL_RPC_URL ?? "https://s1.ripple.com:51234/";
export const RLUSD_ISSUER = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";
export const RLUSD_CURRENCY = "524C555344000000000000000000000000000000";
export const USDC_ISSUER = "rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE";
export const USDC_CURRENCY = "5553444300000000000000000000000000000000";
export const XRPL_HOUSE_WALLET = "rUG7tHZ5sGCVxuhkAiL9fUqVFhki2Z6bVU";

export type XrplAsset = {
  symbol: "XRP" | "RLUSD" | "USDC" | "SOLO" | "CSC" | "XRdoge";
  name: string;
  currency: string;
  issuer?: string;
  logo: string;
};

export const XRPL_ASSETS: XrplAsset[] = [
  { symbol: "XRP", name: "XRP", currency: "XRP", logo: "/tokens/xrp.png" },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    currency: RLUSD_CURRENCY,
    issuer: RLUSD_ISSUER,
    logo: "https://ripple.com/assets/rlusd-logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    currency: USDC_CURRENCY,
    issuer: USDC_ISSUER,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    symbol: "SOLO",
    name: "Sologenic (legacy/migrating)",
    currency: "534F4C4F00000000000000000000000000000000",
    issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
    logo: "https://assets.coingecko.com/coins/images/14040/standard/solo.png",
  },
  {
    symbol: "CSC",
    name: "CasinoCoin",
    currency: "CSC",
    issuer: "rCSCManTZ8ME9EoLrSHHYKW8PPwWMgkwr",
    logo: "https://www.csc-xrpl.com/favicon.ico",
  },
  {
    symbol: "XRdoge",
    name: "XRdoge",
    currency: "5852646F67650000000000000000000000000000",
    issuer: "rLqUC2eCPohYvJCEBJ77eCCqVL2uEiczjA",
    logo: "https://xrdoge.org/favicon.ico",
  },
];

export function xrplBookAsset(asset: XrplAsset) {
  return asset.issuer ? { currency: asset.currency, issuer: asset.issuer } : { currency: "XRP" };
}

export function xrplTransactionAmount(asset: XrplAsset, amount: string) {
  if (!asset.issuer) return String(Math.floor(Number(amount) * 1_000_000));
  return { currency: asset.currency, issuer: asset.issuer, value: amount };
}
