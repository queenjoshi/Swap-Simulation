import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const rootDir = process.cwd();
const contractsDir = path.join(rootDir, "contracts");
const requestedFiles = process.argv.slice(2).filter((argument) => argument !== "--");

const contractFiles = requestedFiles.length > 0
  ? requestedFiles
  : fs
      .readdirSync(contractsDir)
      .filter((fileName) => fileName.endsWith(".sol"))
      .map((fileName) => path.join("contracts", fileName));

const sources = Object.fromEntries(
  contractFiles.map((relativeFile) => {
    const filePath = path.join(rootDir, relativeFile);
    return [relativeFile, { content: fs.readFileSync(filePath, "utf8") }];
  }),
);

const input = {
  language: "Solidity",
  sources,
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
  process.exit(1);
}

for (const [sourceName, contracts] of Object.entries(output.contracts ?? {})) {
  for (const [contractName, contractOutput] of Object.entries(contracts)) {
    const bytecode = contractOutput.evm.bytecode.object;
    const byteLength = bytecode.length / 2;
    console.log(`${sourceName}:${contractName} compiled (${byteLength} bytes)`);
  }
}
