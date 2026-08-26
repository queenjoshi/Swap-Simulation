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

export function solanaTokenLogoCandidates(token: SolanaToken) {
  return [...new Set([
    token.logo,
    `https://cdn.dexscreener.com/token-images/og/solana/${token.mint}`,
  ].filter((logo): logo is string => Boolean(logo)))];
}

export function dedupeSolanaTokens(tokens: SolanaToken[]) {
  const canonicalMintBySymbol = new Map(
    SOLANA_CORE_FALLBACK.map((token) => [token.symbol.trim().toUpperCase(), token.mint]),
  );
  const byMint = new Map<string, SolanaToken>();
  for (const token of tokens) {
    const mintKey = token.mint.trim();
    const current = byMint.get(mintKey);
    if (!current || token.liquidity > current.liquidity) byMint.set(mintKey, token);
  }

  const ranked = [...byMint.values()].sort((a, b) => {
    const aCanonical = canonicalMintBySymbol.get(a.symbol.trim().toUpperCase()) === a.mint;
    const bCanonical = canonicalMintBySymbol.get(b.symbol.trim().toUpperCase()) === b.mint;
    if (aCanonical !== bCanonical) return aCanonical ? -1 : 1;
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return b.liquidity - a.liquidity;
  });

  const bySymbol = new Map<string, SolanaToken>();
  for (const token of ranked) {
    const symbolKey = token.symbol.trim().toUpperCase();
    if (!bySymbol.has(symbolKey)) bySymbol.set(symbolKey, token);
  }
  return [...bySymbol.values()].sort((a, b) =>
    a.symbol.localeCompare(b.symbol, undefined, { sensitivity: "base" })
    || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

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
  {
    mint: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS",
    symbol: "KMNO",
    name: "Kamino",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/b3b9a0026bec75db0e4ecb6e023901a812dad85d3ffa1d2ec8b3a53ca498da31?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "defi"],
    liquidity: 0,
  },
  {
    mint: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
    symbol: "PENGU",
    name: "Pudgy Penguins",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/9d5188f603b49ab02f7a75e5d2c2959ec2947c98181501fb11688672e9394efd?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
    symbol: "BOME",
    name: "BOOK OF MEME",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/1fdb1c93b76e5aed7324c2c541558fd75fe7ffb3d0d0fb9ee8370cbac5890e4e?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "Dz9mQ9NzkBcCsuGPFJ3r1bS4wgqKMHBPiVuniW8Mbonk",
    symbol: "USELESS",
    name: "Useless Coin",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/4f8af59f26d45252fb4379d4b1a1e61d0b419fd34dab2ec9f3ba77585d1783cb?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    symbol: "MEW",
    name: "cat in a dogs world",
    decimals: 5,
    logo: "https://cdn.dexscreener.com/cms/images/33effe52dd5b1f6574ca5baaca9c02fecdecb557607a2a72889ceb0537eae9be?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
    symbol: "FARTCOIN",
    name: "Fartcoin",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/9af5672845c89585e9ff1e3b26a640090324aa4d92222052d1043e60ef8182de?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
    symbol: "PNUT",
    name: "Peanut the Squirrel",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/778498984ea5b6eb7c9d74e1e81a2547c88a41ae80f6c840c94a7c3b7829bcd5?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump",
    symbol: "ANSEM",
    name: "The Black Bull",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/A8aHRXC8VPrpfPIF?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "7fmHqRpJLgpVsJFTvrv24CEjkz9c4o5uVX4Zdur1hz35",
    symbol: "DINGER",
    name: "Schrödinger",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/CxGpymoRdmhrkKXB?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "meme", "trending"],
    liquidity: 0,
  },
  {
    mint: "E3i7sTY5QYEBh3itepnomZQt7Eh5kzmHFk1vkm2pump",
    symbol: "CC",
    name: "creator capital",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/8DEY9424x98sT_3F?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "trending"],
    liquidity: 0,
  },
  {
    mint: "BKaXDgZxUSC9njpX89xpQ5USh2pnK1yzZvgk8Mg7pump",
    symbol: "CATLIST",
    name: "CAT SEASON CLUB",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/VdtYSTLt4r84wuLg?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "meme", "trending"],
    liquidity: 0,
  },
  {
    mint: "4aSYV3VQRCPD8yBWwRwbSTLfq1s48UB2PAjCVEBdjups",
    symbol: "XYZ",
    name: "XYZ coin",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/-z8EwHs8MNXk2Jov?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "trending"],
    liquidity: 0,
  },
  {
    mint: "7kkQU6AhUadtoszttEKprirvpgBihJHPoHVczebvi7i3",
    symbol: "CHATON",
    name: "Le Chaton Fat",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/Ib-WvWPt3IPWLYAA?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "meme", "trending"],
    liquidity: 0,
  },
  {
    mint: "5hspQiDgwG3R2Js9L3zqFa78WRAY8rm9SfJSAS6zpump",
    symbol: "YOURSELF",
    name: "The Most Valuable Thing In Life",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/enGMKyAvWW1hQq_A?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "meme", "trending"],
    liquidity: 0,
  },
  {
    mint: "4ChT49V1iazP2XUGtycGkEsS6pRMqvGfUbqvRC9Z91ZT",
    symbol: "MOS",
    name: "Mosaic",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/mY12rfGSULTbOYww?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "trending"],
    liquidity: 0,
  },
  {
    mint: "BDXUaN4Bx6yaCBKAmCyGfdXd3UkRobiQwbV8mB1Kpump",
    symbol: "CHIHUAHUA",
    name: "chihuahua",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/vzcHtKmNpjAQFx4H?width=800&height=800&quality=95&format=auto",
    verified: false,
    tags: ["community", "meme", "trending"],
    liquidity: 0,
  },
  {
    mint: "G7vQWurMkMMm2dU3iZpXYFTHT9Biio4F4gZCrwFpKNwG",
    symbol: "BIRB",
    name: "Moonbirds",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/634081eec8ea5f649b6b8454c58682e840735bf9516d6bc13f7e9a11499f1400?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "nft"],
    liquidity: 0,
  },
  {
    mint: "METvsvVRapdj9cFLzq4Tr43xK4tAjQfwX76z3n6mWQL",
    symbol: "MET",
    name: "Meteora",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/5abfb09db170399c8cb26f4903295dbbf9c5c6ebd1ffca33920023bce4e56581?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "defi"],
    liquidity: 0,
  },
  {
    mint: "METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m",
    symbol: "MPLX",
    name: "Metaplex",
    decimals: 6,
    logo: "https://coin-images.coingecko.com/coins/images/27344/large/mplx.png?1696526391",
    verified: true,
    tags: ["verified", "infrastructure", "nft"],
    liquidity: 0,
  },
  {
    mint: "DvjbEsdca43oQcw2h3HW1CT7N3x5vRcr3QrvTUHnXvgV",
    symbol: "DOOD",
    name: "Doodles",
    decimals: 9,
    logo: "https://cdn.dexscreener.com/cms/images/fcdf5d1dbf70173f679e8a0f0d6ee9394f45e01ccdff993ec20b4d179a121e9d?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "nft"],
    liquidity: 0,
  },
  {
    mint: "Ai66LHZG9MCzg1WKdawwqduVAXpNDUuV8M3uyq5ppump",
    symbol: "CATE",
    name: "Catecoin",
    decimals: 6,
    logo: "https://cdn.dexscreener.com/cms/images/_aILGflqFiJQJ4A-?width=800&height=800&quality=95&format=auto",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9",
    symbol: "GIGA",
    name: "GigaChad",
    decimals: 5,
    logo: "https://coin-images.coingecko.com/coins/images/34770/large/IMG_0015.png",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  {
    mint: "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr",
    symbol: "SPX",
    name: "SPX6900",
    decimals: 8,
    logo: "https://coin-images.coingecko.com/coins/images/31401/large/centeredcoin_%281%29.png",
    verified: true,
    tags: ["verified", "community", "meme"],
    liquidity: 0,
  },
  { mint: "AH9MBjbfDmZaQxcNjo8UkoozGb4pEkKfP2gQdcqopump", symbol: "ANKL", name: "ANKLE OS", decimals: 6, verified: false, tags: ["community", "trending"], liquidity: 22_052 },
  { mint: "2WDjdDj6W1PJpQ8ea4nXZ95VFKNko18DtGYzqUuipump", symbol: "BILLY", name: "Billycoin", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 38_563 },
  { mint: "HPJALtLtydXym5Tbv6udQCKcXSihnz3B7aD3PNMNbonk", symbol: "BONGO", name: "Bongo Cat", decimals: 9, verified: false, tags: ["community", "meme", "trending"], liquidity: 161_915 },
  { mint: "E43AGvP17ujUas66yjxGdJNrRbGq2c7GMEvB5jGApump", symbol: "FUTF", name: "Federal Uranium Trust Fund", decimals: 6, verified: false, tags: ["community", "trending"], liquidity: 1_809 },
  { mint: "DynSUE2peihwAX46BmqjTfWLSreEQpVVxMLv66L3Hj11", symbol: "FUBUKI", name: "Fubuki by Virtuals", decimals: 6, verified: false, tags: ["community", "trending"], liquidity: 36_910 },
  { mint: "89gZQFtEe3RJctXghdbEmht8SV2vQvcN4DNyjmappump", symbol: "HORSE", name: "Nonchalant Horse", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 37_498 },
  { mint: "6F4ms3hHoZ5YfFkTDVDXyY3pygat75CzCQ1Kb1Qspump", symbol: "HORSES", name: "Save the Horses", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 11_410 },
  { mint: "G9ALRz5jtq6wG7dijjsb1TvkGatwPNcnhbAGECVQpump", symbol: "KESTREL", name: "Kestrel Invest", decimals: 6, verified: false, tags: ["community", "trending"], liquidity: 22_031 },
  { mint: "6BWaFbMb2M81wZz5Dx1yzmBooft7M5bgcmK2JaRhAGU4", symbol: "LIZARD", name: "Tom Lizard", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 1_403_750 },
  { mint: "memeADDB1k6PwmvJsCJVoQnKdK7689JWa1tDVMwrvUo", symbol: "MEMEDEX", name: "Memedex", decimals: 9, verified: false, tags: ["community", "meme", "trending"], liquidity: 51_833 },
  { mint: "68Nq68CrtLVpyvK5Un7UADiNczaGf39hBbj3diRsYj6D", symbol: "NEST", name: "Nest", decimals: 9, verified: false, tags: ["community", "trending"], liquidity: 749_898 },
  { mint: "J7ePNotqozFqwxWXmsHezWyQUnHBnqtriRgrX76fpump", symbol: "OGGIE", name: "Oggie", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 38_197 },
  { mint: "23e4CNuJxvBQ7RjNLc8Bh3yN3pQq6jeiTbyzJGXYPgme", symbol: "REMUS", name: "Official Fomo Mascot", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 65_920 },
  { mint: "5hiLgyybrAYPpUwNFa38agfZ8iEtnahWKAPixcfspump", symbol: "RICH", name: "I choose rich everytime", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 54_192 },
  { mint: "GBEVt9gVY7t6PkWPz21thH3wMSvTMppyyVi87qSHpump", symbol: "STARTED", name: "just getting started", decimals: 6, verified: false, tags: ["community", "meme", "trending"], liquidity: 11_727 },
  { mint: "7yRGNTiDTNtSXTHKoidHuDR1ocefkmytJ6hd2qAJ2XNA", symbol: "CC", name: "Canton Network", decimals: 9, verified: false, tags: ["community", "trending"], liquidity: 111_901_541 },
];
