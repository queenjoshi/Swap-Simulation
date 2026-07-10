import fs from "node:fs";
import path from "node:path";
import solc from "solc";

export function compileContract(contractPath, contractName) {
  const rootDir = process.cwd();
  const absolutePath = path.join(rootDir, contractPath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      [contractPath]: { content: source },
    },
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const issues = output.errors ?? [];

  for (const issue of issues) {
    const log = issue.severity === "error" ? console.error : console.warn;
    log(issue.formattedMessage.trim());
  }

  if (issues.some((issue) => issue.severity === "error")) {
    throw new Error(`Failed to compile ${contractName}`);
  }

  const compiled = output.contracts?.[contractPath]?.[contractName];
  if (!compiled) throw new Error(`Missing compiled contract ${contractName}`);

  return {
    abi: compiled.abi,
    bytecode: `0x${compiled.evm.bytecode.object}`,
  };
}

export function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function optionalCsvAddresses(name) {
  const value = process.env[name];
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function deploymentFilePath(chainId) {
  return path.join(process.cwd(), "deployments", `hojswap-router-v2-${chainId}.json`);
}
