# IA and routes quick reference

**Screen detail:** [page-content-spec.md](./page-content-spec.md)  
**API / data wiring:** [cursor-piping-handoff.md](./cursor-piping-handoff.md)  
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

## Next.js routes (target)

| Surface | Route | API prefix (handoff) |
|---------|-------|----------------------|
| Snapshot / Analytics | `/snapshot` | `GET /api/franchises/:id/analytics/*` |
| Metrics | `/metrics`, subroutes | `GET …/metrics/weekly-points` |
| Performance | `/performance` | Same contracts as analytics (for now) |
| Rankings | `/rankings` | Player/ranking APIs |
| Lineup + Coach | `/lineup` | `GET/POST …/lineup`, `POST /api/coach/*` |
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
| Simulator | `POST /api/gm/simulator`, autopick, result |

## GM (summary)

- Live mirror + simulator; shared snake board.
- Seven sidebar bands (incl. Mid Steal, Expected, Mid Reach).
- Details: [page-content-spec.md](./page-content-spec.md), [cursor-piping-handoff.md](./cursor-piping-handoff.md).

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
