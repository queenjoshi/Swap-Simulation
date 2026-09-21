import { createPublicClient, erc20Abi, formatUnits, http, type Address } from "viem";
import { arc } from "./chains";
import { getHojswapRouterAddress, hojswapRouterAbi } from "./hojswap-router";

// Bounded, paginated router event history; not a full wallet transfer index.
export async function arcHistory(address: Address, house: boolean, before?: string | null) {
  const client = createPublicClient({ chain: arc, transport: http(arc.rpcUrls.default.http[0], { timeout: 12000, retryCount: 1 }) });
  if (await client.getChainId() !== arc.id) throw new Error("Arc RPC chain mismatch");
  const latest = await client.getBlockNumber();
  if (before && !/^\d{1,20}$/.test(before)) throw new Error("Invalid history cursor");
  const confirmedHead = latest > 12n ? latest - 12n : 0n;
  const toBlock = before ? BigInt(before) : confirmedHead;
  if (toBlock > confirmedHead) throw new Error("History cursor is ahead of the confirmed chain");
  const fromBlock = toBlock > 1999n ? toBlock - 1999n : 0n;
  const router = getHojswapRouterAddress(arc.id)!;
  const logs = await client.getContractEvents({
    address: router, abi: hojswapRouterAbi, eventName: "SwapExecuted",
    ...(house ? {} : { args: { sender: address } }), fromBlock, toBlock, strict: true,
  });
  const items = [];
  for (const log of logs.slice(-100).reverse()) {
    const token = house ? log.args.sellToken : log.args.buyToken;
    const amount = house ? log.args.feeAmount : log.args.buyAmount;
    const block = await client.getBlock({ blockNumber: log.blockNumber });
    let symbol = "USDC";
    let decimals = 18;
    if (token !== "0x0000000000000000000000000000000000000000") {
      [symbol, decimals] = await Promise.all([
        client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "decimals" }),
      ]);
    }
    const formatted = formatUnits(amount, decimals);
    items.push({ hash: log.transactionHash, chainId: arc.id, timestamp: Number(block.timestamp) * 1000,
      status: "success", kind: house ? "fee" : "wallet", type: "token",
      summary: `${formatted} ${symbol}`, from: log.args.sender, to: house ? address : log.args.recipient,
      tokenSymbol: symbol, amount: formatted });
  }
  return { items, total: items.length, source: "arc-router-rpc", partial: true,
    warning: "Arc history shows up to 100 recent confirmed HOJ router swaps per window, not all wallet transfers.",
    fromBlock: String(fromBlock), toBlock: String(toBlock), nextCursor: fromBlock > 0n ? String(fromBlock - 1n) : null };
}
