export const HOUSE_WALLET = "0x6736d2eA9807297F0e56967361B9410854B86a5f" as const;
export const HOUSE_FEE_BPS = 100;

export function calculateHouseFeeAmount(amount: bigint): bigint {
  if (amount <= 0n) return 0n;
  return (amount * BigInt(HOUSE_FEE_BPS) + 9999n) / 10000n;
}

export function calculateRouterSellAmount(sellAmount: string): string {
  const amount = BigInt(sellAmount);
  const fee = calculateHouseFeeAmount(amount);
  const routerSellAmount = amount - fee;
  if (routerSellAmount <= 0n) throw new Error("Sell amount is too small after the house fee");
  return routerSellAmount.toString();
}

export function addHouseFeeParams(params: URLSearchParams, sellToken: string) {
  params.set("swapFeeRecipient", HOUSE_WALLET);
  params.set("swapFeeBps", String(HOUSE_FEE_BPS));
  params.set("swapFeeToken", sellToken);
}
