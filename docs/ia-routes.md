# IA and routes quick reference

**Screen detail:** [page-content-spec.md](./page-content-spec.md)  
**API / data wiring:** [cursor-piping-handoff.md](./cursor-piping-handoff.md)  
**Data sources (V0–V2):** [data-source-matrix.md](./data-source-matrix.md)  
**Draft engine:** [draft-market-engine.md](./draft-market-engine.md)

## Authenticated shell

**Primary tabs:** Snapshot · Metrics · Performance · Rankings · Lineup · Games · Players · **Draft** · Coach · Settings

(`Draft` consolidates draft rankings, board, score, GM, simulator per piping handoff; legacy route `/draft-data` may redirect.)

Collapsible top nav; **franchise selector** near account (multi-team, setup questionnaire).

## Data availability modes

| Mode | User experience |
|------|-----------------|
| `connected_league` | Sleeper/Yahoo sync — full matchup/opponent where supported |
| `manual_draft_room` | GM board history — full draft-day rosters |
| `manual_user_roster` | Uploaded roster only — user analytics + Coach; limited league views |
| `demo_or_empty` | Onboarding / demo fixtures |

Tier 1–3 positional benchmark when league/opponent data unavailable.

## V0 dev (implemented)

| Surface | Route | Notes |
|---------|-------|--------|
| Data lab | `/data-lab` | RapidAPI teams test UI — [localhost-rapidapi-notes.md](./localhost-rapidapi-notes.md) |
| NFL teams proxy | `GET /api/nfl/teams` | Server-only RapidAPI; CORS for `http://localhost:3456`; prototype hydrates `TEAMS` on load |

## Next.js routes (target)

| Surface | Route | API prefix (handoff) |
|---------|-------|----------------------|
| Snapshot / Analytics | `/snapshot` | `GET /api/franchises/:id/analytics/*` |
| Metrics | `/metrics`, subroutes | `GET …/metrics/weekly-points` |
| Performance | `/performance` | Same contracts as analytics (for now) |
| Rankings | `/rankings` | Player/ranking APIs |
| Lineup + **Coach** | `/lineup` (Coach shell on/near tab) | `GET/POST …/lineup`, `POST /api/coach/insight`, `POST /api/coach/question` — advisory only |
| Games | `/games`, `/games/players` | `GET …/week/:week/stadium-map` |
| Players | `/players` | `GET /api/players/:id/tape` |
| **Draft** | `/draft` (hub) | See below |
| Settings | `/settings`, `/settings/leagues` | Franchise setup |
| Player tape | `/playertape` | Tape contract; labels Proj/Final |

### Draft tab (subsections)

| Section | Handoff routes |
|---------|----------------|
| Draft Rankings | `GET /api/draft/rankings` |
| Draft Board (live) | `POST/GET /api/gm/draft-room`, pick, undo |
| Draft Score | `GET …/draft-room/:id/score` |
| GM recommendations | `GET …/draft-room/:id/recommendations` (7 value bands) |
| GM ticker | `GET …/draft-room/:id/ticker` |
| GM queue | `GET/POST/DELETE …/draft-room/:id/queue` |
| GM alerts (position runs) | `GET …/alerts`, dismiss |
| Player value grades | `GET /api/players/:id/value-grades` |
| Simulator | `POST /api/gm/simulator`, autopick, result (varied computer behavior) |

## Coach (summary)

- **Advisory only** — no automated lineup submits or transactions; user acts on their fantasy platform.
- **Insights** — one-click lineup/bench/position review from deterministic outputs.
- **Scenarios** — Highest Ceiling, Best Boom Chance, Safest Bet, Best Floor, Need Upside, Protect Lead (floor/ceiling tradeoff copy).
- **Q&A** — head-to-head and lineup questions from structured context, not model memory.
- **Waiver language** — claim availability only with league waiver data; else “if available” / roster-% / watch-list wording.
- **Usage trends** — snap, routes, targets, carries, red zone, fantasy pts vs projection.

See [page-content-spec.md](./page-content-spec.md) § Coach, [cursor-piping-handoff.md](./cursor-piping-handoff.md) § Coach Piping, [draft-market-engine.md](./draft-market-engine.md) § Coach.

## GM (summary)

- Live mirror + simulator; shared snake board; `boardMode: available | selected`.
- Seven sidebar bands; **ticker tape**; **queue** with status dots; **position-run alerts**.
- **Value grades** (last season / projected / career, A+–F from value vs position avg).
- Simulator: presets + controlled randomness (reaches, steals, runs).
- Details: [page-content-spec.md](./page-content-spec.md), [cursor-piping-handoff.md](./cursor-piping-handoff.md), [draft-market-engine.md](./draft-market-engine.md).

## HTML prototype (`prototype/src/`)

| View | Product surface |
|------|-----------------|
| `dashboard` | Snapshot / analytics |
| `lineup` | Start/Sit |
| `metrics` | Metrics |
| `statistics` | Performance |
| `rankings` | Rankings (moving to Draft Rankings in product) |
| `stadium-map` | Games map |
| `playertape` | Player Tape |
| `games` | Games (prototype nav) |

Prototype lacks franchise selector, Draft tab, Coach API shell, and typed API boundaries.

## League import

Sleeper first → Yahoo. See [v1-stack.md](./v1-stack.md).
