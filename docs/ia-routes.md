# IA and routes quick reference

Canonical screen detail: [page-content-spec.md](./page-content-spec.md)

Metrics: `/Users/matthewhanratty/Documents/New project/949fantasy-metrics-glossary.md`

Draft engine: [draft-theory-source-notes.md](./draft-theory-source-notes.md) → [draft-market-engine.md](./draft-market-engine.md)

## Authenticated shell

**Primary tabs:** Snapshot · Metrics · Performance · Rankings · Lineup · Games · Players · Draft Data · **GM** · **Coach** · Settings

Collapsible **top nav** (horizontal); see page content spec for flyouts.

## Next.js routes (target)

| Surface | Route | Status |
|---------|-------|--------|
| Snapshot | `/snapshot` | Mock |
| Metrics | `/metrics`, `/metrics/weekly-points`, `/metrics/position-metrics` | Mock |
| Performance | `/performance`, `/performance/trends` | Mock |
| Rankings | `/rankings` | Mock |
| Lineup | `/lineup` | Mock |
| Games | `/games`, `/games/players`, `/games/trends` | Mock |
| Players | `/players` | Mock |
| Draft Data | `/draft-data` | Placeholder |
| **GM** | `/gm` | Planned — live mirror + **draft simulator** (computer drafters), value bands, top-5 ([page-content-spec § GM](./page-content-spec.md)) |
| **Coach** | `/coach` | Planned — start/sit, waivers, lineup lift |
| Settings | `/settings`, `/settings/leagues` | Placeholder |
| Player tape | `/playertape` | Mock |

## GM screen (v1 spec summary)

From [page-content-spec.md](./page-content-spec.md):

- **Live mirror** — click player when drafted; auto-assign team from pick order (no platform API for v1).
- **Draft simulator** — computer picks between user turns; presets Platform ADP / Balanced / Sharp / Chaotic; auto-pick until my pick; draft recap + grade on completion.
- **Left rail** — value bands (updates each pick).
- **Board** — snake grid, position filters, undo, shared layout for both modes.

Engine: [draft-market-engine.md](./draft-market-engine.md) — `draft_rooms`, `draft_room_picks`, `draft_simulator_results`, `manual-board.ts`, `simulator.ts`, `computer-drafters.ts`.

## HTML prototype view ids

| View id | Maps to |
|---------|---------|
| `landing` | Marketing home |
| `dashboard` | Snapshot |
| `metrics` | Metrics flyouts |
| `statistics` | Performance |
| `rankings` | Rankings |
| `player` | Player profile |
| `lineup` | Start/Sit (+ embedded map) |
| `games` | Games (prototype nav) |
| `stadium-map` | Games map component |
| `playertape` | Player tape (`/playertape`) |
| `tweaks-panel` | Internal demo |

Prototype has no **GM** / **Coach** views yet.

## League import

Sleeper first → Yahoo later. See [v1-stack.md](./v1-stack.md) provider matrix.
