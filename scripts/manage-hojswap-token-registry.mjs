import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { requiredEnv } from "./solidity-utils.mjs";

const rpcUrl = requiredEnv("RPC_URL");
const privateKey = requiredEnv("PRIVATE_KEY");
const registry = requiredEnv("TOKEN_REGISTRY_ADDRESS");
const action = requiredEnv("TOKEN_REGISTRY_ACTION");
const chainId = Number(requiredEnv("CHAIN_ID"));
const token = requiredEnv("TOKEN_ADDRESS");
if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("CHAIN_ID must be a positive integer");
const abi = parseAbi(["function addVerifiedToken(address token, string symbol, string name, uint8 decimals)", "function updateVerifiedToken(address token, string symbol, string name, uint8 decimals)", "function removeVerifiedToken(address token)"]);
const account = privateKeyToAccount(privateKey);
const chain = { id: chainId, name: process.env.CHAIN_NAME ?? `chain-${chainId}`, nativeCurrency: { name: "Native", symbol: process.env.NATIVE_SYMBOL ?? "ETH", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } };
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
let functionName;
let args;
if (action === "add" || action === "update") {
  const decimals = Number(requiredEnv("TOKEN_DECIMALS"));
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw new Error("TOKEN_DECIMALS must be an integer from 0 to 255");
  functionName = action === "add" ? "addVerifiedToken" : "updateVerifiedToken";
  args = [token, requiredEnv("TOKEN_SYMBOL"), requiredEnv("TOKEN_NAME"), decimals];
} else if (action === "remove") { functionName = "removeVerifiedToken"; args = [token]; }
else throw new Error("TOKEN_REGISTRY_ACTION must be add, update, or remove");
const hash = await walletClient.writeContract({ address: registry, abi, functionName, args });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") throw new Error(`Transaction failed: ${hash}`);
console.log(`${functionName} confirmed: ${hash}`);
