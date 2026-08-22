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
  {
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5i9zQA5fwmqAQ",
    symbol: "RAY",
    name: "Raydium",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/13928/standard/PSigc4ie_400x400.jpg",
    verified: true,
    tags: ["verified", "defi"],
    liquidity: 0,
  },
  {
    mint: "orcaEKTdK7LKz57vaAYr9QeNsHPEBFr8DKhNUxW3x2",
    symbol: "ORCA",
    name: "Orca",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/17547/standard/Orca_Logo.png",
    verified: true,
    tags: ["verified", "defi"],
    liquidity: 0,
  },
  {
    mint: "mSoLzYCxHdYgdzU2MeQGvDhJgSP7tNqpnH3h7vDgkkN",
    symbol: "mSOL",
    name: "Marinade Staked SOL",
    decimals: 9,
    logo: "https://assets.coingecko.com/coins/images/17752/standard/mSOL.png",
    verified: true,
    tags: ["verified", "lst"],
    liquidity: 0,
  },
  {
    mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
    decimals: 9,
    logo: "https://assets.coingecko.com/coins/images/28046/standard/JitoSOL-200.png",
    verified: true,
    tags: ["verified", "lst"],
    liquidity: 0,
  },
  {
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLUnEKAzoZg",
    symbol: "WIF",
    name: "dogwifhat",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg",
    verified: true,
    tags: ["verified", "community"],
    liquidity: 0,
  },
  {
    mint: "PUMPcmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn",
    symbol: "PUMP",
    name: "Pump.fun",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/55056/standard/pump.jpg",
    verified: true,
    tags: ["verified", "pump-fun"],
    liquidity: 0,
  },
];
