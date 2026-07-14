import fs from "node:fs";

const appChainsPath = "hojswap-next/src/lib/chains.ts";
const routerPath = "contracts/HojswapRouterV2.sol";
const appChainsSource = fs.readFileSync(appChainsPath, "utf8");
const routerSource = fs.readFileSync(routerPath, "utf8");

const declaredChainIds = new Map(
  [...appChainsSource.matchAll(/export const\s+(\w+)\s*=\s*\{\s*id:\s*(\d+)/g)].map((match) => [
    match[1],
    Number(match[2]),
  ]),
);
declaredChainIds.set("base", 8453);
declaredChainIds.set("mainnet", 1);

const supportedListMatch = appChainsSource.match(
  /export const SUPPORTED_CHAIN_IDS\s*=\s*\[([^\]]+)\]/s,
);
if (!supportedListMatch) throw new Error(`Could not read SUPPORTED_CHAIN_IDS from ${appChainsPath}`);

const appChainIds = [...supportedListMatch[1].matchAll(/(\w+)\.id/g)].map((match) => {
  const chainId = declaredChainIds.get(match[1]);
  if (chainId === undefined) throw new Error(`Missing numeric chain ID for ${match[1]}`);
  return chainId;
});

const routerChainIds = [...routerSource.matchAll(/_setDestinationChainSupport\((\d+),\s*true\);/g)].map(
  (match) => Number(match[1]),
);

function findDuplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

const appDuplicates = findDuplicates(appChainIds);
const routerDuplicates = findDuplicates(routerChainIds);
const missingFromRouter = appChainIds.filter((chainId) => !routerChainIds.includes(chainId));
const missingFromApp = routerChainIds.filter((chainId) => !appChainIds.includes(chainId));

if (appDuplicates.length || routerDuplicates.length || missingFromRouter.length || missingFromApp.length) {
  throw new Error(
    [
      appDuplicates.length ? `Duplicate app chain IDs: ${appDuplicates.join(", ")}` : null,
      routerDuplicates.length ? `Duplicate router chain IDs: ${routerDuplicates.join(", ")}` : null,
      missingFromRouter.length ? `App chain IDs missing from router: ${missingFromRouter.join(", ")}` : null,
      missingFromApp.length ? `Router chain IDs missing from app: ${missingFromApp.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

console.log(`Router destination chains match all ${appChainIds.length} app chains: ${appChainIds.join(", ")}`);
