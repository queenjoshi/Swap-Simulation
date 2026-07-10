import fs from "node:fs";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { compileContract, deploymentFilePath, requiredEnv } from "./solidity-utils.mjs";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const rpcUrl = requiredEnv("RPC_URL");
const privateKey = requiredEnv("PRIVATE_KEY");
const chainId = Number(requiredEnv("CHAIN_ID"));
const swapTarget = requiredEnv("SWAP_TARGET");
const spenderInput = requiredEnv("SPENDER");
const approved = (process.env.APPROVED ?? "true").toLowerCase() !== "false";
const spender = spenderInput.toLowerCase() === "native" ? ZERO_ADDRESS : spenderInput;

if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("CHAIN_ID must be a positive integer");

const deploymentPath = deploymentFilePath(chainId);
const deployment = fs.existsSync(deploymentPath)
  ? JSON.parse(fs.readFileSync(deploymentPath, "utf8"))
  : null;

const routerAddress = process.env.HOJSWAP_ROUTER_ADDRESS ?? deployment?.address;
if (!routerAddress) {
  throw new Error("Set HOJSWAP_ROUTER_ADDRESS or deploy first so deployments/hojswap-router-v2-<chainId>.json exists");
}

const chain = {
  id: chainId,
  name: process.env.CHAIN_NAME ?? `chain-${chainId}`,
  nativeCurrency: { name: "Native", symbol: process.env.NATIVE_SYMBOL ?? "ETH", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
};

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
const { abi } = compileContract("contracts/HojswapRouterV2.sol", "HojswapRouterV2");

console.log(`Setting router/spender approval on ${routerAddress}`);
console.log(`Swap target: ${swapTarget}`);
console.log(`Spender: ${spender}`);
console.log(`Approved: ${approved}`);

const hash = await walletClient.writeContract({
  address: routerAddress,
  abi,
  functionName: "setRouterSpenderApproval",
  args: [swapTarget, spender, approved],
});

console.log(`Approval submitted: ${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") throw new Error(`Approval transaction failed: ${hash}`);
console.log("Approval confirmed");
