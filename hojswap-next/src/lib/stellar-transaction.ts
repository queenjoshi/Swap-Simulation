import { Asset, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { STELLAR_PASSPHRASE, STELLAR_TOKENS, stellarAtomic, stellarDecimal, type StellarQuote } from "./stellar";

export function reviewedStellarTransaction(quote: StellarQuote, account: string,
  input: { sell: string; buy: string; amount: string; slippage: number }) {
  if (!quote.transaction || Date.now() >= quote.expiresAt) throw new Error("This quote expired. Get a fresh quote.");
  const tx = TransactionBuilder.fromXDR(quote.transaction, STELLAR_PASSPHRASE);
  if (!(tx instanceof Transaction)) throw new Error("Unsupported Stellar transaction.");
  const amount = stellarAtomic(input.amount);
  const fee = amount / 100n;
  const payment = tx.operations[0], path = tx.operations[1];
  const matches = (asset: Asset, symbol: string) => symbol === "XLM" ? asset.isNative()
    : symbol === "USDC" && asset.getCode() === "USDC" && asset.getIssuer() === STELLAR_TOKENS[1].issuer;
  if (quote.sell !== input.sell || quote.buy !== input.buy || quote.account !== account || tx.source !== account ||
    quote.sellAmount !== stellarDecimal(amount) || stellarAtomic(quote.houseFee) !== fee ||
    stellarAtomic(quote.swapAmount) !== amount - fee || quote.slippageBps !== input.slippage ||
    stellarAtomic(quote.minimumReceive) !== stellarAtomic(quote.expectedReceive) * BigInt(10000 - input.slippage) / 10000n ||
    BigInt(tx.fee) > 200000n || tx.operations.length !== 2 || payment.type !== "payment" || path.type !== "pathPaymentStrictSend" ||
    payment.source || path.source || payment.destination !== quote.houseWallet || payment.destination === account ||
    stellarAtomic(payment.amount) !== fee || !matches(payment.asset, input.sell) ||
    path.destination !== account || stellarAtomic(path.sendAmount) !== amount - fee || stellarAtomic(path.destMin) !== stellarAtomic(quote.minimumReceive) ||
    !matches(path.sendAsset, input.sell) || !matches(path.destAsset, input.buy)) {
    throw new Error("The transaction does not match the reviewed swap.");
  }
  return tx;
}
