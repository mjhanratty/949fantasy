# 949Fantasy Working Brief

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-working-brief.md`


## Role Split

- Codex: product logic, data model, ranking methodology, implementation requirements, QA criteria, and build handoff notes.
- Cursor: application build.
- Claude: UI exploration and visual design.

When future page breakdowns include ownership labels, Codex should focus on the items under Codex and stay aware of Cursor/Claude work only where it affects data, logic, or implementation requirements. UI-only sections owned by Claude can be treated as context rather than Codex scope.

## Source Files

- `/Users/matthewhanratty/Downloads/Fantasy Football V2.0.xlsx`
- `/Users/matthewhanratty/Downloads/Fantasy Football V2.0 (1).xlsx`
- `/Users/matthewhanratty/Downloads/949Fantasy Roadmap.docx`
- `/Users/matthewhanratty/Downloads/949Fantasy.pptx`
- `/Users/matthewhanratty/Downloads/949Fantasy` Figma/FigJam export bundle
- `/Users/matthewhanratty/Downloads/949fantasy.jam`
- `/Users/matthewhanratty/Downloads/949fantsyv2.html`
- `/Users/matthewhanratty/Desktop/Marketing Logo.png`
- `/Users/matthewhanratty/Desktop/Optional.png`
- `/Users/matthewhanratty/Desktop/Secondary Logo.png`
- `/Users/matthewhanratty/Desktop/Primary Logo.png`

## Cursor / Claude Handoff Docs

- `949fantasy-working-brief.md`: product thesis, brand, early source read, architecture themes.
- `949fantasy-v1-stack.md`: implementation stack, APIs, provider strategy, schema direction.
- `949fantasy-page-content-spec.md`: FigJam notes translated into page content, metrics, toggles, and data dependencies.
- `949fantasy-metrics-glossary.md`: metric names, definitions, formulas, priorities, and validation rules.
- `949fantasy-draft-market-engine.md`: GM and Coach market-engine architecture, draft theory knowledge base, scoring pipeline, simulations, and AI boundaries.
- `949fantasy-evaluator-layering-spec.md`: shared evaluator architecture for GM and Coach, consensus layering, deterministic vs AI responsibilities, and player lifecycle/cliff modeling.
- `949fantasy-draft-theory-source-notes.md`: article/research-derived draft theory notes used to ground the GM engine.
- `949fantasy-cursor-piping-handoff.md`: Cursor-facing data/API piping instructions for current pages, GM/Coach, fallbacks, and Vercel connections.
- `949fantasy-data-source-matrix.md`: full data source table for supporting Claude-created views, Coach, GM, Draft, Analytics, and Vercel integration planning.
- `949fantasy-vercel-env-plan.md`: prioritized Vercel environment variable plan for V0 testing, free NFL data, Supabase, Coach/GM, and V1 provider integrations.
- `949fantasy-workbook-analysis-notes.md`: workbook-specific analysis of `Fantasy Rankings`, value grading, current floor/ceiling formulas, validation gaps, and production model requirements.
- `949fantasy-localhost-rapidapi-notes.md`: local Next.js scaffold status, RapidAPI route test notes, and remaining `.env.local` blocker for live NFL data.
- `949fantasy-coach-gm-cache-weekly-ops.md`: Coach/GM cache strategy, weekly Value Score refresh cadence, manual waiver paste fallback, GM simulator recap requirements, and SEO/content operations notes.
- `949fantasy-player-value-modeling.md`: position-agnostic player value modeling handoff, current QB validation slice, baseline pool rules, fragile value concept, and next model-layer requirements.

## Current HTML View Inventory

The current HTML shell references these application views/components:

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

Interpretation for product/docs:

- `dashboard` maps to Snapshot / team overview.
- `metrics` maps to Weekly Points, Metrics Overview, and Position Metrics.
- `statistics` maps to Performance.
- `rankings` is now an explicit surface and should remain first-class in the product spec.
- `player` maps to Player Profile.
- `lineup` maps to Start/Sit Studio.
- `stadium-map` maps to Games.
- `playertape` should be treated as a player trend / tape-style performance exploration surface.
- `tweaks-panel` appears to be an internal demo or configuration utility and should not be treated as a core user-facing page unless the implementation proves otherwise.

## Mission

Build a fantasy football platform that provides player insight, season outlooks, and decision support at a depth not currently available at the intended price point.

The core promise is not just rankings. It is a sharper interpretation layer around player value, floor/ceiling range, trends, and draft/start-sit decisions.

## Brand Signals

- Name: `949Fantasy`
- Positioning language: fantasy football analytics, fantasy intelligence platform, built for serious fantasy players.
- Primary price anchor: `$9.49` season pass.
- Visual direction from current assets: black base, mint/green primary mark, strong block typography, analytics-line motif.
- Logo asset dimensions:
  - Marketing Logo: 586 x 662
  - Optional: 892 x 680
  - Secondary Logo: 886 x 442
  - Primary Logo: 938 x 826

## Product Pillars

- Premium weekly rankings.
- Player projections.
- Player trends and history.
- Start/sit intelligence.
- Draft value discovery.
- Dynamic draft market engine for GM.
- Coach suggestions for lineup, waivers, and "no move needed" weeks.
- Player pages with usage, matchup, floor, median, ceiling, risk, boom/bust, and comparable-player context.
- Freemium/premium walls where free users see enough value to understand the product and premium users unlock the full board.

## Proprietary Thesis

### Player Value

Player value compares a player's production against positional averages.

Example from the roadmap:

- If QBs averaged 315 fantasy points last season and a player scored 385, value is `385 / 315 = 1.22`.
- A value of `1.0` represents roughly median positional production.
- A value above `1.0` indicates the player is creating more points than the average player at the same position.

Product interpretation:

- Value should help users understand relative scoring power, not just raw fantasy points.
- The UI should make it easy to understand statements like: when an average player earns 10 points, a 1.3-value player is expected to produce around 13 and a 0.6-value player around 6.
- This should become one of the platform's signature metrics.

### Floor And Ceiling

Goal: provide a player range that captures expected outcomes with at least a 70% hit rate, excluding meaningful injury-missed-season contexts.

Important caveat:

- Personnel issues, injuries, role changes, and team context cannot be perfectly accounted for.
- The model should represent uncertainty honestly instead of pretending precision.

### Draft Steals

The draft experience should help users identify where a player is undervalued relative to expectation.

Desired concept:

- If drafting from a specific slot in a 10-team, 12-team, or similar league, show a heatmap-style board predicting who is likely available at future picks.
- Inputs should include ADP and previous player selections.
- Output should guide users toward likely value pockets rather than just a static rank list.

## Desired Data Inputs And Metrics

The roadmap explicitly calls for:

- NFL API data v1.
- Individual player floor and ceiling for current-year prediction using prior-year data.
- Week-to-week floor/ceiling tracker: on pace, above pace, below pace, likely percentage-based.
- Weekly trends going back 3 years.
- Points per game going back 3 years.
- ADP.
- Draft spot predictor.
- Player value.
- YAC.
- Yards at first contact.
- Air yards per attempt.
- Air yards at catch.
- Catch percentage.
- Target share percentage.
- Targets per game.
- Recorded history plus future predictions based on past proof.

## Early Workbook Read

Workbook tabs:

- `Rankings`
- `Fantasy-Pts`
- `Fantasy Rankings`
- `Value Test`
- `Game Value Test`
- `Prediction Test 25`
- `Player-Stats`
- `Season-Stats-QB`
- `NFL-Position`
- `NFL-Master`
- `Stats-QB`

Current workbook themes:

- Historical fantasy point tables.
- Position-level ranking formulas.
- Player value formulas by position group.
- Floor/ceiling experiments.
- Game-level value tests.
- Prediction tests for 2025 and 2026.
- Raw-ish NFL master weekly data.
- Position-specific stat and fantasy-point summaries.

Implementation caution:

- The workbook is useful as a prototype of intent, not as production architecture.
- Some formulas use Excel-specific or Google/Excel translated functions such as `DUMMYFUNCTION`, so model logic should be re-specified before being copied into code.

## PPTX Mockup Surfaces

The draft deck has 5 main product screens:

1. Landing/home page with hero, edge board preview, stats cards, and season pass CTA.
2. Team dashboard / matchup projection with win probability, projected score, season trajectory, news, and wire context.
3. Rankings / Edge Board with scoring format filters, position tabs, tiers, projected points, weekly delta, matchup, risk, boom/bust, trend, and rest-of-season points.
4. Start/Sit Studio with lineup builder, auto-optimize, locks, floor/median/ceiling range, active roster cards, projections, matchup labels, and swap actions.
5. Player detail page with rank, position, player metadata, watch/trade/start actions, projection cards, trend chart, usage metrics, 949 take, boom/bust, news, and comparable players.

## Figma Layout Reference

The `/Users/matthewhanratty/Downloads/949Fantasy` bundle is a Figma/FigJam export with `canvas.fig`, `thumbnail.png`, `meta.json`, and embedded PNG assets.

Readable metadata:

- File name: `Untitled`.
- Exported at: `2026-05-19T12:44:43.688Z`.
- Canvas thumbnail: 208 x 400.
- Canvas render area: 3392 x 6531.636.
- Visual theme background from metadata: dark gray `rgb(30,30,30)`.

The embedded screenshots appear to show a dense analytics dashboard layout system branded `ORCA`, not fantasy football content. Treat this as layout/UI inspiration rather than product source material.

Useful layout cues:

- Persistent left sidebar with primary navigation, active state, compact user/company area, and secondary actions.
- Top browser/app chrome and dense in-app toolbar patterns.
- Cream/light data canvas paired with dark sidebar.
- Analytics-first views with wide tables, heatmaps, KPI cards, charts, maps, and settings panels.
- Strong support for operator workflows: dashboards, channels, deep dives, projections, settings, reports, and performance screens.
- Tables use color heatmaps and conditional formatting, which maps well to fantasy rankings, draft value, ADP availability, matchup grades, and risk/boom-bust signals.
- Chart-heavy screens demonstrate multi-panel layouts that could translate to player detail, team dashboard, projection accuracy, and model validation views.

949 application interpretation:

- Use the ORCA-style structure for authenticated product surfaces, especially dashboard/rankings/model tools.
- Keep 949's black/mint brand for marketing and fantasy identity, but do not let the premium product become only a dark marketing page.
- For serious tools, prefer dense, scannable, data-rich layouts over oversized hero/cards.
- Preserve fantasy-specific navigation: Dashboard, Rankings, Start/Sit, Players, Draft, News, Settings, Season Pass.

## Initial App Information Architecture

- Home / marketing preview.
- Dashboard.
- Metrics.
- Performance.
- Rankings.
- Start / Sit.
- Games.
- Players.
- Draft Data.
- GM.
- Coach.
- Season Pass / pricing.

## Data Model Direction

Core entities likely needed:

- Player
- Team
- Season
- Week
- Game
- PlayerWeeklyStat
- PlayerSeasonStat
- Projection
- Ranking
- Tier
- ADP
- DraftRoom / DraftState
- UserLeague
- UserRoster
- NewsItem
- Subscription

Derived model outputs:

- Projected points.
- Floor.
- Median.
- Ceiling.
- Value score.
- Positional value index.
- Boom probability.
- Bust probability.
- Risk label.
- Matchup grade.
- Rest-of-season projection.
- Weekly movement delta.
- Draft availability probability.
- Draft score.
- Spend efficiency grade.
- Value over next available.
- Market discount.
- Platform edge.
- Roster portfolio score.

## Current Data Source Gaps

The current product/design direction now clearly requires more than generic player stats and projections.

We also need clean access to:

- Stadium and venue metadata:
  - indoor/outdoor
  - roof state when relevant
  - city coordinates
  - timezone
- Kickoff and schedule context:
  - game date
  - game day
  - kickoff time
  - home/away
- Weather snapshots or forecasts by game.
- Historical weekly game logs by player, opponent, and venue.
- Historical defensive allowance by fantasy position.
- Draft history imports by platform.
- Starting lineup history by week.
- Bench and waiver-wire comparison data.
- Platform-specific league settings and scoring rules.

This means our provider plan must support not just rankings and projections, but also:

- Games map.
- Condition split dots.
- Player tape / trend views.
- Lineup optimization.
- Draft-spend and round-return metrics.
- League/bench/waiver comparisons.

## Model Requirements To Define Before Build

- Scoring format support: PPR, half-PPR, standard.
- Position support: QB, RB, WR, TE, FLEX, K, DST if needed.
- Whether rankings are weekly, rest-of-season, draft, or dynasty.
- Injury handling rules.
- Minimum games/sample thresholds.
- What counts as an outlier week.
- How floor/ceiling is calculated.
- How the 70% range hit rate is tested.
- How positional baselines are calculated.
- Whether player value is season-total based, per-game based, or both.
- How ADP source data is ingested and refreshed.
- How frequently rankings update.

## Build Priorities

1. Define the production metric layer from the spreadsheet/roadmap intent.
2. Build data schema and ingestion pipeline before over-investing in UI polish.
3. Create deterministic ranking/projection fixtures so UI can be built against real-shaped data.
4. Implement the visible screens from the PPTX mock as working flows.
5. Add auth/subscription gating for premium boards and tools.
6. Add validation dashboards for model accuracy: floor/ceiling hit rate, rank movement, projection error, value stability.

## API Priority Stack

### V0 Test

Use the lightest available data path to prove the product logic before committing to paid or complex integrations.

Priority:

- Free NFL data.
- GM agent.
- Coach agent.
- Drafting guide.

V0 goal:

- Prove the manual GM draft room.
- Prove GM draft simulator against computer-controlled teams.
- Prove deterministic draft recommendations.
- Prove post-draft roster reconstruction.
- Prove early Coach recommendations against user-maintained roster state.
- Validate that the drafting guide can teach and support the GM workflow.

### V1 Core

Use production-grade data and the most practical fantasy platform APIs.

Priority:

- SportsDataIO as the main NFL data provider.
- Yahoo Fantasy API.
- Sleeper API.
- Platform rankings, including ESPN top 300 players, even if full ESPN league integration is deferred.

V1 goal:

- Replace free/prototype NFL data with reliable production data.
- Support practical league imports where APIs are stable.
- Keep platform-rank awareness separate from full league sync.
- Allow GM to model ESPN draft rooms using ESPN rankings/top 300 even before ESPN account integration exists.

### V2 Expansion

Add harder integrations only after the core system is stable.

Priority:

- ESPN integration, carefully abstracted.

V2 goal:

- Add ESPN league sync without coupling 949Fantasy's data model to ESPN-specific assumptions.
- Treat ESPN as one provider adapter among many, not as the product's source of truth.

## Current Open Questions

- Which NFL data provider will be production source of truth?
- Which seasons are in scope for first launch?
- Which league formats are supported at launch?
- Will users connect live leagues, or will v1 be manual/standalone?
- Is the `$9.49` price a one-time season pass or recurring seasonal subscription?
- What exact Figma layout should override the PPTX where they differ?
- Does 949Fantasy need a betting-free positioning statement, or is it simply fantasy-only by default?
- Which imported platforms are truly practical for v1: Sleeper only, or also ESPN/Yahoo/DraftKings?
- How will we source reliable venue, weather, and historical condition data?
- Do we have enough historical game-log depth to support red/yellow/green condition claims responsibly?
