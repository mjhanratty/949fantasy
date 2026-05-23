# 949Fantasy Cursor Piping Handoff

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-cursor-piping-handoff.md`


## Purpose

This document tells Cursor what data contracts, API routes, fallback states, and derived model outputs the current 949Fantasy pages need.

Claude owns visual/UI exploration. Cursor should preserve the existing layout intent and wire the views to typed data contracts. Codex owns product logic, metrics, schemas, provider strategy, scoring methodology, and Vercel/Supabase data connections.

Related update: see `949fantasy-coach-gm-cache-weekly-ops.md` for the Coach/GM cache plan, weekly Value Score refresh cadence, manual waiver paste fallback, GM simulator recap requirements, and SEO/content generation implications.

Games update: see `949fantasy-games-feed-handoff.md` for the planned Games surface, top QB/RB/receiver selection rules, live/cached game feed contract, and low-API refresh strategy.

Content automation update: see `949fantasy-claude-content-piping.md` for Claude / Claude Cowork content brief endpoints, auth, packet shapes, and safety boundaries.

## Current HTML / React Framing Read

The supplied `949Fantasy (2).zip` contains the current view code:

- `src/views/dashboard.jsx`
- `src/views/lineup.jsx`
- `src/views/metrics.jsx`
- `src/views/rankings.jsx`
- `src/views/stadium-map.jsx`
- `src/views/statistics.jsx`
- `src/views/playertape.jsx`
- `src/views/player.jsx`
- shared `src/data.jsx`, `src/app.jsx`, `src/primitives.jsx`, `src/icons.jsx`

Cursor should treat this as the current component framing. The mock globals like `window.PLAYERS`, `window.TEAM_POSITION_WEEKS`, and `window.POSITION_PERFORMANCE` should become typed API responses or server-loaded props.

## Global Product Requirements

### Franchise Selector

Add a franchise/team selector near the account area.

Required behavior:

- User can switch between fantasy teams/franchises.
- User can add a new franchise.
- "Add new franchise" launches setup.
- Each franchise stores platform, league size, scoring, roster settings, draft position, and team name.
- Franchise settings must be accessible after setup.

Setup questionnaire:

- Platform: Yahoo, Sleeper, ESPN, CBS, NFL Fantasy, Manual/Home League.
- Number of teams.
- Draft position.
- Draft type.
- Scoring type: Standard, Half PPR, Full PPR.
- Roster slots.
- Bench slots.
- K/DST enabled or disabled.
- Superflex / second QB support.
- Whether user drafted with GM.
- Whether user wants to manually upload drafted players.
- Whether user wants to manually upload opponent teams.

Fallback:

- If no league sync and no GM draft board history exists, app can only analyze the user's manually uploaded roster.
- Opponent and league-level modules must show unavailable or use tier benchmark fallbacks.

### Manual Roster Upload

Even if the user does not draft with GM, support manual roster entry.

Required behavior:

- User enters players in draft order or roster order.
- App maps names to canonical player IDs.
- App asks user to resolve ambiguous player names.
- On completion, app returns a draft/roster score and assessment.
- User may optionally load opponent teams.

This creates the minimum viable data state for Coach and Analytics without platform integration.

## Data Availability Modes

Cursor should support these modes explicitly.

| Mode | Meaning | Supported Product State |
|---|---|---|
| `connected_league` | Yahoo/Sleeper API sync available | Full roster, matchup, opponent, waiver, lineup history where provider supports it |
| `manual_draft_room` | User used GM live draft board | Full initial league rosters from draft day, but no later add/drop/trade unless manually updated |
| `manual_user_roster` | User only uploaded their own team | User lineup, Coach start/sit, player trends, limited waiver/benchmark views |
| `demo_or_empty` | No real user data | Demo data, onboarding, or setup prompts |

League benchmark fallback:

- If opponent/team league data is unavailable, use average of tier 1-3 players at the relevant position as the benchmark.
- The tier system must come from 949 rankings and should exist before dependent modules are treated as final.

## Analytics Page Piping

### Team Points - Week Over Week

Existing view: `dashboard.jsx`, `WoWChart`.

Needs:

- Actual points by week.
- Projected points by week.
- Rest-of-season projected points.
- Expected average.
- Opponent projected points.
- Opponent actual points.
- Win/loss result for actual dots.

Data route:

- `GET /api/franchises/:franchiseId/analytics/team-points`

Response shape:

```ts
type TeamPointsWeek = {
  week: number
  played: boolean
  actualPoints: number | null
  projectedPoints: number
  expectedAverage: number
  opponentProjectedPoints: number | null
  opponentActualPoints: number | null
  result: "win" | "loss" | "tie" | null
}
```

Fallbacks:

- Yahoo/Sleeper connected: use provider matchup data plus 949 projections.
- Manual draft room only: show user actual/projected; show opponent data only if user maintains opponent lineups.
- Manual user roster only: no opponent actual/projection.
- ESPN/CBS/NFL Fantasy: show unsupported sync note unless manually maintained.

### Performance vs Expected

Existing view: `dashboard.jsx`, `PositionBlock`.

Definition:

Expected is pacing against season total:

```txt
expected_points_to_date =
  season_expected_points * completed_weeks / fantasy_regular_season_weeks

