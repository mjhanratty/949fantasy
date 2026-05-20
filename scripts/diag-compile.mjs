#!/usr/bin/env node
/**
 * One-shot compile check: runs a single `next build` and prints duration.
 * No dev server, no watchers, no polling.
 * Usage: npm run diag:compile
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const t0 = Date.now();
const r = spawnSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
});
const ms = Date.now() - t0;
console.error(`\n[diag:compile] exit=${r.status ?? "null"} duration_ms=${ms}`);
process.exit(r.status === 0 ? 0 : 1);
