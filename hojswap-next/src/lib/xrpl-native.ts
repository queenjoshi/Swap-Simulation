export const XRPL_MAINNET_RPC = process.env.XRPL_RPC_URL ?? "https://s1.ripple.com:51234/";
export const RLUSD_ISSUER = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";
export const RLUSD_CURRENCY = "524C555344000000000000000000000000000000";
export const XRPL_HOUSE_WALLET = "rUG7tHZ5sGCVxuhkAiL9fUqVFhki2Z6bVU";

export type XrplAsset = {
  symbol: "XRP" | "RLUSD";
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
];

export function xrplBookAsset(asset: XrplAsset) {
  return asset.issuer ? { currency: asset.currency, issuer: asset.issuer } : { currency: "XRP" };
}

export function xrplTransactionAmount(asset: XrplAsset, amount: string) {
  if (!asset.issuer) return String(Math.floor(Number(amount) * 1_000_000));
  return { currency: asset.currency, issuer: asset.issuer, value: amount };
}
