export const XRPL_MAINNET_RPC = process.env.XRPL_RPC_URL ?? "https://s1.ripple.com:51234/";
export const RLUSD_ISSUER = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";
export const RLUSD_CURRENCY = "524C555344000000000000000000000000000000";
export const USDC_ISSUER = "rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE";
export const USDC_CURRENCY = "5553444300000000000000000000000000000000";
export const XRPL_HOUSE_WALLET = "rUG7tHZ5sGCVxuhkAiL9fUqVFhki2Z6bVU";

export type XrplAsset = {
  symbol: string;
  name: string;
  currency: string;
  issuer?: string;
  logo: string;
  verified?: boolean;
  imported?: boolean;
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
  {
    symbol: "ARMY",
    name: "XRP Army",
    currency: "41524D5900000000000000000000000000000000",
    issuer: "rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC",
    logo: "https://ipfs.firstledger.net/ipfs/QmbWMQRXp1JR9mypBerpPo9syYyqLQdyuQuDNJzSmgcaHJ",
  },
  {
    symbol: "DROP",
    name: "DROP",
    currency: "44524F5000000000000000000000000000000000",
    issuer: "rszenFJoDdiGjyezQc8pME9KWDQH43Tswh",
    logo: "https://ipfs.firstledger.net/ipfs/QmUEVJNfo5CKcaTnGgb9AwWFRaKyEg8uRYShgsNoVAihpB",
  },
  {
    symbol: "FUZZY",
    name: "Fuzzybear",
    currency: "46555A5A59000000000000000000000000000000",
    issuer: "rhCAT4hRdi2Y9puNdkpMzxrdKa5wkppR62",
    logo: "https://ipfs.firstledger.net/ipfs/QmWGNu6FmQDQNHDnxGek3DPQj832G3qzs4kfDddMSttYMk",
  },
  {
    symbol: "PHNIX",
    name: "PHNIX",
    currency: "50484E4958000000000000000000000000000000",
    issuer: "rDFXbW2ZZCG5WgPtqwNiA2xZokLMm9ivmN",
    logo: "https://coin-images.coingecko.com/coins/images/52497/large/photo_2024-12-03_21-46-21_%281%29.jpg",
  },
  {
    symbol: "SIGMA",
    name: "SIGMA",
    currency: "5349474D41000000000000000000000000000000",
    issuer: "rfKYWZ84fm9eVEdoTcsQCo1WdqMPyaUF5z",
    logo: "https://coin-images.coingecko.com/coins/images/54120/large/SIGMA.jpg",
    verified: true,
  },
  {
    symbol: "SEAL",
    name: "Seal",
    currency: "5345414C00000000000000000000000000000000",
    issuer: "r4pXXQzJ8soYSX4QKeeW4BzRQS1PCtVYLJ",
    logo: "https://coin-images.coingecko.com/coins/images/68390/large/icon-512.png",
    verified: true,
  },
  {
    symbol: "XRPH",
    name: "XRP Healthcare",
    currency: "5852504800000000000000000000000000000000",
    issuer: "rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk",
    logo: "https://coin-images.coingecko.com/coins/images/28982/large/favicon.png",
    verified: true,
  },
  {
    symbol: "XPM",
    name: "XPMarket Token",
    currency: "XPM",
    issuer: "rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa",
    logo: "https://s2.xrplmeta.org/icon/4E7902ED1F.png",
    verified: true,
  },
];

export function xrplBookAsset(asset: XrplAsset) {
  return asset.issuer ? { currency: asset.currency, issuer: asset.issuer } : { currency: "XRP" };
}

export function xrplTransactionAmount(asset: XrplAsset, amount: string) {
  if (!asset.issuer) return String(Math.floor(Number(amount) * 1_000_000));
  return { currency: asset.currency, issuer: asset.issuer, value: amount };
}

export function xrplAssetId(asset: Pick<XrplAsset, "currency" | "issuer">) {
  return asset.issuer ? `${asset.issuer}:${asset.currency}` : "XRP";
}
