import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

for (const file of ["next-server.js.nft.json", "next-minimal-server.js.nft.json"]) {
  const traceFile = join(target, file);
  if (!existsSync(traceFile)) continue;

  const trace = JSON.parse(readFileSync(traceFile, "utf8"));
  if (Array.isArray(trace.files)) {
    trace.files = trace.files.map((entry) =>
      typeof entry === "string" && entry.startsWith("../../node_modules/")
        ? entry.replace("../../node_modules/", "../node_modules/")
        : entry,
    );
    writeFileSync(traceFile, `${JSON.stringify(trace)}\n`);
  }
}

process.stdout.write(`Mirrored Next output to ${target}\n`);
