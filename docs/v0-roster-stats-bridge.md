# V0 demo roster · live 2025 stats bridge

> **Pattern:** Keep mock **personas** (ids, names, active roster slots). Overlay **real weekly fantasy points** from Sleeper public API.

## What stays mock

- `PLAYERS[].id`, `name`, `pos`, `team`, `notes`, rankings metadata
- `ROSTER_IDS`, `STARTER_IDS`, `BENCH_IDS` — same nine personas
- Projections (`proj`), matchup copy, news — until 949 projection APIs exist
- DST / K slot points in weekly heatmap (starters only are live-summed today)

## What becomes live (2025)

| Source | Route | Maps by |
|--------|-------|---------|
| RapidAPI | `GET /api/nfl/teams` | Team abbrev → `TEAMS` colors/names |
| Sleeper | `GET /api/nfl/roster-stats?season=2025&throughWeek=10` | `sleeperId` on `lib/demo-roster.ts` personas |

Example: Saquon Barkley (`saquon` → Sleeper `4866`) Week 3 **PPR = 9.5** (not the old mock ~15–17).

## Prototype flow

```text
localhost:3456 → fetch :3000/api/nfl/teams (teams)
              → fetch :3000/api/nfl/roster-stats (roster weekly pts)
              → merge into PLAYERS.traj / actual + TEAM_POSITION_WEEKS starter columns
              → badge: "2025 Live · 9 roster"
```

Requires `npm run dev` on port 3000. No API key for Sleeper stats.

## Next (V1)

- Persist mapping in Supabase `player_identity_map`
- Franchise-scoped roster from user upload / Sleeper league sync
- Replace `lib/demo-roster.ts` with franchise API while keeping the same merge pattern
