import { createPublicClient, createWalletClient, http, isAddress, erc20Abi, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { screeningFailures } from "./screening-policy.mjs";

// Run in a dedicated trusted worker. Dry-run unless --execute is explicitly supplied.
const execute = process.argv.includes("--execute");
const chainId = Number(process.env.CHAIN_ID);
const rpc = process.env.RPC_URL;
const registry = process.env.TOKEN_REGISTRY_ADDRESS;
if (!Number.isSafeInteger(chainId) || chainId < 1 || !rpc || !isAddress(registry ?? "")) throw new Error("Set CHAIN_ID, RPC_URL and TOKEN_REGISTRY_ADDRESS.");
const client = createPublicClient({ transport: http(rpc, { timeout: 15000, retryCount: 1 }) });
if (await client.getChainId() !== chainId) throw new Error("RPC chain mismatch");
const abi = parseAbi([
  "function owner() view returns (address)",
  "function getToken(address) view returns ((address token,string symbol,string name,uint8 decimals,bool active))",
  "function addVerifiedToken(address,string,string,uint8)",
  "error TokenNotRegistered()",
]);
let wallet;
let account;
if (execute) {
  if (!process.env.LISTING_PRIVATE_KEY) throw new Error("Configure a protected worker signer; never put the key in NEXT_PUBLIC variables.");
  account = privateKeyToAccount(process.env.LISTING_PRIVATE_KEY);
  if ((await client.readContract({ address: registry, abi, functionName: "owner" })).toLowerCase() !== account.address.toLowerCase()) throw new Error("Signer is not registry owner");
  wallet = createWalletClient({ account, transport: http(rpc) });
}
async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Provider unavailable: " + response.status);
  return response.json();
}
const supported = await json("https://api.gopluslabs.io/api/v1/supported_chains");
if (supported.code !== 1 || !supported.result?.some(chain => String(chain.id) === String(chainId))) throw new Error("Security provider does not support this chain. No automatic listings permitted.");
const catalog = await json("https://li.quest/v1/tokens?chains=" + chainId);
const candidates = catalog.tokens?.[String(chainId)];
if (!Array.isArray(candidates)) throw new Error("Discovery catalog unavailable");
// Rotate hourly so repeatedly quarantined candidates cannot starve later discoveries.
const start = candidates.length ? (Math.floor(Date.now() / 3600000) * 20) % candidates.length : 0;
const rotated = [...candidates.slice(start), ...candidates.slice(0, start)];
const seen = new Set();
let checked = 0;
for (const token of rotated) {
  const address = token.address?.toLowerCase();
  if (!isAddress(address ?? "") || /^0x0{40}$/.test(address) || seen.has(address) || token.chainId !== chainId) continue;
  seen.add(address);
  try {
    // Never automatically reactivate a removed token or overwrite an owner's listing.
    try {
      await client.readContract({ address: registry, abi, functionName: "getToken", args: [address] });
      continue;
    } catch (error) {
      const reverted = error.walk?.(cause => cause?.data?.errorName === "TokenNotRegistered");
      if (reverted?.data?.errorName !== "TokenNotRegistered") throw error;
    }
    if (++checked > 20) break; // Bound provider calls and spending per run.
    const response = await json(`https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`);
    const failures = screeningFailures(response.code === 1 ? response.result?.[address] : null);
    if (failures.length) { console.log(JSON.stringify({ address, status: "quarantined", failures })); continue; }
    const [code, symbol, name, decimals] = await Promise.all([
      client.getCode({ address }),
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
    ]);
    if (!code || code === "0x" || !symbol || !name || symbol.length > 24 || name.length > 80 ||
      /[\u0000-\u001f\u007f]/.test(symbol + name) || decimals !== token.decimals ||
      symbol !== token.symbol || name !== token.name) throw new Error("Contract/catalog metadata mismatch");
    // Existing financial-product exclusion applies to automatic admission as well.
    if (/stock|equity|shares|xstock/i.test(symbol + " " + name + " " + (token.tags ?? []).join(" "))) throw new Error("Excluded asset category");
    const args = [address, symbol, name, decimals];
    if (!execute) { console.log(JSON.stringify({ address, status: "eligible_dry_run", symbol, decimals })); continue; }
    const { request } = await client.simulateContract({ account, address: registry, abi, functionName: "addVerifiedToken", args });
    const hash = await wallet.writeContract({ ...request, chain: null });
    const receipt = await client.waitForTransactionReceipt({ hash, confirmations: 2 });
    if (receipt.status !== "success") throw new Error("Listing transaction reverted");
    console.log(JSON.stringify({ address, status: "listed", hash }));
  } catch (error) {
    console.log(JSON.stringify({ address, status: "quarantined", reason: error.shortMessage ?? error.message }));
  }
}
