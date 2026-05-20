# 949Fantasy Page Content Spec

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-page-content-spec.md`

## Purpose

This document translates the FigJam reference notes into 949Fantasy product content requirements.

Use this with:

- `949fantasy-working-brief.md`
- `949fantasy-v1-stack.md`
- `949fantasy-metrics-glossary.md`

Claude can own visual exploration. Cursor can own implementation. Codex owns the product logic, metrics, page content, and data requirements.

## Global Navigation Direction

The ORCA reference uses a left sidebar with items like Snapshot, Business, Channels, Deep Dives, Projections, Sonar, Sonar Actions, Company, plus client/user blocks.

949Fantasy should reinterpret this as a top navigation bar:

- The ORCA wordmark becomes the `949` logo.
- Navigation tabs run left to right from the logo.
- The nav should be collapsible.
- The sidebar collapse chevron concept still applies, but adapted for top-bar behavior.

Recommended top-level sections:

- Snapshot
- Metrics
- Performance
- Rankings
- Lineup
- Games
- Players
- Draft Data
- GM
- Coach
- Settings

Secondary sections/flyouts should appear where noted below.

## HTML Alignment

The current HTML shell references these views:

- `landing`
- `dashboard`
- `metrics`
- `statistics`
- `rankings`
- `player`
- `lineup`
- `stadium-map`
- `playertape`
- `tweaks-panel`

For spec purposes:

- `dashboard` corresponds to Snapshot.
- `statistics` corresponds to Performance.
- `rankings` is an explicit first-class page.
- `lineup` corresponds to Start/Sit Studio.
- `stadium-map` corresponds to Games.
- `playertape` should be treated as a player trend or tape-analysis experience.
- `tweaks-panel` should be treated as an internal demo/configuration surface unless later requirements make it user-facing.

## Snapshot

### Snapshot Overview

Reference: Image 1.

This page should show whether a fantasy team is on track against expected points.

Replace the client spend/revenue pacing graph with fantasy football pacing:

- Team points week over week.
- Expected points week over week.
- Actual points week over week.
- Expected average points per week.
- Expected season points.

Side KPI blocks should replace Spend, CAC, ROAS, etc. with fantasy blocks:

- Points per week.
- QB average points.
- RB average points.
- WR average points.
- TE average points.
- FLEX average points.
- DST average points.
- K average points.

Each KPI block should include:

- Current value.
- Expected value.
- Percent above or below expected.
- Green for positive variance.
- Red for negative variance.

Example logic:

If 3 RBs are expected to score 300 total points across 17 games, expected RB points per game is `17.6`.

If current RB output is `16.5` points per game, show the percent below expected.

Formula note:

```txt
variance_pct = (actual_points_per_game - expected_points_per_game) / expected_points_per_game
```

Fantasy scoring definitions must be configurable because leagues may use different scoring formats.

### Snapshot Team Composition

Reference: Image 2.

The Paid vs Organic chart becomes a position-selectable Bench vs Starters chart.

Controls:

- QB
- RB
- WR
- TE
- FLEX
- DST
- K

Chart output:

- Starter points by selected position.
- Bench points by selected position.

The Sessions vs CVR chart becomes Your Players vs Field.

For a selected position group, compare:

- User roster points week over week.
- Average points for all players at that position.

Example:

If RB is selected, show how the user's RBs performed each week against the all-RB average for that week.

The Acquisition Metrics chart becomes Draft Spend.

Purpose:

- Show whether the user's draft picks are returning value relative to draft round and position group.

X-axis:

- Draft round / player selected in draft order.

Lines:

- User's drafted player points on the year.
- Highest points from any player drafted in that same round.
- Highest points from any player in the drafted player's position group.

No bars.

Data dependency:

- Requires imported draft picks from connected fantasy platforms.
- If draft pick data is unavailable for the user, this module should not show or should show a clear unavailable state.

## Metrics

### Metrics Flyout

Reference: Image 3.

The Business section becomes Metrics.

Flyout items:

- Weekly Points
- Position Metrics

### Weekly Points

Reference: Image 4.

This page is a weekly lineup heatmap.

Columns should be based on the league's starting lineup configuration.

Example default columns:

- Total
- QB
- RB
- RB
- WR
- WR
- FLEX
- TE
- DST
- K

The exact lineup slots must adapt to league format.

Heatmap toggles:

- League
- Team
- Bench

League heatmap:

- Compare each starter to all players at that same position for that week, including waiver-wire players.
- Best at position should be strong green.
- Worst at position should be strong red.

Team heatmap:

- Compare the user's lineup positions against the opponent's starting lineup positions.

Bench heatmap:

- Compare starters against bench players at the same position.
- Example: starting RBs vs benched RBs.
- If there is no comparable bench player for that position, default to white/no color.

### Metrics Overview

Reference: Image 5.

Business Overview becomes Metrics.

This page should feel like a standings-style table for team performance across weeks.

Columns:

- Weeks.

Rows:

- Points per game.
- Opponent points per game.
- Projected points per game for future weeks.
- Projected opponent points per game for future weeks.
- QB1 rank.
- RB1 rank.
- WR1 rank.
- TE rank.
- FLEX rank.
- DST rank.
- K rank.

Ranking basis:

- League-level comparison.
- Example: user's QB was #2 of 12 starting QBs in the league for a given week.
- Example: user's RB1 was #4 of 32 starting RBs/RB slots for a given week.

Future weeks:

- Show projected ranks based on projection data.

### Position Metrics

Reference: Image 6.

Site Metrics becomes Position Metrics.

Use a donut or distribution chart with toggles:

- Team metrics.
- League metrics.
- Bench metrics.

Team metrics:

- Take the user's best lineup all year.
- Show point spread by position group:
  - QB cumulative points.
  - RB cumulative points.
  - WR cumulative points.
  - TE cumulative points.
  - FLEX cumulative points.
  - DST cumulative points.
  - K cumulative points.

League metrics:

- Show position scoring across all starting lineups in the user's league.

Bench metrics:

- Show cumulative bench scoring by position group.

## Projections

Reference: Image 7.

This page should show week-by-week projected vs actual team scoring.

Main chart:

- Bars for projected points.
- Bars for actual points.
- Week-by-week totals.

Side blocks:

- Previous week actual points with percent difference.
- Current week projected points.
- Season average.
- Total points percent difference from projected.
- League average.
- League average percent difference.

League average definition:

- Average of all starting lineups across completed weeks, compared against the user's weekly totals.

## Rankings

The current HTML includes a dedicated `rankings` view, so Rankings should remain a distinct core page.

Core functions:

- Overall rankings.
- Position rankings.
- Weekly rankings.
- Rest-of-season rankings.
- Tiered rankings.
- Scoring format toggles:
  - Standard.
  - Half PPR.
  - PPR.
- Filters for:
  - Overall.
  - QB.
  - RB.
  - WR.
  - TE.
  - FLEX.
  - DST.
  - K.

Columns should include at minimum:

- Overall rank.
- Position rank.
- Player.
- Team.
- Opponent.
- Weekly projection.
- Weekly rank delta.
- Rest-of-season rank.
- Tier.
- Matchup grade.
- Risk label.
- Boom probability.
- Bust probability.
- Floor.
- Ceiling.
- ADP.
- Value score.

This page should support both a public preview state and a premium full-data state.

## Performance

### Performance Flyout

Reference: Image 8.

The Statistics section becomes Performance.

Each block can toggle between:

- Team.
- League.

Team view:

- Show position groups:
  - QB
  - RB
  - WR
  - TE
  - FLEX
  - DST
  - K
- For each group:
  - Total points for the year.
  - Percent above or below projected season total.

League view:

- Show total points so far for each position group across the league.
- Show the user's percent difference against the league for those position groups.

### Player Performance Trends

Reference: Image 9.

This page shows week-over-week trend for individual players.

Controls:

- Player dropdown for all players on the active roster.
- Player dropdown or toggle for waiver-wire players.

Chart:

- Historical weeks.
- Future projection weeks.
- Bars for ceiling and floor projections.
- Line for final points each week.

Purpose:

- Let users compare actual performance against projected range.
- Let users see whether a player's output is tracking inside or outside the modeled floor/ceiling range.

### Player Tape

The current HTML includes a `playertape` view. Treat this as a more immersive trend-analysis surface for individual player outcomes.

Purpose:

- Show a player's weekly scoring story over time.
- Blend historical actuals with future projections.
- Make the floor/ceiling shape visually legible.
- Let the user compare active-roster players and waiver-wire players.

Core content:

- Weekly actual points.
- Weekly projected points.
- Weekly floor.
- Weekly ceiling.
- Projection error by week.
- Boom/bust markers.
- Opponent.
- Home/away.
- Game conditions.

Controls:

- Player selector.
- Active roster / waiver wire source toggle.
- Year selector.
- Scoring type selector.
- Chart mode:
  - Line.
  - Candlestick/trend.

Player Tape complements Player Profile. It should not replace the summary player page.

## Lineup

The current HTML includes a dedicated `lineup` view. Treat this as the Start/Sit Studio and lineup optimization surface.

Core functions:

- Show current starting lineup.
- Show bench.
- Show projected team total.
- Show floor, median, and ceiling lineup totals.
- Show lineup lift if optimized.
- Compare current lineup to best projected lineup.
- Support swap recommendations by slot.
- Highlight regret-risk cases where a strong bench option exists.
- Show projected opponent total for context.

Position slots must adapt to league settings.

Required metrics:

- Current lineup projected points.
- Optimized lineup projected points.
- Lineup lift.
- Start confidence.
- Matchup grade.
- Risk label.
- Floor.
- Ceiling.
- Boom probability.
- Bust probability.

## Games

### Games Map

Reference: Image 10.

The Games section tracks where rostered players are playing each week.

Map:

- Use a United States map.
- Mark NFL cities.
- Do not use state-level scoring.

City dots:

- Green if the user has a player in that game.
- Blue if the opponent has a player in that game.
- Yellow if the game has no player from either team.
- Gray if the location is not in use that week.

Hover details:

- Active rostered players in that city/game.
- Indoor/outdoor.
- Weather.
- Game time.
- Temperature.
- Date/day:
  - Thu
  - Fri
  - Sat
  - Sun
  - Mon

### Games Flyout

Reference: Image 11.

Flyout items:

- Games
- Players
- Trends

### Game Conditions By Player

Reference: Image 12.

This page is named Players under the Games section.

It lists every player on the user's roster, regardless of bench or active status.

Columns:

- Stadium.
- Day.
- Weather.
- Time.
- Home/Away.

Use historical performance plus current game context.

Condition indicators:

- Green dot: historically top-third performance in this condition.
- Yellow dot: historically middle-third performance.
- Red dot: historically bottom-third performance.
- Gray dot: condition does not apply or is neutral/unavailable.

Example:

For a player who performs well indoors, on Sundays, at 1pm ET, and at home:

- Stadium = indoors, green dot.
- Weather = gray dot if irrelevant indoors.
- Day = Sun, green dot.
- Time = 1pm, green dot.
- Home/Away = Home, green dot.

Historical split notes:

- This page depends on enough game-log history to bucket player outcomes by condition.
- A minimum threshold should be enforced before showing strong red/yellow/green claims.
- If the sample is too small, use gray or low-confidence status instead of overstating the split.

## Draft Data

### Multi-Player Projection Research

Reference: Image 13.

This page is primarily for draft research and should be called Draft Data.

Users can multi-select players from different position groups.

Limits:

- Up to 6 total selected players.

Chart mode 1: Line chart.

- Shows projected points by week across the season.
- Helps users see which player is expected to trend higher across different weeks.

Chart mode 2: Trend/candlestick chart.

- Shows historical performance against projections.
- Projection for the week acts as the market open/reference point.
- If actual performance finishes above projection, use green candlestick.
- If actual performance finishes below projection, use red candlestick.
- Candlestick length represents the difference between projected and actual points.

Controls:

- Player selector.
- Chart type toggle:
  - Line.
  - Trend/candlestick.
- Year:
  - Individual years.
  - All time.
- Scoring type:
  - Standard.
  - PPR.
  - Half PPR.

This page should allow comparison across positions, not just within the same position group.

## GM

GM is the live draft-day decision tool.

V1 should be manual-first. The user mirrors their real draft by clicking players as they are selected. This lets 949Fantasy deliver a useful draft room without waiting for ESPN, Yahoo, or other platform APIs.

Core setup inputs:

- Draft position, such as `10 of 12`.
- Draft type: snake for v1.
- League size.
- Scoring type.
- Platform.
- Roster settings.
- Risk preference.

Core draft room content:

- Current pick.
- User's next pick.
- Drafted players.
- User roster.
- Draft-position value column.
- Interactive draft board.
- Draft simulator mode.
- Top 5 recommended picks.
- Survival probability to next user pick.
- Spend grade.
- Tier cliff and scarcity warnings.
- Platform edge.
- Roster construction diagnosis.

### GM Left Rail

The left side of the GM screen should show the user's current draft position value bands.

Bands:

- High Steal.
- Low Steal.
- Most Likely.
- Low Reach.
- High Reach.

Purpose:

- Translate the current draft board into a fast decision range.
- Show where available players sit relative to the user's pick capital.
- Update immediately as players are marked drafted.

Each band should include:

- Player names.
- Position.
- Team.
- 949 rank.
- Platform rank or ADP.
- Draft score.
- Survival probability to next user pick, when relevant.
- Reason badges such as `tier_cliff`, `platform_discount`, `roster_fit`, or `reach`.

Band interpretation:

- High Steal: available players who should usually have been selected earlier by 949 value and current pick capital.
- Low Steal: players modestly above current pick value.
- Most Likely: players fairly priced for the current draft slot.
- Low Reach: players slightly expensive but defensible based on roster need, scarcity, or upside.
- High Reach: players materially expensive at the current pick and generally discouraged unless the user has a specific strategy.

### GM Interactive Draft Board

The main GM surface should be an interactive draft board similar to a live draft grid.

Core behavior:

- Columns represent fantasy teams or draft slots.
- Rows represent rounds.
- Snake draft direction alternates by round.
- The user's team column is visually emphasized.
- Player tiles are color-coded by position.
- Clicking a player marks that player drafted at the current pick.
- The selected player is assigned to the corresponding team automatically from the pick count.
- Draft state advances automatically after each click.
- The left rail recalculates after every selection.

The user does not need to identify which fantasy team made each pick. They only need to click the player who was drafted. Because the draft room already knows league size, user draft slot, and snake format, GM can count picks in order and place each drafted player in the correct team column.

Example for a 10-team snake draft:

```txt
Round 1: 1,2,3,4,5,6,7,8,9,10
Round 2: 10,9,8,7,6,5,4,3,2,1
Round 3: 1,2,3,4,5,6,7,8,9,10
```

If the user drafts 5th, GM knows every pick where `team_slot = 5` belongs to the user's team.

### GM Draft Simulator

GM should also include a draft simulator mode where the user drafts against computer-controlled teams.

Purpose:

- Let users practice from their actual draft slot.
- Let users test roster construction strategies before draft day.
- Let users understand which players and positions are likely to reach them.
- Let users compare outcomes across platforms and scoring formats.

Simulator setup:

- Draft slot.
- League size.
- Draft type: snake for v1.
- Scoring type.
- Platform ranking basis.
- Roster settings.
- Computer draft behavior.
- User risk preference.

Computer draft behavior presets:

- Platform ADP: computer teams mostly follow the selected platform's draft rank.
- Balanced: computer teams blend platform rank, roster need, and positional scarcity.
- Sharp: computer teams draft closer to 949 value and punish obvious discounts.
- Chaotic: computer teams include more variance, reaches, and runs.

Simulator behavior:

- On computer picks, GM auto-selects a player for that team.
- On user picks, GM pauses and shows the left-rail value bands and recommendations.
- User can draft any available player, not only the recommendation.
- The simulator continues until the draft is complete or the user exits.
- At the end, GM produces a draft recap and roster grade.

Simulator controls:

- Start simulation.
- Pause.
- Auto-pick until my next pick.
- Undo last pick.
- Restart draft.
- Save draft result.

Simulator outputs:

- Final roster.
- Roster construction score.
- Draft grade.
- Best steal.
- Biggest reach.
- Position strengths and weaknesses.
- Picks where GM recommendation differed from user choice.
- Players repeatedly unavailable by the user's next pick across simulations.

Draft simulator should reuse the same interactive board layout. The difference is that computer picks are filled automatically instead of requiring the user to mirror a real draft.

Position filters:

- All.
- QB.
- RB.
- WR.
- TE.
- FLEX.
- DST.
- K.

When filtered:

- The board should still preserve draft context.
- Available-player lists and left-rail bands should only show eligible filtered players.
- FLEX should include RB, WR, and TE unless league settings define it differently.

Tile content:

- Player name.
- Team.
- Position.
- Optional small status indicators:
  - 949 rank.
  - ADP.
  - Platform rank.
  - Tier.
  - Risk/injury flag.

Drafted tile state:

- Show selected player in the pick slot.
- Show team assignment.
- Dim or remove the player from available-player lists.
- Support undo for mis-clicks.

Manual draft-board advantages:

- No V1 dependency on live platform integrations.
- Works across ESPN, Yahoo, Sleeper, CBS, NFL Fantasy, and home leagues.
- Lets 949Fantasy collect clean draft state when the user mirrors their league.
- Makes the GM tool useful even when provider APIs are unreliable.

### GM State Requirements

The UI must track:

- Current pick number.
- Current round.
- Current team slot.
- User draft slot.
- Draft direction.
- Drafted players.
- Available players.
- Team rosters.
- User roster.
- Filter state.
- Undo stack.

The UI should not require manual team assignment per pick. Team assignment is derived from `pick_number`, `league_size`, and `draft_type`.

After every draft action, the engine should recompute:

- Value bands.
- Top recommendations.
- Player survival probabilities.
- Positional scarcity.
- Tier cliffs.
- Roster construction.
- Spend grade.

Recommendation rows should show:

- Player.
- Position.
- Team.
- 949 rank.
- Platform rank.
- ADP.
- Draft score.
- Spend grade.
- Survival probability.
- Reason codes.

## Coach

Coach is the in-season suggestion tool.

Core content:

- Current lineup.
- Bench.
- Waiver-wire candidates.
- Projected team total.
- Floor, median, and ceiling team range.
- Start/sit swaps.
- Waiver recommendations.
- Drop candidates.
- Weakest position.
- "No move needed" state when the team is already set well.

Recommendation rows should show:

- Action.
- Player in.
- Player out, if relevant.
- Lineup lift.
- Floor change.
- Ceiling change.
- Confidence.
- Reason codes.

## Player Profile

Reference: Image 14.

The Player Profile page should include:

- Player write-up.
- Current year position rank.
- Current year ceiling prediction.
- Current year floor prediction.
- Previous year total points.
- Previous year rank.
- Number of games with advantage based on red/yellow/green condition system.
- Number of games with disadvantage.
- ADP.
- Relevant player context and notes.

Also include, when available:

- Current team role.
- Injury status.
- Opponent.
- Game conditions summary.
- Weekly projection delta versus last update.
- Historical value score.

## Draftable Players

Reference: Image 15.

This page provides a full breakdown of draftable players.

Columns:

- Player.
- Position.
- Team.
- Points per game for current season predicted.
- Ceiling.
- Floor.
- ADP.
- Overall rank.
- Position rank.
- Need fit if connected to a user's roster/draft context.

Controls:

- Toggle by position.
- Toggle/filter by roster need.
- Sort by all major metric columns.

Ranks:

- Rank all draftable players from 1 through the full draftable pool.

## Settings

Reference: Image 16.

The Settings page lets users manage account and notification preferences.

Settings should include:

- Push notifications.
- Email notifications.
- Lineup change alerts.
- Last-minute injury alerts.
- Additional manager login access.

## League Connections

Reference: Image 17.

This page lets users connect fantasy leagues by API.

Initial platforms requested:

- ESPN.
- Yahoo.
- DraftKings.

Also consider Sleeper as the first practical integration because the API is public and easy to prototype.

Important product note:

- ESPN, Yahoo, and DraftKings may not all offer equally practical or public import paths for v1.
- The UI can show these platforms as aspirational options, but the implementation plan should start with the providers we can reliably support.

UI:

- Add league block with plus sign.
- Text: Add league.
- User selects platform.
- App walks through connecting/importing the league.

Data dependency:

- Draft picks and some draft-spend features should only show when a connected platform provides usable draft history.

## Cross-Cutting Data Requirements

### League Configuration

The app must know each league's:

- Scoring format.
- Starting lineup slots.
- Bench slots.
- Number of teams.
- Schedule.
- Rosters.
- Draft results, if available.
- Waiver-wire availability snapshots, if available or derivable.

### Scoring Format

Support at least:

- Standard.
- Half PPR.
- PPR.

Future:

- Custom scoring imported from the connected platform.

### Comparison Universes

Many metrics depend on comparison context. Store the comparison scope explicitly:

- User team.
- Opponent.
- Bench.
- League starters.
- Full league rosters.
- Waiver wire.
- All NFL players at position.

### Color/Status System

Use consistent meaning:

- Green: positive, above expected, top-third, advantage.
- Yellow: average/middle-third, neutral.
- Red: negative, below expected, bottom-third, disadvantage.
- Blue: opponent/team distinction on game map.
- Gray/white: unavailable, neutral, not applicable, no comparable data.

## Data Dependencies By Feature

| Feature | Required Data |
|---|---|
| Team points pacing | User roster, weekly scoring, projections, league scoring rules |
| Position KPI blocks | Position slot mapping, actual points, expected points |
| Bench vs starters | User roster, weekly lineup status, bench scoring |
| Your players vs field | Position weekly scoring for user players and all players |
| Draft spend | Draft picks, ADP, player season points, position group leaders |
| Weekly heatmap | Lineup slots, opponent lineup, bench, league/position scoring |
| Metrics standings table | Weekly team totals, opponent totals, slot-level ranks |
| Position metrics donut | Cumulative points by position for team/league/bench |
| Projections page | Weekly projections, actuals, league averages |
| Rankings | Weekly projections, ROS projections, tiers, value score, ADP, matchup data, risk/boom-bust, scoring format |
| Performance blocks | Season points, projected totals, league position totals |
| Player trend chart | Player weekly actuals, floor, ceiling, future projections |
| Player Tape | Player weekly actuals, projected points, floor/ceiling, projection error, opponent, game conditions |
| Lineup / Start-Sit | Current roster, lineup slots, bench options, opponent, projections, floor/ceiling, matchup and risk data |
| Games map | NFL schedule, stadiums, city coordinates, weather, rosters |
| Game condition dots | Historical player splits by stadium/day/weather/time/home-away |
| Draft Data | Player projections, history, scoring type, ADP |
| Player Profile | Player stats, ranks, ADP, floor/ceiling, condition advantage model |
| Draftable Players | Draft pool, projections, floor/ceiling, ADP, roster needs |
| Notifications | User preferences, injury feed, lineup changes, game locks |
| League Connections | Platform APIs, auth, league/roster/draft import |
