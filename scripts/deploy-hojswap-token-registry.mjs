import fs from "node:fs";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { compileContract, requiredEnv } from "./solidity-utils.mjs";

const rpcUrl = requiredEnv("RPC_URL");
const privateKey = requiredEnv("PRIVATE_KEY");
const chainId = Number(requiredEnv("CHAIN_ID"));
if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("CHAIN_ID must be a positive integer");
const account = privateKeyToAccount(privateKey);
const owner = process.env.REGISTRY_OWNER ?? account.address;
const chain = { id: chainId, name: process.env.CHAIN_NAME ?? `chain-${chainId}`, nativeCurrency: { name: "Native", symbol: process.env.NATIVE_SYMBOL ?? "ETH", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } };
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
const { abi, bytecode } = compileContract("contracts/HojswapTokenRegistry.sol", "HojswapTokenRegistry");

console.log(`Deploying HojswapTokenRegistry to chain ${chainId}; owner: ${owner}`);
const hash = await walletClient.deployContract({ abi, bytecode, args: [owner] });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress) throw new Error(`Deployment failed: ${hash}`);
fs.mkdirSync("deployments", { recursive: true });
const outputPath = `deployments/hojswap-token-registry-${chainId}.json`;
fs.writeFileSync(outputPath, `${JSON.stringify({ contract: "HojswapTokenRegistry", chainId, address: receipt.contractAddress, owner, deployer: account.address, transactionHash: hash, blockNumber: receipt.blockNumber.toString(), deployedAt: new Date().toISOString() }, null, 2)}\n`);
console.log(`Deployed at: ${receipt.contractAddress}\nSaved deployment: ${outputPath}`);
