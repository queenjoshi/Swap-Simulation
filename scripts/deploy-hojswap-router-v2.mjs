import fs from "node:fs";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { compileContract, deploymentFilePath, optionalCsvAddresses, requiredEnv } from "./solidity-utils.mjs";

const HOUSE_WALLET = process.env.HOUSE_WALLET ?? "0x6736d2eA9807297F0e56967361B9410854B86a5f";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const rpcUrl = requiredEnv("RPC_URL");
const privateKey = requiredEnv("PRIVATE_KEY");
const chainId = Number(requiredEnv("CHAIN_ID"));
if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("CHAIN_ID must be a positive integer");

const initialRouters = optionalCsvAddresses("INITIAL_ROUTERS");
const initialSpenders = optionalCsvAddresses("INITIAL_SPENDERS").map((spender) =>
  spender.toLowerCase() === "native" ? ZERO_ADDRESS : spender,
);

if (initialRouters.length !== initialSpenders.length) {
  throw new Error("INITIAL_ROUTERS and INITIAL_SPENDERS must have the same number of comma-separated addresses");
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
const { abi, bytecode } = compileContract("contracts/HojswapRouterV2.sol", "HojswapRouterV2");

console.log(`Deploying HojswapRouterV2 to chain ${chainId} from ${account.address}`);
console.log(`House wallet: ${HOUSE_WALLET}`);

const hash = await walletClient.deployContract({
  abi,
  bytecode,
  args: [HOUSE_WALLET, initialRouters, initialSpenders],
});

console.log(`Deployment submitted: ${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress) {
  throw new Error(`Deployment failed: ${hash}`);
}

const deployment = {
  contract: "HojswapRouterV2",
  chainId,
  address: receipt.contractAddress,
  deployer: account.address,
  houseWallet: HOUSE_WALLET,
  initialRouters,
  initialSpenders,
  transactionHash: hash,
  blockNumber: receipt.blockNumber.toString(),
  deployedAt: new Date().toISOString(),
};

fs.mkdirSync("deployments", { recursive: true });
fs.writeFileSync(deploymentFilePath(chainId), `${JSON.stringify(deployment, null, 2)}\n`);

console.log(`Deployed at: ${receipt.contractAddress}`);
console.log(`Saved deployment: ${deploymentFilePath(chainId)}`);
