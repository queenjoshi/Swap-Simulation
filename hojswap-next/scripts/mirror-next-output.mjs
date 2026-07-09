import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(appDir, "..");
const source = join(appDir, ".next");
const target = join(workspaceRoot, ".next");

if (!existsSync(join(workspaceRoot, "pnpm-workspace.yaml"))) {
  process.stdout.write("Skipping root .next mirror outside the workspace.\n");
  process.exit(0);
}

if (!existsSync(join(source, "package.json"))) {
  throw new Error(`Next output package was not found at ${join(source, "package.json")}`);
}

rmSync(target, { force: true, recursive: true });
cpSync(source, target, { recursive: true });

function normalizeTraceFile(traceFile) {
  const trace = JSON.parse(readFileSync(traceFile, "utf8"));
  if (!Array.isArray(trace.files)) return;

  let changed = false;
  trace.files = trace.files.map((entry) => {
    if (typeof entry !== "string") return entry;
    const nodeModulesIndex = entry.indexOf("node_modules/");
    if (nodeModulesIndex === -1) return entry;

    const normalized = `../${entry.slice(nodeModulesIndex)}`;
    if (normalized !== entry) changed = true;
    return normalized;
  });

  if (changed) {
    writeFileSync(traceFile, `${JSON.stringify(trace)}\n`);
  }
}

function normalizeTraceFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      normalizeTraceFiles(path);
    } else if (path.endsWith(".nft.json")) {
      normalizeTraceFile(path);
    }
  }
}

normalizeTraceFiles(target);

process.stdout.write(`Mirrored Next output to ${target}\n`);
