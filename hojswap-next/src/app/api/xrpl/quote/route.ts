import { NextResponse } from "next/server";
import { XRPL_ASSETS, XRPL_MAINNET_RPC, xrplAssetId, xrplBookAsset, xrplTransactionAmount, type XrplAsset } from "@/lib/xrpl-native";

type LedgerAmount = string | { currency: string; issuer: string; value: string };
type BookOffer = {
  TakerGets: LedgerAmount;
  TakerPays: LedgerAmount;
  taker_gets_funded?: LedgerAmount;
  taker_pays_funded?: LedgerAmount;
};

function decimalAmount(amount: LedgerAmount) {
  return typeof amount === "string" ? Number(amount) / 1_000_000 : Number(amount.value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { account?: string; sell?: string; buy?: string; sellAsset?: XrplAsset; buyAsset?: XrplAsset; amount?: string; slippageBps?: number };
    const sell = validatedAsset(body.sellAsset) ?? XRPL_ASSETS.find((asset) => asset.symbol === body.sell);
    const buy = validatedAsset(body.buyAsset) ?? XRPL_ASSETS.find((asset) => asset.symbol === body.buy);
    const sellAmount = Number(body.amount);
    if (!sell || !buy || xrplAssetId(sell) === xrplAssetId(buy) || !Number.isFinite(sellAmount) || sellAmount <= 0) {
      return NextResponse.json({ error: "Invalid native XRPL quote request" }, { status: 400 });
    }
    if (sell.symbol !== "XRP" && buy.symbol !== "XRP") {
      return NextResponse.json({ error: "Native swaps currently require XRP on one side" }, { status: 400 });
    }

    const rpcResponse = await fetch(XRPL_MAINNET_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "book_offers",
        params: [{
          ledger_index: "validated",
          limit: 200,
          taker: body.account,
          taker_gets: xrplBookAsset(buy),
          taker_pays: xrplBookAsset(sell),
        }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!rpcResponse.ok) throw new Error(`XRPL RPC ${rpcResponse.status}`);
    const rpc = await rpcResponse.json() as { result?: { offers?: BookOffer[]; error_message?: string } };
    if (rpc.result?.error_message) throw new Error(rpc.result.error_message);

    const effectiveSellAmount = sell.symbol === "XRP" ? sellAmount * 0.99 : sellAmount;
    let remaining = effectiveSellAmount;
    let receiveAmount = 0;
    for (const offer of rpc.result?.offers ?? []) {
      if (remaining <= 0) break;
      const gets = decimalAmount(offer.taker_gets_funded ?? offer.TakerGets);
      const pays = decimalAmount(offer.taker_pays_funded ?? offer.TakerPays);
      if (!(gets > 0) || !(pays > 0)) continue;
      const consumed = Math.min(remaining, pays);
      receiveAmount += consumed * (gets / pays);
      remaining -= consumed;
    }
    if (remaining > Math.max(0.000001, effectiveSellAmount * 0.000001) || receiveAmount <= 0) {
      return NextResponse.json({ error: "Insufficient native XRPL liquidity for this amount" }, { status: 422 });
    }

    const slippageBps = Math.min(500, Math.max(1, Math.round(body.slippageBps ?? 50)));
    const minimumReceive = receiveAmount * (1 - slippageBps / 10_000);
    const format = (value: number) => value.toFixed(15).replace(/\.?0+$/, "");
    return NextResponse.json({
      sellAmount: format(sellAmount),
      effectiveSellAmount: format(effectiveSellAmount),
      receiveAmount: format(receiveAmount),
      minimumReceive: format(minimumReceive),
      price: receiveAmount / effectiveSellAmount,
      houseFeeXrp: format(sell.symbol === "XRP" ? sellAmount * 0.01 : receiveAmount * 0.01),
      transaction: {
        TransactionType: "OfferCreate",
        Account: body.account,
        Flags: 655360,
        TakerGets: xrplTransactionAmount(sell, format(effectiveSellAmount)),
        TakerPays: xrplTransactionAmount(buy, format(minimumReceive)),
      },
    });
  } catch (error) {
    console.error("[XRPL QUOTE]", error);
    return NextResponse.json({ error: "Native XRP Ledger quote failed" }, { status: 502 });
  }
}

function validatedAsset(asset: XrplAsset | undefined): XrplAsset | undefined {
  if (!asset || typeof asset.symbol !== "string" || typeof asset.name !== "string" || typeof asset.currency !== "string") return undefined;
  if (asset.currency === "XRP" && !asset.issuer) return { symbol: "XRP", name: "XRP", currency: "XRP", logo: "/tokens/xrp.png" };
  if (!asset.issuer || !/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(asset.issuer)) return undefined;
  if (!(asset.currency.length === 3 && /^[\x21-\x7E]{3}$/.test(asset.currency)) && !/^[A-Fa-f0-9]{40}$/.test(asset.currency)) return undefined;
  return {
    symbol: asset.symbol.slice(0, 20),
    name: asset.name.slice(0, 80),
    currency: asset.currency,
    issuer: asset.issuer,
    logo: typeof asset.logo === "string" ? asset.logo : "",
    imported: Boolean(asset.imported),
    verified: Boolean(asset.verified),
  };
}