pace_vs_expected_pct =
  (season_actual_points_to_date - expected_points_to_date)
  / expected_points_to_date
```

Use the user's scoring type.

Needs:

- Position group actual points to date.
- Position group season expected points.
- Current starter by position slot.
- Bench players by position group.
- Expanded block details: starter and bench pacing.
- Decimal scoring only if scoring system allows decimals.

Data route:

- `GET /api/franchises/:franchiseId/analytics/position-performance`

Cursor behavior:

- Collapsed block shows current active starter/slot group.
- Expanded block shows starter and bench players.
- If lineup is changed in app, blocks recalculate against the active lineup state.

### Starters vs Bench

Existing view: `dashboard.jsx`, `BenchStartersCard`.

Needs:

- Current active lineup.
- Bench.
- Points/projection split by selected position.
- Reflect drops/adds if league is synced or manually updated.

Data route:

- `GET /api/franchises/:franchiseId/analytics/starters-bench`

### Your Players vs Field

Existing view: `dashboard.jsx`, `YourVsFieldCard`.

Needs:

- User roster/player scores by week.
- Field comparison by position.
- League teams if available.
- Tier 1-3 average fallback if league data unavailable.

Data route:

- `GET /api/franchises/:franchiseId/analytics/players-vs-field`

Fallback:

- Connected/manual full league: compare against league.
- User-only roster: compare against 949 tier 1-3 positional average.

### Draft Spend

Existing view: `dashboard.jsx`, `DraftSpendCard`.

Purpose:

- Compare expected draft capital against actual return.
- Not reactive to current lineup.
- Reflect primary draft-day picks for the expected starter structure.

Needs:

- User draft picks.
- Draft ranking/ADP at time of draft.
- Season-to-date actual points.
- Position expected starter mapping.
- League comparison where available.
- Tier 1-3 fallback if league data unavailable.

Primary slots:

- First QB selected.
- First two RB selections, or roster-configured RB count.
- First two WR selections, or roster-configured WR count.
- First TE selection.
- FLEX-eligible starters by draft role.
- DST/K if configured.

Data route:

- `GET /api/franchises/:franchiseId/analytics/draft-spend`

### News

Existing view: `dashboard.jsx`, `NEWS`.

Needs:

- Player news from provider.
- User-rostered player prioritization.
- Breaking news after rostered-player news.
- Source URL, source name, timestamp, injury tags.

Data route:

- `GET /api/franchises/:franchiseId/news`

Provider:

- SportsDataIO news for V1.
- Optional external RSS/news ingestion later.

## Start/Sit Studio Piping

Existing view: `lineup.jsx`.

### Projected Total

Needs:

- Active roster lineup.
- Weekly projected points per player.
- Floor, median, ceiling per player.
- Lineup floor, median, ceiling.
- Confidence percentile.
- Opponent projected total if opponent data available.

Data routes:

- `GET /api/franchises/:franchiseId/lineup`
- `POST /api/franchises/:franchiseId/lineup/preview`
- `POST /api/franchises/:franchiseId/lineup/optimize`

Calculation:

```txt
lineup_projected_total = sum(player_week_projection)
lineup_floor = sum(player_floor)
lineup_median = sum(player_median)
lineup_ceiling = sum(player_ceiling)
```

Optimization modes:

```txt
median_lineup = maximize(sum(player_median))
floor_lineup = maximize(sum(player_floor))
ceiling_lineup = maximize(sum(player_ceiling))
```

Cursor should support all three because the user is choosing a risk posture, not just a raw point maximum.

- Median is the default lineup recommendation.
- Floor is the safer lineup when the user is favored or protecting a lead.
- Ceiling is the chase lineup when the user needs upside.
- If the median lineup gives only a tiny lift but lowers floor materially, Coach should say the move is not worth the added downside unless the user is chasing ceiling.
- If all three modes select the same players, show the lineup as high-consensus.
- If the modes diverge, show the tradeoff clearly instead of hiding it behind one optimized total.

Floor and ceiling must be player-specific. Do not use one position-wide QB/RB/WR range for every player. Player volatility, role stability, historical miss profile, availability risk, and archetype should drive the width of the weekly range.

Floor and ceiling are likely-performance bands. They are not absolute career-low and career-high scores. Cursor should preserve outlier context in model outputs so Coach can distinguish:

- below-floor injury/early-exit games.
- below-floor benching or playoff-safety games.
- below-floor bad games with normal role.
- above-ceiling spike games with normal role.
- above-ceiling games caused by a real role change.

Do not automatically move a player's core median/floor/ceiling after one or two scoring misses if role, snaps, routes/touches/attempts, and availability are intact. In that case, keep the projection stable and reduce confidence or add a watch note. Move the forward projection only when the miss reveals a changed role, health issue, team context shift, or sustained usage change.

### Active Roster

Needs:

- Roster slots from user league settings, not hardcoded.
- Support no K, no DST, no K and no DST.
- Support Superflex or second QB.
- Player team color/shading.
- Position.
- NFL opponent.
- Home/away.
- Kickoff time.
- Injury status.
- Matchup grade.

Cursor should replace the hardcoded `SLOTS` array with roster settings loaded per franchise.

### Bench

Needs:

- Bench players.
- Swap support between bench and active lineup.
- Label should be `Bench`, not `Bench & reserves`.

Swap route:

- `POST /api/franchises/:franchiseId/lineup/swap`

## Coach Piping

Coach lives on or near the Start/Sit Studio tab.

V1 behavior:

- User can click `Insight` to generate a lineup/bench recommendation.
- User can ask direct questions like `Allen vs Mahomes`.
- Coach answers from structured model outputs, not model memory.
- Coach is advisory only. It does not automate, submit, or manage lineups/transactions.
- User implements decisions on the actual fantasy platform.

Data routes:

- `POST /api/coach/insight`
- `POST /api/coach/question`

Coach context payload:

```ts
type CoachContext = {
  franchiseId: string
  week: number
  scoringType: "standard" | "half_ppr" | "ppr"
  lineup: LineupSlot[]
  bench: PlayerProjection[]
  waiverCandidates?: PlayerProjection[]
  opponent?: OpponentContext | null
  injuries: InjuryReport[]
  schedule: GameContext[]
}
```

Coach must support:

- Start/sit comparisons.
- Floor/ceiling tradeoffs.
- Boom scenario recommendations.
- Safer floor recommendations.
- Trend-based bench/watch/drop considerations.
- Waiver suggestions only where availability or roster percentage data supports the language.
- "No move needed" when the lineup is already set appropriately.

Coach question examples:

- "How's my lineup this week?"
- "Should I play Mahomes over Allen?"
- "Which WR has the best boom chance?"
- "Who has the highest ceiling at RB on my team this week?"
- "Who is trending down on my bench?"

Coach scenario templates:

- Highest Ceiling.
- Best Boom Chance.
- Safest Bet.
- Best Floor.
- Need Upside.
- Protect Lead.

Coach waiver language rules:

- If league waiver data exists, Coach may say a player is available.
- If league waiver data does not exist, Coach must use "if available," "watch list," or roster-percentage language.
- Coach should not claim a player is available in the user's league without league state.

Coach should surface Player Tape-style usage trends:

- Snap share.
- Route participation.
- Target share.
- Carry share.
- Red-zone usage.
- Fantasy points vs projection.
- Home/away splits.
- Indoor/outdoor and schedule context.

## Stadium Map Piping

Existing view: `stadium-map.jsx` and assets include `us-map.svg`, `us-map-albers.png`, `us-map-dots.png`.

Needs:

- NFL stadium coordinates.
- City/team mapping.
- Weekly NFL schedule.
- Indoor/outdoor designation.
- Roof/surface where available.
- Weather by stadium and kickoff window.
- User active roster players in each game.
- Opponent players in each game when opponent data exists.

Data route:

- `GET /api/franchises/:franchiseId/week/:week/stadium-map`

Fallback:

- If no opponent data, do not show blue opponent dots.
- Use yellow for active NFL games.
- Use green where the user has active players.
- Gray inactive/no game.

## Your Players This Week

Needs:

- Active lineup.
- NFL opponent.
- Game time.
- Venue.
- Indoor/outdoor.
- Weather.
- Injury status.
- Projection.

Can share the stadium-map route or use:

- `GET /api/franchises/:franchiseId/week/:week/player-games`

## Draft Tab Piping

Draft is a new tab.

Subsections:

- Draft Rankings.
- Draft Board.
- Draft Score.
- GM.
- Draft Simulator.

### Draft Rankings

Moved from Projections/Player Breakdown.

Needs:

- Draftable players.
- 949 rank.
- Position rank.
- Platform rank.
- ADP.
- Projection.
- Floor.
- Ceiling.
- Tier.
- Risk.
- Scoring type.
- Platform filter.

Data route:

- `GET /api/draft/rankings`

### Draft Board

Manual live draft board.

Needs:

- Platform-specific rankings, including ESPN top 300 where available.
- Player pool.
- Draft settings.
- Snake pick order.
- Position filters: All, QB, RB, WR, TE, FLEX, DST, K.
- Click-to-draft.
- Automatic team assignment from pick count.
- Undo.
- Live/Simulator selector.

Data routes:

- `POST /api/gm/draft-room`
- `GET /api/gm/draft-room/:draftRoomId`
- `POST /api/gm/draft-room/:draftRoomId/pick`
- `POST /api/gm/draft-room/:draftRoomId/undo`

### Draft Score

Needs:

- Pick-by-pick grade.
- Draft spend grade A+ to F.
- High Steal, Mid Steal, Low Steal, Expected, Low Reach, Mid Reach, High Reach.
- User picks listed first to last.
- Ability to inspect other teams.

Data routes:

- `GET /api/gm/draft-room/:draftRoomId/score`
- `GET /api/gm/draft-room/:draftRoomId/teams/:teamSlot/score`

### GM Sidebar

Needs:

- Reactive to draft board.
- Seven bands:
  - High Steal.
  - Mid Steal.
  - Low Steal.
  - Expected.
  - Low Reach.
  - Mid Reach.
  - High Reach.
- Filterable by position and best overall.
- Tracks positional runs.
- Tracks roster construction.
- Warns when a position is drying up.

Data route:

- `GET /api/gm/draft-room/:draftRoomId/recommendations`

### GM Ticker Tape

Needs:

- Live list of picks.
- Pick number, round, team slot, player, position, NFL team.
- Draft grade.
- Value band.
- Reason codes.

Data route:

- `GET /api/gm/draft-room/:draftRoomId/ticker`

### GM Available / Selected Board Toggle

Needs:

- Available board view.
- Selected board view.
- Selected board shows teams/rounds/picks as drafted.
- Available board shows draftable remaining players with filters.

State:

- `boardMode: "available" | "selected"`

### GM Queue

Needs:

- Add/remove queued players.
- Queue order.
- Red/yellow/green status dots.
- Survival probability to next pick.
- Reason codes for status change.

Data routes:

- `GET /api/gm/draft-room/:draftRoomId/queue`
- `POST /api/gm/draft-room/:draftRoomId/queue`
- `DELETE /api/gm/draft-room/:draftRoomId/queue/:playerId`

### GM Position Run Alerts

Needs:

- Detect runs by position.
- Show alert when run is material.
- Dismiss alert.
- Focus alert to change left rail filter to that position.

Data routes:

- `GET /api/gm/draft-room/:draftRoomId/alerts`
- `POST /api/gm/draft-room/:draftRoomId/alerts/:alertId/dismiss`

### GM Value Grades

Needs:

- Last Season Grade.
- Projected Grade.
- Career Grade.
- Value formula:

```txt
player_value = player_points / position_group_average_points
```

Grade mapping:

- `A+`: above `1.00`.
- `A`: `0.90` to `1.00`.
- `B`: `0.80` to `0.89`.
- `C`: `0.70` to `0.79`.
- `D`: `0.60` to `0.69`.
- `F`: anything below `0.60`.

Data route:

- `GET /api/players/:playerId/value-grades`

### Draft Simulator

Needs:

- Draft against computer teams.
- Same board as live mode.
- Computer behavior presets.
- Auto-pick until user's next pick.
- Final roster grade.
- Controlled randomness so simulations do not draft the same way every time.
- Mix of reaches, steals, expected picks, and position runs.
- Fast repeated simulations for strategy testing, in the spirit of tools like FantasyPros Draft Wizard / Mock Draft Simulator.

Data routes:

- `POST /api/gm/simulator`
- `POST /api/gm/simulator/:draftRoomId/autopick`
- `GET /api/gm/simulator/:draftRoomId/result`

## Metrics Page Piping

Existing view: `metrics.jsx`.

Needs:

- Weekly points by dynamic roster settings.
- Do not hardcode `QB-RB-RB-WR-WR-TE-FLEX-DST-K`.
- Support custom lineup configurations.
- League, opponent, bench comparison scopes.
- Tier 1-3 fallback when no opponent/league data exists.

Data route:

- `GET /api/franchises/:franchiseId/metrics/weekly-points`

## Statistics / Performance Piping

Existing view: `statistics.jsx`.

Notes:

- This is a copy/variant of Analytics blocks.
- Use the same data contracts as Analytics unless a later design separates the two.

## Player Trends / Player Tape Piping

Existing views: `playertape.jsx`, statistics player trends.

Naming:

- Use `Player Tape`.
- Remove `Candles`.
- Use `Proj` and `Final` instead of `Open (proj)` and `Actual (close)`.

Needs:

- Weekly projection.
- Final actual points.
- Weekly floor.
- Weekly ceiling.
- Projection error.
- Opponent.
- Home/away.
- Game conditions.
- Trend history.

Data routes:

- `GET /api/players/:playerId/tape`
- `GET /api/franchises/:franchiseId/player-trends`

## Projections Cleanup

- `Projections/Player Breakdown` moves to `Draft Rankings`.
- `Projections/Lineup Optimizer` moves under `Coach`.

## Provider / Data Connections Needed In Vercel

These are the data connections Codex/user will build or configure as needed.

### V0 Test

- Free NFL data source for players, teams, schedules, and basic stats.
- Manual player/ranking seed data if free provider coverage is incomplete.
- 949 draft rankings seed.
- Platform ranking ingestion where available by file/import.
- GM deterministic recommendation functions.
- Coach deterministic lineup context functions.

### V1 Core

- SportsDataIO API:
  - Players.
  - Teams.
  - Schedules.
  - Stadiums/venues.
  - Game stats.
  - Season stats.
  - Projections.
  - Injuries.
  - News.
  - Weather if available.
  - ADP/rankings if licensed.
- Yahoo Fantasy API:
  - Auth/OAuth.
  - Leagues.
  - Rosters.
  - Matchups.
  - Lineups.
  - Transactions where available.
- Sleeper API:
  - User leagues.
  - Rosters.
  - Drafts.
  - Draft picks.
  - Matchups.
  - Transactions where available.
- ESPN top 300/platform rankings:
  - Ranking ingestion as draft-market input.
  - No full ESPN league sync in V1 unless a reliable path is confirmed.
- Weather provider if SportsDataIO weather is insufficient:
  - Stadium forecast by kickoff.
- News provider:
  - SportsDataIO first.
  - External source aggregation later if needed.

### V2 Expansion

- ESPN league integration through provider adapter.
- CBS/NFL Fantasy research only until stable access is confirmed.
- Auction draft support.
- More advanced learned opponent behavior.

## Cursor Implementation Priorities

1. Replace mock `window.*` globals with typed loader/API data boundaries.
2. Add franchise selector and setup questionnaire.
3. Make roster slots dynamic per franchise settings.
4. Add data availability mode handling and fallback UI.
5. Wire Analytics to API-shaped mock responses.
6. Wire Start/Sit Studio to lineup state and preview/optimize routes.
7. Add Coach shell and request/response contracts.
8. Add Draft tab shell with Draft Rankings, Draft Board, Draft Score, GM, and Simulator sections.
9. Add manual draft-room state, click-to-draft, undo, and snake team assignment.
10. Add GM sidebar consuming recommendation/value-band JSON.
11. Add Player Tape data contract and rename labels.
12. Leave provider-specific implementation behind adapter interfaces.

## Non-Negotiable Logic Boundaries

- Do not call third-party providers directly from React components.
- Do not hardcode lineup slots.
- Do not require opponent data to render user-only views.
- Do not show opponent-specific claims when opponent data is unavailable.
- Do not make Coach or GM rely on LLM memory for projections, rankings, or injury facts.
- Do not block GM V1 on ESPN/Yahoo/Sleeper full sync.
- Manual draft board and manual roster upload must be first-class fallback paths.
