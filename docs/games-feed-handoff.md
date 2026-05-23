# 949Fantasy Games Feed Handoff

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-games-feed-handoff.md`


## Purpose

This document defines the early product/data requirements for the upcoming `Games` surface.

Current status:

- Coach should live inside Start/Sit.
- GM should live inside Draft.
- Games is being added as its own live/context surface.
- Current Games concept exists as a prototype image only, not a finished UI.
- Implementation must keep API draws low to avoid exceeding provider limits.

## Product Intent

Games should show live or periodically refreshed game context with the top fantasy-relevant players for each team in the matchup.

The prototype pattern:

```txt
left team top players
-> center live game card / scoreboard
-> right team top players
```

For each team playing, show:

- top QB.
- top RB.
- top receiver, where receiver can be WR or TE.

Example from prototype:

- Chiefs side: Travis Kelce appears as top receiver/TE.
- Eagles side: Jalen Hurts, Saquon Barkley, DeVonta Smith.

The production UI should not assume a fixed position display if a team's top receiver is a TE rather than WR.

## Relationship To Other Features

Games is a context surface, not Coach or GM.

However, Games should reuse shared player intelligence outputs:

- player identity.
- projected fantasy points.
- current Value Grade.
- floor / ceiling.
- risk.
- injury status.
- ownership/ADP where available.
- matchup context.
- team/game schedule.

Coach can later reference Games context for start/sit.

Player Tape can later link from a player shown in Games.

## Data Contract

Recommended route:

```txt
GET /api/games/live
```

Optional query params:

```txt
week=1
status=live|upcoming|final|all
```

Response shape:

```ts
type GamesFeedResponse = {
  generatedAt: string
  refreshAfterSeconds: number
  sourceStatus: "live" | "cached" | "stale" | "fallback"
  games: GameFeedItem[]
}

type GameFeedItem = {
  gameId: string
  week: number
  kickoffTime: string
  status: "scheduled" | "in_progress" | "halftime" | "final" | "postponed"
  period?: string | null
  clock?: string | null
  possessionTeamId?: string | null
  downDistance?: string | null
  yardLine?: string | null
  homeTeam: GameTeamContext
  awayTeam: GameTeamContext
}

type GameTeamContext = {
  teamId: string
  abbreviation: string
  record?: string | null
  score?: number | null
  winProbability?: number | null
  topPlayers: {
    qb?: GamePlayerCard | null
    rb?: GamePlayerCard | null
    receiver?: GamePlayerCard | null
  }
}

type GamePlayerCard = {
  playerId: string
  name: string
  position: "QB" | "RB" | "WR" | "TE"
  teamId: string
  jerseyNumber?: string | null
  age?: number | null
  adp?: number | null
  ownershipPct?: number | null
  valueGrade?: "A+" | "A" | "B" | "C" | "D" | "F" | null
  projectedPoints?: number | null
  liveFantasyPoints?: number | null
  riskLabel?: "low" | "medium" | "high" | null
  injuryStatus?: string | null
}
```

## Top Player Selection Rules

For each team:

### QB

Choose the expected starting QB when available.

Fallback:

- highest projected QB on that team.
- highest current Value Grade QB on that team.
- active QB from official depth chart if projection missing.

### RB

Choose the RB with the highest blended relevance score:

```txt
rb_relevance =
  projected_points
  + value_grade_score
  + expected_touch_share
  - injury_penalty
```

### Receiver

Choose the highest ranked WR or TE by blended relevance:

```txt
receiver_relevance =
  projected_points
  + value_grade_score
  + target_share_signal
  + red_zone_usage_signal
  - injury_penalty
```

Receiver should be a flexible WR/TE slot because some teams' most important pass catcher may be a TE.

## API Draw Strategy

Do not call live providers directly from React components.

All Games UI should read from 949 internal APIs backed by cache.

Recommended layers:

```txt
provider API
-> ingest/cache worker
-> Supabase normalized tables
-> computed game feed payload
-> Redis/fast cache
-> /api/games/live
-> React UI
```

## Refresh Cadence

Use different refresh periods based on game state.

| State | Suggested Refresh |
|---|---:|
| Offseason / no games | daily or manual |
| Upcoming games > 24h away | 6-12 hours |
| Game day, pregame | 15-30 minutes |
| Live games | 30-60 seconds from internal cache |
| Final games | freeze after final stat sync |

Important:

- The UI can poll `/api/games/live` frequently.
- The internal API should usually serve cached data.
- Provider API draws should happen from controlled workers, not every browser request.

## Low-API Implementation Plan

### V0 / Prototype

Use seeded schedule and player data.

- No live provider calls from UI.
- Update mock payload manually or with local seed.
- Prove layout and data contract.

### V1

Use provider data with cache.

- One worker pulls scoreboard/game state periodically.
- One worker pulls player/team context on a slower cadence.
- Store results in Supabase.
- Cache final `GamesFeedResponse` in Redis.
- React reads only from `/api/games/live`.

### Cache Keys

Recommended cache keys:

```txt
games:live:week:{week}
games:live:date:{yyyy-mm-dd}
game:{gameId}:summary
game:{gameId}:team:{teamId}:topPlayers
```

### Staleness Handling

Every response should include:

- `generatedAt`.
- `refreshAfterSeconds`.
- `sourceStatus`.

If provider data fails, serve stale cached data with:

```txt
sourceStatus = "stale"
```

If no live source exists, serve seeded/fallback data with:

```txt
sourceStatus = "fallback"
```

## Provider Data Needed

Minimum:

- NFL schedule.
- teams.
- game status.
- score.
- quarter/period.
- clock.
- possession.
- down and distance if available.
- player projections or 949 projections.
- team rosters/depth chart.

Nice to have:

- live player fantasy points.
- injury status.
- win probability.
- weather/stadium.
- drive chart.

## UI Notes From Prototype

Prototype structure:

- dark, full-width horizontal game strip.
- left team player stack.
- center scoreboard/game card.
- right team player stack.
- player cards show jersey number, position, team tag, risk dot, name, age, ADP, matchup, ownership.

Implementation should support:

- responsive stacking on mobile.
- multiple games in a scroll/feed.
- click player card to open Player Profile or Player Tape.
- click game card to expand full game context.
- graceful state for scheduled/final games.

## Cursor Implementation Notes

When Cursor builds Games:

- Keep it separate from Coach and GM.
- Do not hardcode only WR as receiver.
- Do not call external provider APIs from React.
- Use cached internal API payloads.
- Make refresh cadence configurable.
- Include stale/fallback status in API responses.
- Reuse shared player card data where possible.

Games should be a lightweight, cached context surface first. Deeper live analytics can come later.
