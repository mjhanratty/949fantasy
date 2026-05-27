# 949Fantasy Coach / GM Cache And Weekly Ops Update


> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-coach-gm-cache-weekly-ops.md`


## Purpose

This document captures product, data, caching, and content-operating updates for Cursor.

It extends the layered Coach / GM approach:

```txt
raw data
-> normalized Supabase tables
-> deterministic computed outputs
-> cached summaries
-> AI explanation / content generation
-> user-facing Coach, GM, Insights, SEO, and social surfaces
```

Cursor should treat this as an implementation note for reducing provider load, limiting token spend, supporting manual fallback workflows, and preparing the UI/data contracts for weekly Value Score refreshes.

## Core Rule

Do not ask AI to find or calculate the answer.

The backend should find and calculate the answer, then AI should explain it.

This applies to:

- Coach lineup answers.
- Coach waiver/watch-list answers.
- GM draft recommendations.
- GM simulator recaps.
- Insights pages.
- SEO article generation.
- Social posts.
- Newsletter-style summaries.

## Cache Strategy For Coach And GM

949Fantasy should use a layered cache system so Coach and GM avoid repeated custom provider queries and avoid sending large data payloads into LLM prompts.

### Layer 1: Raw Source Of Truth

Primary storage:

- Supabase Postgres.

Store normalized raw and semi-raw data:

- players.
- teams.
- schedules.
- games.
- injuries.
- depth charts.
- news.
- weekly stats.
- season stats.
- projections.
- rankings.
- ADP.
- platform rank snapshots.
- franchises.
- rosters.
- lineups.
- league settings.
- waiver state where available.
- draft rooms.
- draft picks.
- simulator results.

### Layer 2: Computed Postgres Tables

Precompute and store commonly reused outputs:

- weekly player scores.
- season Value Scores.
- rolling 3-week Value Scores.
- projected weekly Value Scores.
- floor / median / ceiling bands.
- confidence scores.
- consistency grades.
- start/sit grades.
- waiver scores.
- positional tiers.
- matchup grades.
- ADP value vs projection.
- platform rank edge.
- injury replacement lists.
- team needs.
- roster construction summaries.
- GM draft stock at pick time.
- Coach recommendation bases.

These tables are the main source for app APIs. React components should not calculate these values directly.

### Layer 3: Fast Cache

Use Redis or an equivalent fast cache for repeated, high-traffic lookups:

- top 300 rankings.
- top 25 by position.
- best waiver WRs/RBs/QBs/TEs.
- player card summary.
- player weekly snapshot.
- franchise/team weakness summary.
- current Coach lineup context.
- current GM draft room recommendation payload.
- public rankings pages.
- common Coach response basis objects.

Redis should cache structured payloads, not prose-only answers.

### Layer 4: Agent Context Payloads

Coach and GM should receive compact structured context instead of large raw tables.

Example Coach context:

```json
{
  "question": "Should I start Player A or Player B?",
  "cached_context": {
    "player_a_grade": 82,
    "player_b_grade": 76,
    "matchup_edge": "Player A",
    "floor_edge": "Player A",
    "ceiling_edge": "Player B",
    "risk_note": "Player B has injury volatility",
    "model_pick": "Player A",
    "reason_codes": ["floor_edge", "matchup_upgrade", "higher_confidence"]
  }
}
```

Example GM context:

```json
{
  "draft_room_id": "draft_123",
  "pick_number": 39,
  "user_next_pick": 58,
  "recommendation": {
    "player_id": "player_456",
    "value_grade": "B",
    "draft_stock": "A-",
    "survival_probability_next_pick": 0.18,
    "reason_codes": ["market_discount", "low_survival_probability", "tier_cliff"]
  }
}
```

The LLM should turn these into readable explanations. It should not create projections, rankings, injury claims, or availability claims from memory.

## Value Score Methodology Update

Value Score should be one of 949Fantasy's signature metrics.

Formula:

```txt
value_score = player_fantasy_points / baseline_fantasy_points
```

Possible baselines:

- positional average.
- replacement-level player.
- starter threshold.
- tier midpoint.
- ADP-equivalent expectation.

Interpretation:

- `1.00` means the player matched the selected baseline.
- Above `1.00` means the player outperformed the selected baseline.
- Below `1.00` means the player underperformed the selected baseline.

Example:

```txt
405 player points / 315 QB baseline = 1.29
285 player points / 315 QB baseline = 0.90
```

Recommended initial grade mapping:

| Grade | Value Score |
|---|---:|
| A+ | `>= 1.25` |
| A | `1.15 - 1.24` |
| B | `1.00 - 1.14` |
| C | `0.85 - 0.99` |
| D | `0.70 - 0.84` |
| F | `< 0.70` |

Earlier docs used a stricter A+ threshold around `> 1.00` for a specific workbook-derived value grade. Cursor should expect this metric to be normalized before implementation. The product direction is now to make `1.00` baseline-equivalent and reserve A/A+ for meaningful overperformance.

## Value Grade Vs Draft Stock

GM must keep these concepts separate.

### Value Grade

Stable player quality/projection grade.

It is based on 949's projection, historical value, current role, floor/ceiling, confidence, and baseline-relative scoring.

Value Grade should not change during a draft unless the underlying player projection/model changes.

### Draft Stock

Live draft-context score/grade.

It should change as the draft progresses because player acquisition cost changes.

Example:

- Isiah Pacheco in Round 2:
  - Value Grade: `B`
  - Draft Stock: `C`
  - Reason: good player, but expensive relative to projected value and expected market window.
- Isiah Pacheco in Round 4:
  - Value Grade: `B`
  - Draft Stock: `A-`
  - Reason: same player quality, but now a stronger discount relative to cost.

Draft Stock should be driven by:

- current pick number.
- ADP.
- platform rank.
- expected draft window.
- pick price.
- roster context.
- SOS.
- risk.

In user-facing pick tooltips, use `Draft Stock` for the numeric pick score and reserve `Value` for the 949 A+ to F player value grade.
- survival probability to next user pick.
- positional scarcity.
- tier cliffs.
- roster construction.
- opportunity cost.
- alternatives available at the current pick.

## GM Simulator UI / Data Implications

Simulator drafts are the preferred early test path for GM.

Cursor should model live GM and simulator GM as the same draft room state machine with different pick sources:

- Live mode: user manually records each real draft pick.
- Simulator mode: NPC teams auto-pick; user picks manually when on the clock.

Required UI/state behavior:

- Center board/player pool color-coded by position.
- Drafted player cards grey out or move into a selected state.
- Available players remain selectable when the user is on the clock.
- Left sidebar GM recommendations update after every pick.
- Right sidebar queue updates after every pick.
- Queue entries show Value Grade, Draft Stock, survival probability, and status color.
- Position run alerts update after every pick.
- Ticker tape shows recent picks, grade, value band, and reason codes.

NPC picks do not need advanced intelligence for V0. They should be plausible enough to pressure-test:

- GM recommendations.
- player survival probability.
- tier cliffs.
- draft stock movement.
- queue status changes.
- post-draft grading.

Basic NPC pick logic:

```txt
npc_pick_score =
  platform_rank_weight
  + adp_weight
  + roster_need_weight
  + scarcity_weight
  + small_randomness
