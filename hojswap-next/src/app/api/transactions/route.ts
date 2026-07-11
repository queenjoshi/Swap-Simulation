import { NextResponse } from "next/server";

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY ?? "";
const HOUSE_WALLET = "0x6736d2eA9807297F0e56967361B9410854B86a5f";
const XRP_EVM_CHAIN_ID = 1440002;
const AVALANCHE_CHAIN_ID = 43114;
const UNICHAIN_CHAIN_ID = 130;

type EtherscanTx = {
  hash: string;
  timeStamp: string;
  value: string;
  from: string;
  to?: string;
  isError?: string;
  input?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
};

type ExplorerTransaction = {
  hash: string;
  chainId: number;
  timestamp: number;
  status: "success" | "failed";
  kind: "fee" | "wallet";
  type: "token" | "eth";
  summary: string;
  from: string;
  to?: string;
  tokenSymbol: string;
  amount: string;
};

function isExplorerTransaction(tx: ExplorerTransaction | null): tx is ExplorerTransaction {
  return tx !== null;
}

function getEtherscanApiUrl(chainId: number): string | null {
  if (chainId === 8453) return "https://api.basescan.org/api";
  if (chainId === 1) return "https://api.etherscan.io/api";
  if (chainId === 25) return "https://api.cronoscan.com/api";
  if (chainId === 137) return "https://api.polygonscan.com/api";
  if (chainId === 56) return "https://api.bscscan.com/api";
  if (chainId === 42161) return "https://api.arbiscan.io/api";
  if (chainId === 10) return "https://api-optimistic.etherscan.io/api";
  if (chainId === AVALANCHE_CHAIN_ID) return "https://api.snowtrace.io/api";
  if (chainId === UNICHAIN_CHAIN_ID) return "https://api.uniscan.xyz/api";
  if (chainId === XRP_EVM_CHAIN_ID) return null; // No Etherscan-compatible API for XRP EVM
  return null;
}

function nativeSymbolForChain(chainId: number): string {
  if (chainId === AVALANCHE_CHAIN_ID) return "AVAX";
  if (chainId === 56) return "BNB";
  if (chainId === 137) return "POL";
  if (chainId === 25) return "CRO";
  return "ETH";
}

async function fetchEtherscanTxns(
  baseUrl: string,
  address: string,
  apiKey: string,
  action: "tokentx" | "txlist",
  offset = 1000
): Promise<EtherscanTx[]> {
  const url = new URL(baseUrl);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", action);
  url.searchParams.set("address", address);
  url.searchParams.set("startblock", "0");
  url.searchParams.set("endblock", "99999999");
  url.searchParams.set("page", "1");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", "desc");
  url.searchParams.set("apikey", apiKey || "YourApiKeyToken");

  try {
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    const data = (await response.json().catch(() => null)) as { status?: string; result?: unknown } | null;
    if (data?.status !== "1" || !Array.isArray(data.result)) return [];
    return data.result.filter((tx): tx is EtherscanTx => {
      if (!tx || typeof tx !== "object") return false;
      const item = tx as Partial<EtherscanTx>;
      return typeof item.hash === "string" && typeof item.timeStamp === "string";
    });
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = Number(searchParams.get("chainId") ?? 8453);
    const source = searchParams.get("source") ?? "house";
    const address = searchParams.get("address") ?? "";

    const walletAddress = source === "house" ? HOUSE_WALLET : address;
    if (!walletAddress) {
      return NextResponse.json({ items: [] });
    }

    const apiUrl = getEtherscanApiUrl(chainId);
    if (!apiUrl) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const [tokenTxns, ethTxns] = await Promise.all([
      fetchEtherscanTxns(apiUrl, walletAddress, ETHERSCAN_KEY, "tokentx", 1000),
      fetchEtherscanTxns(apiUrl, walletAddress, ETHERSCAN_KEY, "txlist", 500),
    ]);

    const seen = new Set<string>();

    const mapToken = (tx: EtherscanTx): ExplorerTransaction | null => {
      const key = `${tx.hash}-token-${tx.tokenSymbol}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const decimals = Number(tx.tokenDecimal) || 18;
      const amount = Number(tx.value) / 10 ** decimals;
      const amtStr =
        amount === 0
          ? "0"
          : amount < 0.000001
          ? "<0.000001"
          : amount.toLocaleString(undefined, { maximumFractionDigits: 6 });
      const kind = tx.to?.toLowerCase() === HOUSE_WALLET.toLowerCase() ? "fee" : "wallet";
      const nativeSymbol = nativeSymbolForChain(chainId);
      return {
        hash: tx.hash,
        chainId,
        timestamp: Number(tx.timeStamp) * 1000,
        status: tx.isError === "1" ? "failed" : "success",
        kind,
        type: "token",
        summary: `${amtStr} ${tx.tokenSymbol ?? "TOKEN"}`,
        from: tx.from,
        to: tx.to,
        tokenSymbol: tx.tokenSymbol ?? "TOKEN",
        amount: amtStr,
      };
    };

    const mapEth = (tx: EtherscanTx): ExplorerTransaction | null => {
      if (tx.input === "0x") return null;
      const key = `${tx.hash}-eth`;
      if (seen.has(key)) return null;
      seen.add(key);
      const ethVal = Number(tx.value) / 1e18;
      const amtStr =
        ethVal === 0
          ? "0"
          : ethVal < 0.0001
          ? "<0.0001"
          : ethVal.toLocaleString(undefined, { maximumFractionDigits: 6 });
      const kind = tx.to?.toLowerCase() === HOUSE_WALLET.toLowerCase() ? "fee" : "wallet";
      return {
        hash: tx.hash,
        chainId,
        timestamp: Number(tx.timeStamp) * 1000,
        status: tx.isError === "1" ? "failed" : "success",
        kind,
        type: "eth",
        summary: `${amtStr} ${nativeSymbol}`,
        from: tx.from,
        to: tx.to,
        tokenSymbol: nativeSymbol,
        amount: amtStr,
      };
    };

    const items = [
      ...tokenTxns.map(mapToken).filter(isExplorerTransaction),
      ...ethTxns.map(mapEth).filter(isExplorerTransaction),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json({ items: [], total: 0 });
  }
}
