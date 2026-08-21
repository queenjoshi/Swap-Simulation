export const SOLANA_HOUSE_WALLET = "6NGoUewhPnKedZTUBs9u85GFgx6CBG9tBKmCeriSV9cK";
export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_SOL_MINT = "EPjFWdd5AufqSSqeM2q9qyWjrdtXtYd9vZ9XBm8H1kF";

export type SolanaToken = {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  verified: boolean;
  tags: string[];
  liquidity: number;
};

export const SOLANA_CORE_FALLBACK: SolanaToken[] = [
  {
    mint: SOL_MINT,
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logo: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
    verified: true,
    tags: ["verified"],
    liquidity: 0,
  },
  {
    mint: USDC_SOL_MINT,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
    verified: true,
    tags: ["verified"],
    liquidity: 0,
  },
];
