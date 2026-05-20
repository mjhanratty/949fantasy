#!/usr/bin/env node
/**
 * Port a prototype view .jsx to components/product/views/*.tsx
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const protoViews = join(root, "prototype/src/views")
const outDir = join(root, "components/product/views")

const viewMap = {
  rankings: "rankings-view",
  dashboard: "snapshot-view",
  metrics: "metrics-view",
  statistics: "performance-view",
  lineup: "lineup-view",
  playertape: "playertape-view",
  player: "player-detail-view",
  "stadium-map": "stadium-map",
}

function portFile(srcName, outName, extraImports = "", componentRename = {}) {
  let src = readFileSync(join(protoViews, srcName), "utf8")

  for (const [from, to] of Object.entries(componentRename)) {
    src = src.replace(new RegExp(`function ${from}`, "g"), `function ${to}`)
  }

  src = src.replace(/Object\.assign\(window,\s*\{[^}]+\}\);?\s*/g, "")

  const mockImports = new Set([
    "PLAYERS",
    "TEAMS",
    "NEWS",
    "ROSTER_IDS",
    "STARTER_IDS",
    "BENCH_IDS",
    "LEAGUE_SLOTS",
    "TEAM_POSITION_WEEKS",
    "TEAM_FUTURE_WEEKS",
    "POSITION_PERFORMANCE",
    "LEAGUE_POS_AVG",
    "LEAGUE_STANDINGS",
    "NFL_CITIES",
    "WEEK11_GAMES",
    "CURRENT_WEEK",
    "getGameLog",
  ])
  const usedMock = [...mockImports].filter((s) => src.includes(s))
  const mockImportLine = usedMock.length
    ? `import { ${usedMock.join(", ")} } from "@/lib/mock"\n`
    : ""

  src = src.replace(/const \{([^}]+)\} = window;?/g, (_, inner) => {
    const names = inner.split(",").map((s) => s.trim())
    names.forEach((n) => mockImports.add(n))
    return ""
  })

  src = src.replace(/window\.(US_MAP_PATHS)/g, "$1")
  if (src.includes("US_MAP_PATHS") && !usedMock.includes("US_MAP_PATHS")) {
    usedMock.push("US_MAP_PATHS")
  }

  const finalMock = [...new Set([...usedMock].filter((s) => src.includes(s)))]
  const mockLine = finalMock.length
    ? `import { ${finalMock.join(", ")} } from "@/lib/mock"\n`
    : ""

  src = src
    .replace(/React\.useState/g, "useState")
    .replace(/React\.useEffect/g, "useEffect")
    .replace(/React\.useMemo/g, "useMemo")
    .replace(/React\.useRef/g, "useRef")
    .replace(/React\.Fragment/g, "Fragment")
    .replace(/<window\.Icon/g, "<Icon")
    .replace(/window\.Icon/g, "Icon")
    .replace(/window\.TEAMS/g, "TEAMS")
    .replace(/window\.PLAYERS/g, "PLAYERS")

  const primitives = [
    "Sparkline",
    "TrendDelta",
    "TeamChip",
    "PosPill",
    "PlayerCell",
    "MatchupBars",
    "RiskDot",
    "StatCard",
    "SectionTitle",
    "Gauge",
    "TabBar",
  ]
  const usedPrim = primitives.filter((p) => src.includes(p))
  const primLine = usedPrim.length
    ? `import { ${usedPrim.join(", ")} } from "@/components/product/primitives"\n`
    : ""

  const iconLine = src.includes("Icon")
    ? `import { ${[
        "IconSearch",
        "IconBell",
        "IconChevron",
        "IconArrowUp",
        "IconArrowDown",
        "IconSettings",
        "IconLock",
        "IconClose",
        "IconPlus",
        "IconCheck",
      ]
        .filter((i) => src.includes(i))
        .join(", ")} } from "@/components/product/icons"\n`
    : ""

  const exportName = outName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/View$/, "View")

  const mainFn = src.match(/function (\w+View)/)
  const exportComponent = mainFn ? mainFn[1] : exportName

  if (!src.includes(`export function ${exportComponent}`) && !src.includes(`export { ${exportComponent}`)) {
    src = src.replace(
      new RegExp(`function ${exportComponent}`),
      `export function ${exportComponent}`
    )
  }

  if (src.includes("StadiumMap") && srcName === "lineup.jsx") {
    src = src.replace(
      /function StadiumMap/,
      "/* StadiumMap from stadium-map */"
    )
  }

  const header = `"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
${mockLine}${primLine}${iconLine}${extraImports}
`

  let body = src
  if (srcName === "lineup.jsx" && !body.includes('from "./stadium-map"')) {
    body = body.replace(
      /<StadiumMap/g,
      "<StadiumMap"
    )
  }

  const out = header + body
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, `${outName}.tsx`), out)
  console.log(`Wrote ${outName}.tsx`)
}

mkdirSync(outDir, { recursive: true })

for (const [src, out] of Object.entries(viewMap)) {
  const rename =
    src === "dashboard"
      ? { SnapshotView: "SnapshotView", DashboardView: "DashboardView" }
      : {}
  portFile(
    `${src}.jsx`,
    out,
    src === "lineup.jsx" ? 'import { StadiumMap } from "@/components/product/views/stadium-map"\n' : "",
    rename
  )
}
