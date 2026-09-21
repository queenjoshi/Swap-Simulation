import { createPublicClient, decodeEventLog, decodeFunctionData, http, parseAbi } from "viem";
const hash = process.env.TX_HASH;
if (!/^0x[0-9a-f]{64}$/i.test(hash ?? "")) throw new Error("Set TX_HASH to a submitted Arc swap transaction hash.");
const router = "0x2c5f372746330465c3f4084ce6c6abce22a48b4d";
const client = createPublicClient({ transport: http(process.env.ARC_RPC_URL ?? "https://rpc.mainnet.arc.io") });
if (await client.getChainId() !== 5042) throw new Error("Wrong chain");
const abi = parseAbi([
  "function swapExactToken((address sellToken,uint256 sellAmount,address spender,address swapTarget,bytes swapCallData,address buyToken,uint256 minBuyAmount,address recipient) params) returns (uint256)",
  "event SwapExecuted(address indexed sender,address indexed recipient,address indexed sellToken,address buyToken,uint256 sellAmount,uint256 feeAmount,uint256 buyAmount,address swapTarget)",
  "event HouseFeeCollected(address indexed token,address indexed payer,uint256 amount)",
]);
const [tx, receipt, head] = await Promise.all([client.getTransaction({ hash }), client.getTransactionReceipt({ hash }), client.getBlockNumber()]);
if (receipt.status !== "success" || tx.to?.toLowerCase() !== router || head - receipt.blockNumber < 12n) throw new Error("Not a confirmed successful HOJ router swap");
const input = decodeFunctionData({ abi, data: tx.input });
const params = input.args[0];
const events = receipt.logs.filter(log => log.address.toLowerCase() === router).flatMap(log => {
  try { return [decodeEventLog({ abi, topics: log.topics, data: log.data })]; } catch { return []; }
});
const swap = events.find(event => event.eventName === "SwapExecuted")?.args;
const fee = events.find(event => event.eventName === "HouseFeeCollected")?.args;
if (!swap || !fee || swap.sender.toLowerCase() !== tx.from.toLowerCase() ||
  swap.recipient.toLowerCase() !== params.recipient.toLowerCase() ||
  swap.sellToken.toLowerCase() !== params.sellToken.toLowerCase() ||
  swap.buyToken.toLowerCase() !== params.buyToken.toLowerCase() ||
  swap.sellAmount !== params.sellAmount || swap.buyAmount < params.minBuyAmount ||
  fee.amount !== swap.feeAmount || fee.token.toLowerCase() !== params.sellToken.toLowerCase() ||
  fee.payer.toLowerCase() !== tx.from.toLowerCase()) throw new Error("Swap event/input/fee verification failed");
console.log(JSON.stringify({ status: "verified_receipt", hash, sender: tx.from, sellToken: swap.sellToken,
  buyToken: swap.buyToken, sellAmount: String(swap.sellAmount), buyAmount: String(swap.buyAmount),
  minimum: String(params.minBuyAmount), fee: String(swap.feeAmount),
  note: "Receipt and router event verification; does not attest browser approval or simulation UX." }, null, 2));