```

## Post-Draft Recap Requirements

GM simulator should produce a post-draft report.

### All-Team Grades

For every team:

- overall draft grade.
- projected starter strength.
- bench depth.
- positional balance.
- value captured vs market.
- reach / steal total.
- risk profile.
- roster construction grade.

### User Draft Review

For the user's team:

- best pick.
- worst pick.
- biggest steal.
- biggest reach.
- best value by round.
- missed opportunity picks.
- strongest position group.
- weakest position group.
- roster construction notes.
- projected starting lineup.
- bench upside.
- risk warnings.
- final recommendation summary.

Definitions:

- Best pick: highest blend of player quality, roster contribution, and fit.
- Biggest steal: strongest discount relative to market/draft slot.
- Worst pick: weakest blend of value, fit, and opportunity cost.
- Biggest reach: selected furthest ahead of expected draft window.

Each draft pick should store enough data to make this recap easy:

- player ID.
- pick number.
- round.
- team slot.
- user/NPC source.
- Value Grade at pick time.
- Draft Stock at pick time.
- ADP.
- platform rank.
- expected draft window.
- roster fit score.
- alternatives available.
- reason codes.

## Manual ESPN Waiver Paste Fallback

Until ESPN/Yahoo/Sleeper APIs are reliable enough for full waiver state, Coach should support a manual waiver activity/import workflow.

Recommended V1.1 fallback:

- User copies waiver activity or waiver wire updates from ESPN or another platform.
- User pastes text into a Coach/manual maintenance UI.
- Backend parses player names, teams, actions, and timestamps where possible.
- App asks the user to resolve ambiguous names.
- Parsed actions update a user-maintained league/waiver state in Supabase.

This should not automate transactions on the fantasy platform. It only updates 949's internal understanding so Coach can make more accurate waiver/watch/drop suggestions.

Coach language rules still apply:

- If true league waiver state exists, Coach may say a player is available.
- If parsed/manual state is incomplete, Coach should qualify claims.
- If no league state exists, Coach must use "if available," "watch list," or roster-percentage language.

## Weekly Intelligence Refresh Cycle

949Fantasy should operate on a weekly refresh rhythm during the NFL season.

This creates fresh data for:

- Rankings.
- Coach.
- GM.
- Waivers.
- Player profiles.
- Insights pages.
- SEO pages.
- Social posts.
- Newsletter/push summaries.

### Monday Night / Tuesday Morning: Truth Reset

After the NFL week is mostly complete, ingest:

- final fantasy points.
- player weekly stats.
- snap counts.
- targets.
- routes.
- carries.
- red-zone usage.
- injuries.
- depth chart changes.
- team pace.
- game context.

Then recompute:

- weekly Value Scores.
- current-season Value Scores.
- rolling 3-week Value Scores.
- historical Value Scores.
- last-year Value Scores.
- projected next-week Value Scores.
- consistency grades.
- ceiling/floor bands.
- confidence scores.
- usage trend grades.
- top 300 rankings.

This is the weekly "truth reset."

### Tuesday Morning: Waiver Intelligence

Generate:

- waiver rankings.
- hidden value risers.
- trend changes.
- volatility warnings.
- usage spikes.
- role changes.
- injury replacement candidates.

Coach and Insights should prioritize this output early in the week.

### Wednesday Through Friday: Projection Refinement

Adjust:

- injury reports.
- practice participation.
- matchup modifiers.
- weather.
- offensive line / team context.
- expected game script.

Outputs should update:

- weekly projections.
- floor/ceiling.
- matchup grades.
- Coach start/sit basis.

### Weekend: Decision Window

Prioritize:

- start/sit.
- matchup analysis.
- injury risk.
- weather risk.
- boom/floor scenarios.
- Coach direct questions.

## Weekly Compute Scope

V1 weekly refresh should be low cost.

Recommended scope:

- Limit recalculation outputs to the top 300 fantasy-relevant players.
- Use existing historical baselines already stored in Supabase.
- Add only the new week's stats and updated injury/usage data.
- Recompute derived outputs incrementally.
- Cache public rankings and common Coach contexts.

Recommended pipeline:

```txt
SportsDataIO / source ingest
-> normalize stats
-> update player_week_stats
-> recompute top 300 Value Scores
-> recompute rolling averages and grades
-> store final scores in Supabase
-> cache rankings and common payloads in Redis
-> generate compact deltas
-> send compact deltas to Claude/OpenAI for summaries
-> publish Insights / SEO / social / newsletter outputs
```

AI should receive compact deltas only.

Example:

```json
{
  "week": 4,
  "risers": ["Player A", "Player B"],
  "fallers": ["Player C"],
  "new_a_grades": ["Player D"],
  "injury_flags": ["Player E"],
  "usage_spike_players": ["Player F"]
}
```

## Claude / Content Role

Claude should not calculate Value Scores.

Backend computes the numbers. Claude can:

- interpret trends.
- explain movement.
- create narratives.
- generate Insights tab content.
- write SEO pages.
- produce social posts.
- draft newsletter copy.
- summarize weekly changes.

Example content surfaces:

- Highest Value WRs of 2026.
- Most Reliable RBs By Value Score.
- Biggest Overperformers vs ADP.
- Hidden A-Grade Players.
- Why This WR Is Quietly Elite.
- Weekly Value Score Risers.
- Waiver Value Watch.
- Start/Sit Confidence Report.

## SEO / Public Content Implications

Do not hide the methodology entirely.

949 should explain:

- what Value Score means.
- why baseline-relative value matters.
- how Value Score differs from raw projections.
- how floor/ceiling and consistency affect decisions.
- why Draft Stock can move while Value Grade stays stable.

This supports:

- user trust.
- shareability.
- debate.
- premium conversion.
- recurring search freshness.

Public vs paid split:

### Public

- projected points rankings.
- basic player profiles.
- select weekly risers/fallers.
- broad waiver watch list.
- methodology explanations.

### Paid

- full Value Score board.
- grade movement history.
- Coach reasoning.
- GM draft strategy.
- trend-adjusted recommendations.
- premium waiver and lineup context.

## Cursor Implementation Notes

When implementation resumes, Cursor should account for:

- cache-friendly API response contracts.
- Supabase tables for computed outputs, not just raw source data.
- Redis-ready keys for repeated rankings and Coach/GM contexts.
- a manual waiver paste/import workflow as a fallback feature.
- Value Grade and Draft Stock as separate fields.
- weekly refresh jobs that can be run by cron/workers.
- compact AI prompt payloads generated from stored outputs.
- post-draft simulator recap data capture from the first simulator implementation.

This framework should be conceived now even if new UI features are not implemented until next week.
