# 949Fantasy Data Source Matrix


> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-data-source-matrix.md`


## Purpose

This table lists every data source 949Fantasy needs to support the current Claude-created views and the Codex product logic described so far.

Important distinction:

- **External sources** provide raw football, league, platform, news, and weather data.
- **949 internal sources** are the normalized tables, user-maintained state, rankings, projections, tiers, and derived model outputs that the app actually renders.

The application should render from 949 internal APIs, not directly from third-party providers in React components.

## Priority Legend

| Priority | Meaning |
|---|---|
| V0 | Needed to test the product before paid/complex integrations |
| V1 | Needed for the first production-quality core |
| V1.1 | Needed to make weekly Coach useful without full platform sync |
| V2 | Expansion after core product is stable |

## Data Source Table

| Data Source | Priority | Data Needed | Supports Views / Features | Fallback / Notes |
|---|---:|---|---|---|
| Supabase Postgres | V0 | Normalized players, teams, franchises, rosters, lineups, draft rooms, projections, rankings, tiers, scores, provider mappings | All pages | Primary 949 source of truth. Project ref: `vnubuviqqenumpmeitsq`. For Vercel/serverless, use Supabase transaction pooler `DATABASE_URL` on port `6543`. UI should read 949 APIs backed by Supabase. |
| Supabase Auth | V0 | User identity, account, franchise ownership | Account selector, Add new franchise, saved drafts, Coach/GM state | Required for persisted user state. Demo mode can exist without auth. |
| Manual franchise setup | V0 | Platform, league size, scoring type, draft position, draft type, roster slots, bench slots, K/DST flags, Superflex | All personalized pages | Required fallback even when no platform API exists. |
| Manual roster upload | V0 | User players, optional draft order, optional opponent teams | Analytics, Start/Sit, Coach, Metrics, Player Trends, Draft Spend | Lets users who did not draft with GM still use the product. |
| Manual weekly roster refresh | V1.1 | Adds, drops, trades, current roster, current starters, optional opponent lineup | Coach, waiver guidance, Start/Sit, Analytics after draft day | Solves the post-draft state drift problem without league sync. |
| GM manual draft room state | V0 | Draft room, teams, current pick, pick order, drafted players, user picks, team rosters, undo stack | Draft Board, Draft Score, GM sidebar, post-draft roster assessment, waiver baseline | User mirrors draft by clicking players. This creates initial league state. |
| 949 player identity map | V0 | Canonical player IDs plus SportsDataIO, Sleeper, Yahoo, ESPN/platform IDs | Every player-connected view | Critical glue layer. Needed for imports, name matching, and provider merges. |
| RapidAPI NFL API Data | V0 | Teams first, then players/schedules/stats if endpoint coverage is sufficient | V0 testing for provider adapter, teams, schedule-shaped data, app plumbing | Test provider only. Store key server-side as `RAPIDAPI_NFL_API_KEY`; rotate if exposed. |
| Free NFL data source / Sleeper fallback | V0 | Players, teams, schedule, basic stats, basic game logs if available | V0 testing for Analytics, Rankings, Start/Sit, Player Tape | Good enough to test data shape, not final source of truth. |
| 949 seed rankings | V0 | Overall rank, position rank, tier, draft rank, scoring format | Rankings, Draft Rankings, GM, Draft Score, Your Players vs Field fallback | Can be manually imported at first. |
| 949 seed projections | V0 | Weekly projected points, season projected points, floor, median, ceiling | Analytics, Start/Sit, Coach, Metrics, Player Tape | Can start as seeded or formula-derived, then move to SportsDataIO/model. |
| 949 tier system | V0 | Tier by player/position/scoring format/week/draft context | Rankings, Your Players vs Field, Draft Spend, GM scarcity, fallback benchmarks | Needed for tier 1-3 fallback when league data is missing. |
| 949 scoring engine | V0 | Standard, Half PPR, Full PPR scoring formulas, decimal rules | All points, projections, metrics, draft grades | Must be league-aware and not hardcoded. |
| 949 roster slot schema | V0 | Dynamic lineup slots, bench slots, FLEX eligibility, Superflex, K/DST toggles | Start/Sit, Metrics heatmap, Analytics blocks, Coach, Draft setup | Replace hardcoded slots like `QB-RB-RB-WR-WR-TE-FLEX-DST-K`. |
| SportsDataIO NFL API | V1 | Players, teams, schedules, stadiums, stats, fantasy points, projections, injuries, depth charts, news, weather, ADP/rankings if licensed | All production football data surfaces | Planned primary production NFL data provider. Requires paid/commercial validation. |
| SportsDataIO player/stats feeds | V1 | Weekly stats, season stats, historical game logs, fantasy points | Analytics, Metrics, Player Trends, Player Tape, Rankings validation | Needed for actuals and model validation. |
| SportsDataIO projections feeds | V1 | Weekly projections, season projections, DST/K projections, possibly auction/ADP | Start/Sit, Coach, GM, Draft Rankings, Analytics projected/rest-of-year | 949 model can blend or override, but must store source. |
| SportsDataIO injuries/depth charts | V1 | Injury status, practice status, depth chart role, availability | Coach, Start/Sit, Rankings, News, Player Profile, GM risk | Suppress risky recommendations or lower confidence. |
| SportsDataIO news | V1 | Player news, breaking news, source/tags/timestamps | News block, Coach insight, Player Profile | Prioritize rostered-player news, then breaking news. |
| SportsDataIO stadium/schedule/weather | V1 | Stadium profiles, schedule, kickoff, indoor/outdoor, forecast | Stadium Map, Your Players This Week, Player Tape context | If weather insufficient, add separate weather provider. |
| nflverse / nflfastR | V1 | Historical weekly stats, play-by-play, rosters, schedules, advanced context | Projection model research, floor/ceiling validation, player trend backtesting | Research/modeling source, not necessarily live app source. |
| Yahoo Fantasy API | V1 | OAuth, user leagues, league settings, teams, rosters, matchups, lineups, transactions where available | Franchise sync, Analytics opponent data, Metrics, Coach, waiver state | Official API, but OAuth/access process adds lift. |
| Sleeper API | V1 | User leagues, league settings, rosters, drafts, draft picks, matchups, transactions, players | Franchise sync, GM draft import where available, Analytics, Metrics, Coach | Best early practical sync target. |
| ESPN top 300 / ESPN platform rankings | V1 | ESPN visible draft rank/top 300, player order, position, team | Draft Board, GM platform edge, Draft Simulator | Platform ranking input only. Full ESPN league sync deferred. |
| ESPN league integration | V2 | League settings, rosters, matchups, lineups, transactions if reliable path exists | Connected ESPN franchises, Coach, Analytics, waivers | Must be abstracted carefully. Do not block V1. |
| CBS / NFL Fantasy / DraftKings platform rankings | V1/V2 | Platform-visible ranks if obtainable/importable | GM platform edge, Draft Board, Draft Simulator | Rankings can be supported before full league sync. |
| CBS / NFL Fantasy league sync | V2 research | League settings, rosters, matchups, transactions | Connected league features | Research only until stable access is confirmed. |
| FantasyPros / FantasyLife / Footballguys ADP/rankings | V0/V1 | Consensus ADP, source ADP, platform ADP, scoring format ranks | GM, Draft Rankings, Draft Score, platform edge, market discount | Use only if licensing/terms permit. Manual import acceptable for V0. |
| ESPN/Yahoo/Sleeper platform-rank snapshots | V1 | Platform rank by timestamp, scoring, league type | GM sidebar, Draft Board, Draft Simulator, Draft Score | Separate from league sync. This is draft-market data. |
| 949 draft market snapshots | V0 | ADP, platform rank, 949 rank, projection rank, tier, market price | GM, Draft Score, Draft Simulator | Internal normalized table built from rankings/ADP sources. |
| 949 draft theory knowledge base | V0 | Structured lessons: VBD, VONA, scarcity, capital allocation, platform edge | GM explanation layer, Drafting Guide, Coach strategy language | Informs explanations and features, not raw projections. |
| OpenAI API | V0/V1 | Natural-language explanation from structured GM/Coach outputs | Coach chatbot, GM explanation, Drafting Guide Q&A | Must not generate projections/rankings from memory. |
| Weather provider | V1 | Forecast by stadium and kickoff window, temp, wind, precipitation, roof relevance | Stadium Map, Your Players This Week, Coach, Player Tape | Use if SportsDataIO weather is unavailable or insufficient. |
| NFL stadium metadata | V0/V1 | Coordinates, city, team, surface, roof/indoor/outdoor, timezone | Stadium Map, schedule context, player game context | Can seed manually for V0; validate with SportsDataIO later. |
| 949 matchup/environment index | V1 | Derived defensive efficiency, venue, weather, climate-fit, and player-archetype modifiers | Coach, Start/Sit, Player Tape, weighted weekly projections | Build internally from SportsDataIO/nflverse/weather inputs rather than depending on external DVOA. Priors must be backtested and explainable. |
| Environment outlier flags | V1 | Extreme cold, major wind/rain/snow, humidity/heat, West-to-East early kickoff, Europe/international travel | Coach, Start/Sit, Player Tape, weekly confidence | Separate from normal venue factors. Can widen weekly range and lower confidence without distorting season floor/ceiling. |
| Player headshots / team assets | V1 | Headshots, team colors, logos | Player Profile, Active Roster, Bench, Rankings, Draft Board | Nice-to-have for polish. Must have team colors for current layout intent. |
| Waiver wire state | V1/V1.1 | Available players, rostered players, transaction history | Coach waiver advice, Your Players vs Field, roster weakness | Requires league sync or manual weekly refresh. Without it, Coach must use "if available" language. |
| Roster percentage / availability proxy | V1 | Player roster percentage, add/drop trend, broad waiver popularity | Coach watch list, fallback waiver-style insights | Needed when true league waiver state is unavailable. Could come from SportsDataIO/FantasyPros/FantasyLife/Fantasy Footballers-style data if licensed/available. |
| Opponent lineup/matchup state | V1/V1.1 | Opponent roster, starters, projected/actual points | Analytics opponent actual/projected, Metrics opponent scope, Start/Sit opponent context | If missing, hide opponent claims or use tier benchmarks. |
| League average / tier benchmark tables | V0 | Tier 1-3 positional averages, league starter averages, replacement baselines | Your Players vs Field, Draft Spend, Metrics fallback | Required fallback when full league data is missing. |
| 949 projection model outputs | V0/V1 | Weekly projection, season projection, floor, median, ceiling, confidence, boom/bust, risk | Rankings, Start/Sit, Coach, Player Tape, Metrics, Analytics | Core proprietary layer. Can blend external projections and internal logic. |
| 949 GM recommendation outputs | V0 | Draft score, seven value bands, survival probability, VORP, VOLS, VONA, snake value, spend grade, run alerts, queue status | GM sidebar, Draft Score, Draft Board, Simulator | Deterministic engine output. |
| 949 value grade outputs | V0 | Last season grade, projected grade, career grade, value score vs position average | GM, Draft Rankings, Player Profile, Draft Score | Uses `player_points / position_group_average_points`. |
| 949 Coach recommendation outputs | V0/V1 | Conversational comparison, lineup read, lineup lift, floor/ceiling change, confidence, scenario result, watch/drop considerations | Coach, Lineup Optimizer under Coach, Start/Sit Studio | Deterministic first; AI explains. Advisory only; no automated team management. |
| Saved draft simulator results | V0 | Simulator settings, picks, final roster, grade, missed recommendations | Draft Simulator, Drafting Guide, GM training | Internal table, no external API needed. |
| Historical workbook validation data | V0/V1 | Actual points, projected points, floor, ceiling, tiers, value formulas, injury flags if available | Projection model validation, value grades, trust testing | User will provide updated `.xlsx`; process with Python validation scripts. |
| Product analytics | V1 | Recommendation shown/followed, draft choices, Coach actions, feature usage | Model validation, admin/product analytics | PostHog or equivalent. Not required for user-facing V0. |
| Error/observability data | V1 | API failures, provider sync errors, route errors | Reliability, debugging | Sentry or equivalent. |
| Stripe/subscription entitlement | V1 | User entitlement, season pass status | Premium gates across Rankings, Coach, GM, Draft tools | Not required for product logic tests. |

## View Coverage Summary

| View / Feature | Minimum Data Sources | Full Data Sources |
|---|---|---|
| Analytics: Team Points | Manual roster + 949 projections + scoring engine | Yahoo/Sleeper matchup data + SportsDataIO actuals/projections |
| Analytics: Performance vs Expected | 949 projections + scoring engine + current lineup | League sync/manual weekly refresh + SportsDataIO actuals |
| Analytics: Starters vs Bench | User roster + active lineup | League sync/manual weekly refresh |
| Analytics: Your Players vs Field | User roster + tier benchmark tables | Full league rosters + league averages |
| Analytics: Draft Spend | User draft picks + 949 draft rankings | Full league draft + ADP/platform-rank snapshots + actual points |
| News | SportsDataIO news or seeded news | SportsDataIO news prioritized by roster + breaking tags |
| Start/Sit Studio | User roster + weekly projections + dynamic slots | Injuries, opponent context, weather, matchup data |
| Coach | Lineup/bench + projections + scoring + Player Tape trends | Waivers, roster percentage, injuries, opponent, weather, news, transactions |
| Stadium Map | NFL schedule + stadium metadata | Weather + user/opponent players by game |
| Your Players This Week | Active lineup + schedule | Weather, injuries, venue, opponent context |
| Metrics Weekly Heatmap | User weekly points + dynamic roster slots | League/opponent/bench scopes from sync |
| Statistics / Performance | Same as Analytics | Same as Analytics |
| Player Trends | Player weekly actuals + projections | Floor/ceiling model + game context |
| Player Tape | Projection + final actual + floor/ceiling | Opponent, venue, weather, injury context |
| Draft Rankings | 949 rankings + player pool | Platform ranks, ADP, bye week, team-unique SOS rank from opponents' combined record, risk, boom/bust probabilities, neutral/expected probability, YOY trend, value grade, full-season projections |
| Draft Board | Draft settings + player pool + platform rank | Full platform rank snapshots + GM recommendations, pick price, EOS role projection |
| Draft Score | Draft picks + 949 draft scoring | Draft Stock number, ADP/platform rank + full league draft context |
| GM Sidebar | Draft room state + 949 GM engine | Platform rank, ADP, simulation, roster construction, run alerts, queue status |
| Draft Simulator | Player pool + computer drafter rules | Platform ADP/rank + 949 recommendations + saved results |

## Data Connections To Build In Vercel

### Immediate V0

- Supabase project and schema.
- Free NFL data ingestion or seeded NFL player/team data.
- 949 player identity map.
- Seed rankings/projections/tiers.
- Franchise setup and manual roster upload routes.
- Manual GM draft room routes.
- GM deterministic scoring routes.
- Coach context and insight routes using structured outputs.
- Python workbook validation scripts for floor/ceiling, value grades, and projection error.

### V1 Core

- SportsDataIO ingestion jobs.
- Yahoo OAuth/API connector.
- Sleeper API connector.
- Platform ranking ingestion, especially ESPN top 300.
- News ingestion.
- Weather/stadium enrichment if not fully covered by SportsDataIO.
- Product analytics and error monitoring.
- Stripe entitlement gating.

### V1.1

- Manual weekly roster refresh.
- Adds/drops/trades maintenance.
- Waiver state derivation.
- Opponent lineup maintenance when user wants matchup detail.

### V2

- ESPN league sync adapter.
- CBS/NFL Fantasy research adapters if viable.
- Auction draft data and simulator support.
- Learned opponent behavior models.

## Implementation Rules For Cursor

- Use provider adapters for every external source.
- Store external IDs in mapping tables.
- Render from 949 internal APIs, not provider APIs.
- Every view must know whether it is in `connected_league`, `manual_draft_room`, `manual_user_roster`, or `demo_or_empty` mode.
- If league/opponent data is missing, use tier 1-3 benchmarks or hide opponent-specific claims.
- Never hardcode roster slots.
- Keep rankings, projections, ADP, and platform ranks as separate fields.
- Coach and GM should consume deterministic 949 outputs, then optionally ask OpenAI to explain them.
