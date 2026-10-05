import type { Token } from "./tokens";

function sameToken(a: Token, b: Token) {
  return a.chainId === b.chainId && a.address?.toLowerCase() === b.address?.toLowerCase();
}

export function selectRegistryPair(tokens: Token[], sell: Token, buy: Token) {
  if (tokens.length === 0) return null;
  const nextSell = tokens.find(token => sameToken(token, sell)) ?? tokens[0];
  const nextBuy = tokens.find(token => sameToken(token, buy) && !sameToken(token, nextSell))
    ?? tokens.find(token => !sameToken(token, nextSell))
    ?? nextSell;
  return { sell: nextSell, buy: nextBuy };
}
