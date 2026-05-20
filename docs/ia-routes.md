# IA and routes quick reference

Canonical detail, charts, KPIs, and data dependencies: **`/Users/matthewhanratty/Documents/New project/949fantasy-page-content-spec.md`**

Metric names and formulas: **`/Users/matthewhanratty/Documents/New project/949fantasy-metrics-glossary.md`**

Draft-day and shared market logic (GM / Coach):

- Research → lessons: [draft-theory-source-notes.md](./draft-theory-source-notes.md)
- Engine spec: [draft-market-engine.md](./draft-market-engine.md)
- External: `Documents/New project/949fantasy-draft-market-engine.md`

## Authenticated shell (page content spec)

949 reinterprets the ORCA **left sidebar** pattern as a **horizontal top navigation** (collapsible; chevron concept applies to the top bar).

**Primary tabs (left to right after logo):** Snapshot · Metrics · Performance · Rankings · Lineup · Games · Players · Draft Data · **GM** · **Coach** · Settings

**Product boundary:** dense operator UI (tables, heatmaps, filters, flyouts)—not the marketing homepage alone.

## Next.js routes (target)

| Surface | Route | Status |
|---------|-------|--------|
| Snapshot | `/snapshot` | Implemented (mock) |
| Metrics | `/metrics`, `/metrics/weekly-points`, `/metrics/position-metrics` | Implemented (mock) |
| Performance | `/performance`, `/performance/trends` | Implemented (mock) |
| Rankings | `/rankings` | Implemented (mock) |
| Lineup | `/lineup` | Implemented (mock) |
| Games | `/games`, `/games/players`, `/games/trends` | Implemented (mock) |
| Players | `/players` | Implemented (mock) |
| Draft Data | `/draft-data` | Placeholder |
| **GM** | `/gm` | Planned — platform ADP, snake value, VONA simulation, tier cliffs ([draft-theory-source-notes](./draft-theory-source-notes.md) → [draft-market-engine](./draft-market-engine.md)) |
| **Coach** | `/coach` | Planned — start/sit, waivers, lineup lift, “no move needed” ([draft-market-engine](./draft-market-engine.md)) |
| Settings | `/settings`, `/settings/leagues` | Placeholder |
| Player tape | `/playertape` | Implemented (mock) |
| Player profile | `/players?demo=` (until dynamic `[id]`) | Partial |

## HTML prototype view ids → product surfaces

| View id | Maps to |
|---------|---------|
| `landing` | Public / marketing home |
| `dashboard` | **Snapshot** (pacing, KPI blocks, composition charts) |
| `metrics` | **Metrics** (flyouts: weekly heatmap, position metrics, overview table) |
| `statistics` | **Performance** (position blocks, trends, ties to tape) |
| `rankings` | **Rankings** (core page; preview vs premium columns per spec) |
| `player` | **Player profile** |
| `lineup` | **Start/Sit Studio** (lineup optimization, floor/median/ceiling totals); embeds stadium map |
| `games` | **Games** (prototype nav) — full-page stadium map |
| `stadium-map` | **Games** map component (US map, city dots, hover context) |
| `playertape` | **Player tape** — route **`/playertape`** (also in Performance subnav; complements profile) |
| `tweaks-panel` | **Internal / demo** unless product promotes it |

Prototype nav (`prototype/src/app.jsx`) does not yet include **GM** or **Coach**; add when those views are ported.

## Flyout highlights (see full spec)

- **Metrics:** Weekly Points lineup heatmap (League / Team / Bench toggles); Position Metrics (Team / League / Bench donuts); Metrics Overview (weeks × ranks table).
- **Performance:** Team vs League position totals; Player Performance Trends; **Player tape** at `/playertape` (subnav under Performance).
- **Games:** Map; **Players** under Games = game conditions by roster player; Trends.
- **Draft Data:** Multi-player research (≤6 players), line + candle/trend modes; Draftable Players table; depends on projections/ADP/roster need.
- **GM:** Draft position, platform, scoring, live pick state → structured recommendations (draft score, VONA, tier cliff, platform edge, survival to next pick). No LLM-invented picks — see draft-market-engine.
- **Coach:** Roster, waivers, projections → swaps, claims, drops, weakest position, optional “no move needed.” Reuses market language (opportunity cost) where useful.
- **Settings:** Notifications, league connections (Sleeper first for reliable API; ESPN/Yahoo/DK as aspirational where noted).

## Color semantics (cross-cutting)

Green / yellow / red / blue / gray meanings are defined in the page content spec (variance, terciles, opponent on map, unavailable).

## League configuration dependency

Many surfaces require league scoring, lineup slots, bench, team count, schedule, rosters, and draft results when showing draft-spend / ADP value modules. **GM** additionally needs draft room state, ADP snapshots, and platform ranks per scoring format and league size.

**League import order (v1 stack):** Sleeper → Yahoo (later) → ESPN/CBS/NFL Fantasy only when production access is confirmed. See [v1-stack.md](./v1-stack.md) provider matrix.
