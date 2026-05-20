#!/usr/bin/env node
/**
 * Extract and inspect gzip'd assets from a Cursor HTML bundler export
 * (e.g. 949Fantasy.html). See docs/design-reference.md.
 *
 * Usage:
 *   node scripts/decode-bundler-manifest.mjs [path/to/949Fantasy.html]
 *   node scripts/decode-bundler-manifest.mjs --grep "Rankings" [path]
 *   node scripts/decode-bundler-manifest.mjs --list [path]
 *
 * Default path: $HOME/Downloads/949Fantasy.html
 */

import { gunzipSync } from "node:zlib";
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
let grep = null;
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--grep") {
    if (args[i + 1]) grep = args[++i];
    continue;
  }
  if (a === "--list") continue;
  if (a.startsWith("--")) {
    console.error("Unknown flag:", a);
    process.exit(1);
  }
  positional.push(a);
}

const wantList = args.includes("--list");

const defaultPath = join(homedir(), "Downloads", "949Fantasy.html");
const filePath = positional[0] ?? defaultPath;

function isTextLikeMime(mime) {
  if (!mime) return false;
  if (mime.startsWith("text/")) return true;
  if (mime.includes("javascript")) return true;
  if (mime === "application/json") return true;
  return false;
}

if (!existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

const raw = readFileSync(filePath, "utf8");
const marker = '<script type="__bundler/manifest">';
const start = raw.indexOf(marker);
if (start === -1) {
  console.error("No __bundler/manifest block found.");
  process.exit(1);
}
const after = raw.slice(start + marker.length);
const end = after.indexOf("</script>");
if (end === -1) {
  console.error("Unclosed manifest script tag.");
  process.exit(1);
}
const jsonStr = after.slice(0, end).trim();
let manifest;
try {
  manifest = JSON.parse(jsonStr);
} catch (e) {
  console.error("Failed to parse manifest JSON:", e.message);
  process.exit(1);
}

const uuids = Object.keys(manifest);
console.error(`Manifest: ${uuids.length} entries from ${filePath}\n`);

if (!wantList && !grep) {
  console.error("Pass --list to print uuid / mime / size for every asset.");
  console.error('Pass --grep "<substring>" to search inside text/javascript bodies.');
  process.exit(0);
}

function decodeEntry(entry) {
  const buf = Buffer.from(entry.data, "base64");
  if (entry.compressed) {
    try {
      return gunzipSync(buf);
    } catch {
      return buf;
    }
  }
  return buf;
}

for (const uuid of uuids) {
  const entry = manifest[uuid];
  if (!entry?.data) continue;
  const bytes = decodeEntry(entry);
  const mime = entry.mime ?? "application/octet-stream";

  if (wantList) {
    console.log(uuid, mime, entry.compressed ? "gzip" : "raw", bytes.length);
    continue;
  }

  if (grep) {
    if (!isTextLikeMime(mime)) continue;
    const text = bytes.toString("utf8");
    if (text.includes(grep)) {
      console.log("--- match:", uuid, mime, `(${bytes.length} bytes)`);
      const idx = text.indexOf(grep);
      const lo = Math.max(0, idx - 80);
      console.log(text.slice(lo, lo + 200 + grep.length));
      console.log();
    }
    continue;
  }
}

if (grep) {
  console.error("(grep mode: UTF-8 text/javascript / text assets only)");
}
