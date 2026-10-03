import { NextResponse } from "next/server";
import { Account, Asset, Networks, Operation, StrKey, TransactionBuilder } from "@stellar/stellar-sdk";
import { consumeQuoteRequest } from "@/lib/server-rate-limit";
import { STELLAR_HORIZON, STELLAR_TOKENS, stellarAtomic, stellarDecimal } from "@/lib/stellar";

export const runtime = "nodejs";
const asset = (symbol: string) => symbol === "XLM" ? Asset.native() : new Asset("USDC", STELLAR_TOKENS[1].issuer!);
async function read(path: string) {
  const response = await fetch(STELLAR_HORIZON + path, { cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (response.status === 404) throw new Error("This Stellar account is not activated. Fund it with XLM first.");
  if (!response.ok) throw new Error("Stellar network data is temporarily unavailable.");
  return response.json();
}
export async function POST(request: Request) {
  if (!consumeQuoteRequest(request)) return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  let amount: bigint;
  try {
    if (!body || !["XLM", "USDC"].includes(body.sell) || !["XLM", "USDC"].includes(body.buy) || body.sell === body.buy) throw new Error("Choose XLM and USDC on Stellar.");
    if (typeof body.amount !== "string") throw new Error("Invalid amount");
    amount = stellarAtomic(body.amount);
    if (amount === 0n) throw new Error("Enter a positive amount.");
    if (!Number.isInteger(body.slippageBps ?? 100) || (body.slippageBps ?? 100) < 1 || (body.slippageBps ?? 100) > 500) throw new Error("Slippage must be between 0.01% and 5%.");
    if (body.account !== undefined && (typeof body.account !== "string" || !StrKey.isValidEd25519PublicKey(body.account))) throw new Error("Connect a valid Stellar G-address wallet.");
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
  try {
    const fee = amount / 100n;
    if (fee <= 0n) return NextResponse.json({ error: "Amount is too small for the 1% House fee." }, { status: 400 });
    const swapAmount = amount - fee;
    const params = new URLSearchParams({ source_asset_type: body.sell === "XLM" ? "native" : "credit_alphanum4",
      source_amount: stellarDecimal(swapAmount), destination_assets: body.buy === "XLM" ? "native" : "USDC:" + STELLAR_TOKENS[1].issuer });
    if (body.sell !== "XLM") { params.set("source_asset_code", "USDC"); params.set("source_asset_issuer", STELLAR_TOKENS[1].issuer!); }
    const paths = (await read("/paths/strict-send?" + params))._embedded?.records ?? [];
    const candidates = paths.filter((p: { destination_amount?: string }) => typeof p.destination_amount === "string");
    candidates.sort((a: { destination_amount: string }, b: { destination_amount: string }) => stellarAtomic(a.destination_amount) > stellarAtomic(b.destination_amount) ? -1 : 1);
    const best = candidates[0];
    if (!best) return NextResponse.json({ error: "No Stellar swap path is available for this amount." }, { status: 422 });
    const slippage = body.slippageBps ?? 100;
    const expected = stellarAtomic(best.destination_amount);
    const minimum = expected * BigInt(10000 - slippage) / 10000n;
    if (minimum <= 0n) return NextResponse.json({ error: "Output amount is too small." }, { status: 422 });
    const houseWallet = process.env.STELLAR_HOUSE_WALLET?.trim();
    const feeReady = Boolean(houseWallet && StrKey.isValidEd25519PublicKey(houseWallet));
    const quote = { sell: body.sell, buy: body.buy, sellAmount: stellarDecimal(amount), swapAmount: stellarDecimal(swapAmount),
      houseFee: stellarDecimal(fee), expectedReceive: stellarDecimal(expected), minimumReceive: stellarDecimal(minimum),
      slippageBps: slippage, expiresAt: Date.now() + 60000, feeReady, houseWallet: feeReady ? houseWallet : undefined,
      account: body.account, transaction: undefined as string | undefined, networkFeeXlm: undefined as string | undefined,
      warning: feeReady ? undefined : "Stellar quotes are available. Swap signing opens once the House Stellar wallet is configured." };
    if (body.account && feeReady) {
      if (body.account === houseWallet) throw new Error("Use a trading wallet different from the House fee wallet.");
      const [account, house, ledger, fees] = await Promise.all([
        read("/accounts/" + body.account), read("/accounts/" + houseWallet),
        read("/ledgers?order=desc&limit=1"), read("/fee_stats"),
      ]);
      const sellBalance = account.balances.find((b: { asset_type: string; asset_code?: string; asset_issuer?: string }) =>
        body.sell === "XLM" ? b.asset_type === "native" : b.asset_code === "USDC" && b.asset_issuer === STELLAR_TOKENS[1].issuer);
      if (!sellBalance || sellBalance.is_authorized === false) throw new Error("Your wallet needs an authorized trustline and sufficient balance for the sell asset.");
      const available = stellarAtomic(sellBalance.balance || "0") - stellarAtomic(sellBalance.selling_liabilities ?? "0");
      if (available < amount) throw new Error("Insufficient spendable sell balance.");
      const buyBalance = account.balances.find((b: { asset_code?: string; asset_issuer?: string }) => b.asset_code === "USDC" && b.asset_issuer === STELLAR_TOKENS[1].issuer);
      if (body.buy === "USDC" && (!buyBalance || buyBalance.is_authorized === false)) throw new Error("Add Circle USDC's trustline in your Stellar wallet before swapping.");
      if (body.buy === "USDC" && stellarAtomic(buyBalance.limit) - stellarAtomic(buyBalance.balance || "0") - stellarAtomic(buyBalance.buying_liabilities ?? "0") < expected) throw new Error("Your USDC trustline limit is too small for this output.");
      if (body.sell === "USDC") {
        const houseLine = house.balances.find((b: { asset_code?: string; asset_issuer?: string }) => b.asset_code === "USDC" && b.asset_issuer === STELLAR_TOKENS[1].issuer);
        if (!houseLine || houseLine.is_authorized === false) throw new Error("The House wallet needs an authorized Circle USDC trustline before this pair can execute.");
        if (stellarAtomic(houseLine.limit) - stellarAtomic(houseLine.balance) - stellarAtomic(houseLine.buying_liabilities ?? "0") < fee) throw new Error("The House USDC trustline cannot receive the fee. Please retry after it is updated.");
      }
      const baseFee = Math.max(100, Number(fees.fee_charged?.p95 ?? 100));
      if (!Number.isSafeInteger(baseFee) || baseFee > 100000) throw new Error("Stellar network fees are unusually high. Retry later.");
      const native = account.balances.find((b: { asset_type: string }) => b.asset_type === "native");
      const reserve = BigInt(ledger._embedded.records[0].base_reserve_in_stroops) * BigInt(2 + account.subentry_count + (account.num_sponsoring ?? 0) - (account.num_sponsored ?? 0));
      const nativeSpend = body.sell === "XLM" ? amount : 0n;
      const nativeAvailable = stellarAtomic(native.balance) - stellarAtomic(native.selling_liabilities ?? "0");
      if (nativeAvailable < reserve + nativeSpend + BigInt(baseFee * 2)) throw new Error("Keep enough XLM for the account reserve, existing liabilities, and network fees.");
      const source = new Account(body.account, account.sequence);
      const path = best.path.map((p: { asset_type: string; asset_code: string; asset_issuer: string }) => p.asset_type === "native" ? Asset.native() : new Asset(p.asset_code, p.asset_issuer));
      quote.transaction = new TransactionBuilder(source, { fee: String(baseFee), networkPassphrase: Networks.PUBLIC })
        .addOperation(Operation.payment({ destination: houseWallet!, asset: asset(body.sell), amount: quote.houseFee }))
        .addOperation(Operation.pathPaymentStrictSend({ sendAsset: asset(body.sell), sendAmount: quote.swapAmount,
          destination: body.account, destAsset: asset(body.buy), destMin: quote.minimumReceive, path }))
        .setTimeout(60).build().toXDR();
      quote.networkFeeXlm = stellarDecimal(BigInt(baseFee * 2));
    }
    return NextResponse.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Stellar quote failed." }, { status: 503 });
  }
}
