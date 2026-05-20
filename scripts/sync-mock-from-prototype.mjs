#!/usr/bin/env node
/**
 * Sync mock data + US map paths from prototype/src into lib/mock/
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const proto = join(root, "prototype/src")

let data = readFileSync(join(proto, "data.jsx"), "utf8")
data = data.replace(
  /Object\.assign\(window,\s*\{[\s\S]*?\}\);\s*$/m,
  ""
)
data = data.replace(
  /^const (TEAMS|PLAYERS|ROSTER_IDS|STARTER_IDS|BENCH_IDS|LEAGUE_SLOTS|TEAM_POSITION_WEEKS|TEAM_FUTURE_WEEKS|POSITION_PERFORMANCE|LEAGUE_POS_AVG|LEAGUE_STANDINGS|NEWS|NFL_CITIES|WEEK11_GAMES|CURRENT_WEEK) =/gm,
  "export const $1 ="
)
data = data.replace(/^const _logCache/gm, "const _logCache")
data = data.replace(/^function (traj|rng|makeGameLog|getGameLog)/gm, "export function $1")
data = data.replace(
  /Object\.assign\(window, \{ CURRENT_WEEK, getGameLog, makeGameLog \}\);?/,
  ""
)

const types = `export type Player = {
  id: string
  name: string
  pos: string
  team: string
  num: number
  age: number
  proj: number
  actual: number
  rank: number
  prev: number
  ros: number
  own: number
  trend: "up" | "down" | "flat"
  risk: "low" | "med" | "high"
  adp: number
  round: number
  matchup: string
  matchupRating: number
  traj: number[]
  notes: string
  boom: number
  bust: number
  snap: number
  tgt: number
  rush: number
  news: string
  ceiling: number
  floor: number
}

export type GameLogWeek = {
  wk: number
  opp?: string
  home?: boolean
  indoor?: boolean
  kickoff?: string
  day?: string
  weather?: string
  holiday?: string | null
  proj: number
  actual: number | null
  ceiling: number
  floor: number
  played?: boolean
  bye: boolean
}
`

mkdirSync(join(root, "lib/mock"), { recursive: true })
writeFileSync(join(root, "lib/mock/types.ts"), types)
writeFileSync(join(root, "lib/mock/fantasy-data.ts"), data)
writeFileSync(
  join(root, "lib/mock/index.ts"),
  `export * from "./types"
export * from "./fantasy-data"
export { US_MAP_PATHS } from "./us-map-paths"
`
)

let map = readFileSync(join(proto, "us-map-paths.js"), "utf8")
map = map.replace("window.US_MAP_PATHS =", "export const US_MAP_PATHS =")
writeFileSync(join(root, "lib/mock/us-map-paths.ts"), map)

console.log("Synced lib/mock from prototype/src")
