import { decodeErrorResult, parseAbi } from "viem";

const errors = parseAbi([
  "error ContractPaused()", "error RouterSpenderPairNotApproved()",
  "error SameTokenUnsupported()", "error InsufficientBuyAmount(uint256 actual,uint256 minimum)",
  "error TokenCallFailed()", "error SwapCallFailed(bytes reason)", "error NativeTransferFailed()",
]);
const messages: Record<string, string> = {
  ContractPaused: "The HOJ router is paused. Swapping is temporarily unavailable.",
  RouterSpenderPairNotApproved: "This route's target/spender pair is not approved by the HOJ router owner.",
  SameTokenUnsupported: "The input and output represent the same asset.",
  InsufficientBuyAmount: "The simulated output is below your minimum. Refresh the quote; do not bypass this check.",
  TokenCallFailed: "The token transfer failed. Check balance, exact router allowance, and token transfer restrictions.",
  SwapCallFailed: "The liquidity provider rejected this route. Refresh the quote and retry simulation.",
  NativeTransferFailed: "The native-asset transfer failed. Check the recipient's ability to receive it.",
};
export function simulationError(error: unknown): string {
  let current = error;
  for (let depth = 0; depth < 8 && current && typeof current === "object"; depth++) {
    const item = current as { data?: unknown; cause?: unknown; shortMessage?: string };
    if (typeof item.data === "string" && /^0x[0-9a-f]+$/i.test(item.data)) {
      try {
        const decoded = decodeErrorResult({ abi: errors, data: item.data as `0x${string}` });
        return messages[decoded.errorName] ?? "The contract rejected this swap.";
      } catch { /* Continue through wrapped RPC errors. */ }
    }
    current = item.cause;
  }
  const message = error instanceof Error ? error.message : "";
  if (/insufficient funds/i.test(message)) return "Insufficient balance for the trade and network gas. On Arc, keep USDC available for gas.";
  if (/timeout|network|fetch failed/i.test(message)) return "The RPC could not complete simulation. Retry when the network responds.";
  return "Simulation failed without a decoded reason. Refresh the quote and check balance, allowance and gas reserve. No swap was submitted.";
}
