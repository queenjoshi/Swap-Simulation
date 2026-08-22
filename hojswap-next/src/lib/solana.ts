export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_SOL_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

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
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYDkUBwWPgn6jPJNPQXzJXrY",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
    verified: true,
    tags: ["verified", "stablecoin"],
    liquidity: 0,
  },
  {
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    symbol: "JUP",
    name: "Jupiter",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/34188/standard/jup.png",
    verified: true,
    tags: ["verified"],
    liquidity: 0,
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6iB7hUAs6ZnWKFA",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logo: "https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg",
    verified: true,
    tags: ["verified", "community"],
    liquidity: 0,
  },
  {
    mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    symbol: "PYTH",
    name: "Pyth Network",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/31924/standard/pyth.png",
    verified: true,
    tags: ["verified"],
    liquidity: 0,
  },
  {
    mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    symbol: "JTO",
    name: "Jito",
    decimals: 9,
    logo: "https://assets.coingecko.com/coins/images/33228/standard/jto.png",
    verified: true,
    tags: ["verified"],
    liquidity: 0,
  },
];
