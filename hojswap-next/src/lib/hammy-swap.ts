import {
  createPublicClient,
  encodeFunctionData,
  getAddress,
  http,
  isAddress,
  parseAbi,
  zeroAddress,
  type Address,
} from "viem";
import type { PriceResponse, QuoteResponse } from "@/lib/quote";
import { NATIVE_ETH_ADDRESS } from "@/lib/quote";
import { xrp } from "@/lib/chains";

export const HAMMY_FACTORY = getAddress("0x1f2da94B4c1D917b47A080aB2B6CdC65c0AA3679");
export const HAMMY_ROUTER = getAddress("0x822f68f302792D4DEF4BCc8368683f2f6F375667");
export const HAMMY_USDC = getAddress("0xa16148c6Ac9EDe0D82f0c52899e22a575284f131");
export const HAMMY_WETH = getAddress("0x50498dC52bCd3dAeB54B7225A7d2FA8D536F313E");
export const XRP_SENTINEL = getAddress(NATIVE_ETH_ADDRESS);

const factoryAbi = parseAbi([
  "function getPair(address tokenA,address tokenB) view returns (address pair)",
]);

const pairAbi = parseAbi([
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
]);

export const hammyRouterAbi = parseAbi([
  "function getAmountsOut(uint256 amountIn,address[] path) view returns (uint256[] amounts)",
  "function swapExactETHForTokens(uint256 amountOutMin,address[] path,address to,uint256 deadline) payable returns (uint256[] amounts)",
  "function swapExactTokensForETH(uint256 amountIn,uint256 amountOutMin,address[] path,address to,uint256 deadline) returns (uint256[] amounts)",
  "function swapExactTokensForTokens(uint256 amountIn,uint256 amountOutMin,address[] path,address to,uint256 deadline) returns (uint256[] amounts)",
]);

const client = createPublicClient({ transport: http("https://rpc.xrplevm.org") });

export type HammySwapRequest = {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  chainId: number;
  slippageBps: number;
  recipient?: string;
};

function tokenAddress(value: string): Address {
  if (!isAddress(value)) throw new Error("Invalid XRPL EVM token address");
  return getAddress(value);
}

async function pairExists(tokenA: Address, tokenB: Address): Promise<boolean> {
  const pair = await client.readContract({
    address: HAMMY_FACTORY,
    abi: factoryAbi,
    functionName: "getPair",
    args: [tokenA, tokenB],
  });
  if (pair === zeroAddress) return false;
  const reserves = await client.readContract({ address: pair, abi: pairAbi, functionName: "getReserves" });
  return reserves[0] > 0n && reserves[1] > 0n;
}

export async function resolveHammyPath(sellToken: Address, buyToken: Address): Promise<Address[]> {
  if (sellToken.toLowerCase() === buyToken.toLowerCase()) throw new Error("Select two different tokens");
  if (await pairExists(sellToken, buyToken)) return [sellToken, buyToken];
  const connectors = [XRP_SENTINEL, HAMMY_USDC, HAMMY_WETH];
  for (const connector of connectors) {
    if (connector === sellToken || connector === buyToken) continue;
    if (await pairExists(sellToken, connector) && await pairExists(connector, buyToken)) {
      return [sellToken, connector, buyToken];
    }
  }
  throw new Error("No liquid Hammy route exists for this pair");
}

export async function hasHammyBaseRoute(token: Address): Promise<boolean> {
  for (const baseToken of [XRP_SENTINEL, HAMMY_USDC, HAMMY_WETH]) {
    if (token === baseToken) return true;
    try {
      await resolveHammyPath(token, baseToken);
      return true;
    } catch {
      // Try the next curated base asset.
    }
  }
  return false;
}

function validate(request: HammySwapRequest) {
  if (request.chainId !== xrp.id) throw new Error("Hammy is configured only for XRPL EVM mainnet");
  if (!/^\d+$/.test(request.sellAmount) || BigInt(request.sellAmount) <= 0n) throw new Error("Invalid sell amount");
  if (!Number.isInteger(request.slippageBps) || request.slippageBps < 1 || request.slippageBps > 5_000) {
    throw new Error("Slippage must be between 1 and 5000 basis points");
  }
}

async function getRoute(request: HammySwapRequest) {
  validate(request);
  const sellToken = tokenAddress(request.sellToken);
  const buyToken = tokenAddress(request.buyToken);
  const path = await resolveHammyPath(sellToken, buyToken);
  const amounts = await client.readContract({
    address: HAMMY_ROUTER,
    abi: hammyRouterAbi,
    functionName: "getAmountsOut",
    args: [BigInt(request.sellAmount), path],
  });
  const buyAmount = amounts.at(-1);
  if (!buyAmount || buyAmount <= 0n) throw new Error("Hammy returned no output for this trade");
  const minBuyAmount = buyAmount * BigInt(10_000 - request.slippageBps) / 10_000n;
  if (minBuyAmount <= 0n) throw new Error("Minimum output is zero");
  return { sellToken, buyToken, path, buyAmount, minBuyAmount };
}

export async function getHammyPrice(request: HammySwapRequest): Promise<PriceResponse> {
  const route = await getRoute(request);
  return {
    sellAmount: request.sellAmount,
    buyAmount: route.buyAmount.toString(),
    liquidityAvailable: true,
  };
}

export async function getHammyQuote(request: HammySwapRequest): Promise<QuoteResponse> {
  const route = await getRoute(request);
  if (!request.recipient || !isAddress(request.recipient)) throw new Error("Connect a wallet to request an executable XRP quote");
  const recipient = getAddress(request.recipient);
  const deadline = BigInt(Math.floor(Date.now() / 1_000) + 20 * 60);
  const isNativeSell = route.sellToken === XRP_SENTINEL;
  const isNativeBuy = route.buyToken === XRP_SENTINEL;
  const functionName = isNativeSell
    ? "swapExactETHForTokens"
    : isNativeBuy
      ? "swapExactTokensForETH"
      : "swapExactTokensForTokens";
  const args = isNativeSell
    ? [route.minBuyAmount, route.path, recipient, deadline] as const
    : [BigInt(request.sellAmount), route.minBuyAmount, route.path, recipient, deadline] as const;
  const data = encodeFunctionData({ abi: hammyRouterAbi, functionName, args });

  return {
    sellAmount: request.sellAmount,
    buyAmount: route.buyAmount.toString(),
    minBuyAmount: route.minBuyAmount.toString(),
    sellToken: route.sellToken,
    buyToken: route.buyToken,
    liquidityAvailable: true,
    route: {
      fills: [{
        from: route.sellToken,
        to: route.buyToken,
        source: "Hammy Swap",
        proportionBps: "10000",
      }],
    },
    issues: isNativeSell
      ? undefined
      : { allowance: { spender: HAMMY_ROUTER, actual: "0", expected: request.sellAmount } },
    transaction: {
      to: HAMMY_ROUTER,
      data,
      value: isNativeSell ? request.sellAmount : "0",
    },
  };
}
