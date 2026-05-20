# 949Fantasy Draft Market Engine

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-draft-market-engine.md` · [draft-theory-source-notes.md](./draft-theory-source-notes.md) · [page-content-spec.md](./page-content-spec.md)

## Purpose

This document defines the 949Fantasy dynamic draft market engine for GM and the shared decision logic that Coach can reuse in-season.

Use this with `949fantasy-draft-theory-source-notes.md`, which converts the draft articles and research links into structured product lessons.

The engine should treat a fantasy draft as a market:

- ADP is market price.
- Draft picks are capital.
- Roster construction is portfolio management.
- Positional scarcity is opportunity cost.
- Player availability is probabilistic.
- League behavior is predictive signal.
- Projections and ADP are separate signals with position-specific reliability.

The product should not depend on an LLM to invent football recommendations. The deterministic 949 engine should score the board, simulate future availability, and return structured recommendations. AI can explain those recommendations in 949's voice after the engine has made the decision.

## Product Surfaces

### GM

GM is the draft-day assistant.

Inputs:

- Draft position, such as `10 of 12`.
- Draft type: snake first, auction later.
- League size.
- Scoring type: standard, half PPR, full PPR.
- Platform: ESPN, Yahoo, Sleeper, CBS, NFL Fantasy, DraftKings, or manual.
- Current draft state.
- User roster state.
- Manual draft-board clicks for V1.
- Risk preference.

Outputs:

- Draft-position value bands: High Steal, Low Steal, Most Likely, Low Reach, High Reach.
- Best pick now.
- Best value pick.
- Safest pick.
- Highest upside pick.
- Position scarcity warning.
- Tier cliff warning.
- Probability target players survive to the user's next pick.
- Spend efficiency grade.
- Roster construction diagnosis.

V1 should use a manual draft board as the primary draft-state input. The user clicks each selected player as their real draft happens, and GM assigns that player to the correct team by pick order. This bypasses fragile API dependencies while still giving the engine live draft context.

The user should only need to keep pace with the player selections. They should not need to choose the drafting team on every click. Team assignment is deterministic once GM knows league size, draft type, and the user's draft slot.

Platform rank data should be supported separately from full platform integration. For example, ESPN top 300 rankings can power ESPN-specific GM market assumptions even if ESPN league sync is not available in V1.

### Coach

Coach is the in-season assistant.

Inputs:

- User roster.
- League settings.
- Starting lineup slots.
- Bench.
- Waiver-wire pool.
- Weekly projections.
- Injuries.
- Matchups.
- Player trends.

Outputs:

- Start/sit suggestions.
- Bench-to-starter swaps.
- Waiver claims.
- Drop candidates.
- Position weakness detection.
- "No move needed" recommendation when the lineup is already set well.

Coach should use the same market language where useful: every waiver claim has opportunity cost, every bench move changes lineup portfolio risk, and every player trend should be evaluated against acquisition cost.

## Core Theories To Encode

The article library should be converted into structured lessons instead of being used as loose text.

### ADP As Market Pricing

ADP is a consensus price, not a projection.

ADP reflects:

- Platform ranking defaults.
- Draft room psychology.
- Recency bias.
- Injury discounts.
- Rookie hype.
- Positional fear.
- News momentum.
- Expert consensus drift.

Engine implication:

```txt
market_discount =
  nine49_projected_value
  - adp_implied_market_price
```

A player can be a good fantasy player and still be a bad market buy if the acquisition cost is too high.

GM must store ADP by source, platform, scoring format, league size, and snapshot time. Platform-specific ADP/rank should be preferred over generic consensus when the user says they are drafting on ESPN, Yahoo, Sleeper, CBS, DraftKings, or another platform.

### Value-Based Drafting

Rank players by value above the relevant baseline, not raw projected points.

Primary versions:

- VORP: value over replacement player.
- VOLS: value over last starter.
- VONA: value over next available.

Engine implication:

```txt
value_over_baseline = player_projected_points - baseline_points_for_position
```

The baseline should change by league format, roster slots, and scoring type.

### Value Over Next Available

VONA is the strongest fit for snake drafts because it asks what disappears before the user's next pick.

Engine implication:

```txt
vona_score =
  current_player_value
  - expected_best_available_same_position_at_next_pick
```

If the next available RB tier is likely to collapse before the user's next turn, the current RB's VONA rises even if a WR has a slightly better raw projection.

For GM, VONA should be implemented with a smoothed expected-next-available value rather than a single exact ADP cutoff.

```txt
smoothed_next_available_value =
  weighted_average(projected_value of candidates near next_user_pick_window)

snake_value =
  value_over_baseline
  + opportunity_cost_weight * vona_score
```

The smoothing window should widen later in drafts because pick-level uncertainty grows.

### Draft Spend And Capital Allocation

Each pick has capital value.

Examples:

| Pick Type | Portfolio Meaning |
|---|---|
| Round 1 pick | Core capital investment |
| Round 3-5 pick | Foundation allocation |
| Round 6-9 pick | Mid-market buy |
| Late-round pick | Asymmetric upside bet |
| Positional reach | Overpay |
| Falling ADP value | Discounted asset |

Engine implication:

```txt
spend_efficiency =
  expected_player_value / pick_capital_cost
```

The engine should penalize unnecessary reaches and reward valuable players who are falling below market cost.

Even in snake drafts, GM should convert pick number into a pick-capital curve and grade every recommendation as capital allocation.

### Positional Scarcity

Scarcity is opportunity cost.

The engine should measure:

- Tier depth remaining.
- Starter-slot demand.
- Replacement baseline.
- Expected picks before user picks again.
- League-wide roster need by position.

Engine implication:

```txt
scarcity_pressure =
  position_demand_before_next_pick
  * tier_dropoff_slope
  / max(remaining_startable_players_at_position, 1)
```

Scarcity should be measured as production/value drop-off, not just a count of remaining players.

### Market Inefficiency And Behavioral Drafting

The engine should look for places where the room is mispricing players.

Examples:

- Platform default rank creates a player discount.
- Injury fear pushes a player too low.
- Rookie hype pushes a player too high.
- A positional run creates panic buying.
- Managers overreact to the previous pick sequence.
- ESPN/Yahoo/Sleeper room ranks differ from 949 ranks.

Engine implication:

```txt
platform_edge =
  platform_rank - nine49_rank
```

Positive platform edge means the platform is showing the player lower than 949's internal value, increasing the chance of a discount.

### Position-Specific Source Reliability

Projection accuracy and ADP accuracy can differ by position. GM should not hard-code one source as superior for all players.

Initial principle:

- QB: projections are a strong baseline, with rushing involvement as a major upside adjustment.
- RB: ADP may capture late-breaking workload/depth-chart sentiment better than static projections, but projections remain the baseline.
- WR and TE: require 949 backtesting before assigning strong source weights.

Engine implication:

```txt
source_reliability_adjusted_value =
  projection_weight_by_position * projection_value
  + adp_weight_by_position * adp_market_signal
  + nine49_model_weight * nine49_value
```

### Position-Specific Upside Signals

Upside should not be one generic number for every position.

Examples:

```txt
qb_upside_score =
  rushing_attempt_projection
  + rushing_yard_projection
  + rushing_td_projection
  + aggressive_volume_signal

rb_upside_score =
  rushing_efficiency_signal
  + goal_line_role_signal
  + veteran_discount_signal
  - fragile_receiving_dependency_penalty
```

Later versions should add WR and TE-specific upside modules after source validation.

## Article Knowledge Base

Store draft theory as structured concepts, not raw article dumps.

Recommended table: `draft_theory_lessons`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `source_title` | text | Human-readable article/source title |
| `source_url` | text | Optional citation URL |
| `source_type` | text | article, internal_note, research_paper, model_note |
| `concept` | text | ADP market, VBD, VONA, scarcity, auction spend, behavioral bias |
| `lesson` | text | Short normalized teaching |
| `applies_to` | text[] | draft_day, snake_draft, auction, waiver, lineup |
| `signals` | text[] | tier_cliff, positional_run, platform_edge, injury_discount |
| `action_rule` | text | How the engine should respond |
| `weight_hint` | numeric | Optional modeling hint, not final truth |
| `source_confidence` | text | high, medium, low, partial_access |
| `created_at` | timestamptz | Audit field |
| `updated_at` | timestamptz | Audit field |

Example:

```json
{
  "concept": "Value Over Next Available",
  "lesson": "The best pick is not always the highest projected player. It is the player whose value is most likely to disappear before the user's next pick.",
  "applies_to": ["draft_day", "snake_draft", "tier_cliff"],
  "signals": ["positional_run", "low_survival_probability", "tier_drop"],
  "action_rule": "Raise recommendation priority when current value minus expected next-pick value is high.",
  "weight_hint": 0.18
}
```

The knowledge base should inform scoring features and explanations. It should not override validated model results by itself.

## Data Model Additions

Add these entities on top of the existing stack brief.

### `draft_market_snapshots`

Captures ADP/ranking market state by platform and scoring format.

Fields:

- `id`
- `season`
- `source`
- `platform`
- `scoring_format`
- `league_size`
- `snapshot_time`
- `player_id`
- `adp`
- `adp_rank`
- `platform_rank`
- `nine49_rank`
- `nine49_projected_value`
- `projection_rank`
- `position_rank`
- `tier`
- `market_price`
- `source_confidence`
- `created_at`

### `draft_rooms`

Represents a user's draft context.

Fields:

- `id`
- `user_id`
- `league_id`
- `platform`
- `draft_type`
- `league_size`
- `user_draft_slot`
- `scoring_format`
- `roster_slots_json`
- `risk_profile`
- `strategy_profile`
- `status`
- `created_at`
- `updated_at`

### `draft_room_picks`

Tracks actual draft room selections.

Fields:

- `id`
- `draft_room_id`
- `pick_number`
- `round`
- `round_pick`
- `team_slot`
- `player_id`
- `position`
- `picked_by_user`
- `picked_at`
- `entered_manually`
- `undo_sequence`

### `draft_room_teams`

Stores team columns for the manual draft board.

Fields:

- `id`
- `draft_room_id`
- `team_slot`
- `team_name`
- `is_user_team`
- `created_at`
- `updated_at`

### `draft_simulation_runs`

Stores availability simulation output for auditability and tuning.

Fields:

- `id`
- `draft_room_id`
- `current_pick_number`
- `next_user_pick_number`
- `simulation_count`
- `model_version`
- `input_hash`
- `created_at`

### `draft_player_recommendations`

Stores structured GM outputs.

Fields:

- `id`
- `draft_room_id`
- `simulation_run_id`
- `pick_number`
- `player_id`
- `recommendation_type`
- `draft_score`
- `spend_grade`
- `confidence_score`
- `survival_probability_next_pick`
- `value_score`
- `market_discount`
- `vona_score`
- `snake_value`
- `smoothed_next_available_value`
- `tier_dropoff_slope`
- `source_reliability_score`
- `platform_visibility_score`
- `scarcity_score`
- `roster_fit_score`
- `capital_allocation_score`
- `position_specific_upside_score`
- `risk_score`
- `upside_score`
- `explanation_json`
- `created_at`

### `draft_value_bands`

Stores the left-rail output for the current draft position.

Fields:

- `id`
- `draft_room_id`
- `pick_number`
- `band`
- `player_id`
- `draft_score`
- `pick_value_delta`
- `survival_probability_next_pick`
- `reason_codes`
- `created_at`

## Draft Pick Sequence

For snake drafts:

```txt
round = ceil(pick_number / league_size)

if round is odd:
  team_slot = ((pick_number - 1) % league_size) + 1
else:
  team_slot = league_size - ((pick_number - 1) % league_size)
```

The user's next picks are all future picks where `team_slot = user_draft_slot`.

In the V1 manual draft board, every click should:

1. Read the current `pick_number`.
2. Convert it to `round`, `round_pick`, and `team_slot`.
3. Insert a `draft_room_picks` record.
4. Mark the player unavailable.
5. Advance to the next pick.
6. Recompute GM recommendations and value bands.

Undo should remove or reverse only the latest manual pick unless a fuller pick-editing UI is built.

For a 10-team snake draft, the team sequence is:

```txt
1,2,3,4,5,6,7,8,9,10,10,9,8,7,6,5,4,3,2,1
```

This same sequence generalizes to any league size.

## Engine Pipeline

### Step 1: Normalize Market Inputs

Normalize every source into the same units:

- Player ID.
- Position.
- Team.
- Projection.
- Floor.
- Ceiling.
- ADP.
- Consensus ADP.
- Platform rank.
- 949 rank.
- Tier.
- Injury status.
- Risk label.
- Source confidence.
- Snapshot timestamp.

### Step 2: Build Baselines

Calculate by league settings:

- Replacement player baseline.
- Last starter baseline.
- Flex-adjusted baseline.
- Position tier boundaries.
- Position demand by remaining roster slots.
- Pick-capital curve.
- Platform-specific source reliability weights.

### Step 3: Score Current Board

For each available player:

```txt
draft_score =
  source_reliability_adjusted_value
  + market_discount_score
  + snake_value
  + scarcity_score
  + tier_cliff_score
  + roster_fit_score
  + position_specific_upside_score
  + platform_edge_score
  + capital_allocation_score
  - injury_risk_penalty
  - overpay_penalty
  - roster_fragility_penalty
```

Each component should be stored separately so the UI can explain the recommendation.

### Step 4: Simulate Future Availability

Run Monte Carlo draft simulations from the current pick to the user's next pick.

Inputs:

- ADP distribution.
- Platform rank.
- Draft room picks already made.
- Position demand.
- League size.
- Roster slots.
- Observed room behavior.
- Positional runs.
- Source reliability by position.
- Platform-visible rank.

Output:

```txt
survival_probability(player, next_user_pick)
```

Initial distribution can use ADP as the center with position-specific variance. Later versions can learn platform and league behavior.

Use the simulation output to calculate both player-level survival probability and position-level expected next-available value.

### Step 5: Detect Market Events

Detect:

- Positional runs.
- Tier cliffs.
- Platform value pockets.
- Reach zones.
- Fragile roster construction.
- Overexposure to one position.
- Missing foundation positions.
- Late-round upside windows.
- Position-specific breakout profiles.
- Profitable plan deviations.

### Step 6: Return Structured Recommendation

Before returning the top recommendation, the engine should classify available players into pick-value bands for the left rail.

```txt
pick_value_delta =
  player_expected_pick_value
  - current_pick_capital_value
```

Initial band rules:

```txt
High Steal: pick_value_delta >= high_steal_threshold
Low Steal: pick_value_delta >= low_steal_threshold
Most Likely: abs(pick_value_delta) < fair_value_threshold
Low Reach: pick_value_delta <= low_reach_threshold
High Reach: pick_value_delta <= high_reach_threshold
```

Thresholds should be normalized by round because a 10-pick gap means something different in Round 1 than Round 12.

GM response object:

```json
{
  "pick_number": 34,
  "current_team_slot": 10,
  "value_bands": {
    "high_steal": ["player_123"],
    "low_steal": ["player_456"],
    "most_likely": ["player_789"],
    "low_reach": ["player_321"],
    "high_reach": ["player_654"]
  },
  "recommendation": {
    "player_id": "player_123",
    "player_name": "Example Player",
    "position": "RB",
    "action": "draft",
    "confidence": 0.82,
    "draft_score": 87.4,
    "spend_grade": "A-"
  },
  "alternatives": [
    {
      "player_id": "player_456",
      "player_name": "Alternative WR",
      "reason": "Better raw projection but lower scarcity pressure."
    }
  ],
  "market": {
    "adp": 39.2,
    "platform_rank": 42,
    "nine49_rank": 29,
    "market_discount": 10.2,
    "platform_edge": 13
  },
  "availability": {
    "next_user_pick": 39,
    "survival_probability_next_pick": 0.18,
    "smoothed_next_available_value": 61.4
  },
  "value": {
    "vorp": 42.1,
    "vols": 28.6,
    "vona": 14.2,
    "snake_value": 75.3
  },
  "risk": {
    "summary": "RB tier drop before the next pick.",
    "injury_risk": "medium",
    "roster_concentration": "low"
  },
  "reason_codes": [
    "tier_cliff",
    "low_survival_probability",
    "platform_discount",
    "roster_fit"
  ]
}
```

Coach response object:

```json
{
  "recommendation_type": "lineup",
  "action": "swap",
  "start_player_id": "player_111",
  "bench_player_id": "player_222",
  "lineup_lift": 2.8,
  "floor_change": -0.4,
  "ceiling_change": 6.1,
  "confidence": 0.74,
  "reason_codes": [
    "better_boom_scenario",
    "matchup_upgrade",
    "acceptable_floor_loss"
  ]
}
```

## First Implementation Mission For Cursor

Build a deterministic TypeScript module before any AI layer.

Suggested files:

- `lib/draft-market/types.ts`
- `lib/draft-market/pick-order.ts`
- `lib/draft-market/manual-board.ts`
- `lib/draft-market/baselines.ts`
- `lib/draft-market/scoring.ts`
- `lib/draft-market/simulation.ts`
- `lib/draft-market/source-reliability.ts`
- `lib/draft-market/snake-value.ts`
- `lib/draft-market/upside.ts`
- `lib/draft-market/capital.ts`
- `lib/draft-market/value-bands.ts`
- `lib/draft-market/recommend.ts`
- `app/api/gm/draft-room/route.ts`
- `app/api/gm/draft-room/pick/route.ts`
- `app/api/gm/recommendations/route.ts`

Minimum viable behavior:

1. Accept draft settings and current picks.
2. Render a manual draft board by team columns and round rows.
3. Let the user click a player to mark the current pick drafted.
4. Assign the clicked player to the correct team by snake pick order.
5. Support undo for the latest pick.
6. Compute the user's next pick.
7. Score all available players.
8. Calculate VORP, VOLS, VONA, and smoothed snake value.
9. Estimate survival probability using ADP-centered simulation.
10. Apply platform edge and source reliability weighting.
11. Classify players into High Steal, Low Steal, Most Likely, Low Reach, and High Reach bands.
12. Return top 5 recommendations as JSON.
13. Include reason codes and component scores.

Do not add AI explanation until this JSON is stable.

## Validation

Track whether the engine was right.

Draft validation:

- Did recommended players outperform ADP?
- Did predicted tier cliffs happen?
- Did survival probabilities calibrate correctly?
- Did smoothed next-available estimates match actual draft rooms?
- Did projection-vs-ADP reliability weights improve by position?
- Did users follow the recommendation?
- Did followed recommendations improve roster projection?

Coach validation:

- Did suggested starters outscore benched alternatives?
- Did waiver recommendations produce lineup value?
- Did "no move needed" weeks avoid unnecessary churn?
- Did boom recommendations actually improve ceiling outcomes?

## AI Boundary

OpenAI should be used for:

- Explaining GM recommendations.
- Summarizing draft theory lessons retrieved from the knowledge base.
- Turning score components into plain-language advice.
- Answering scenario questions using structured tool outputs.

OpenAI should not be used for:

- Raw projection generation.
- Unverified injury judgment.
- Ranking players from memory.
- Replacing deterministic draft scoring.
- Claiming a player will or will not be available without simulation output.

The agent should call tools like:

- `getDraftRoomState`
- `getAvailablePlayers`
- `getDraftRecommendation`
- `simulatePlayerAvailability`
- `getRosterConstruction`
- `getWaiverRecommendations`
- `getLineupOptimization`

Then it should explain the returned data.

## Roadmap

### V1

- Snake draft only.
- Standard, half PPR, and full PPR.
- Manual draft board as the primary draft state workflow.
- Click-to-draft player assignment by snake pick order.
- Position filters: All, QB, RB, WR, TE, FLEX, DST, K.
- Left-rail value bands: High Steal, Low Steal, Most Likely, Low Reach, High Reach.
- Sleeper draft import only where easily available.
- Platform-aware ADP/rank source fields.
- Top 5 recommendations.
- Survival probability to next user pick.
- VORP, VOLS, VONA, and smoothed snake value.
- Tier drop-off slope.
- Pick-capital spend grade.
- Spend grade and reason codes.

### V2

- Live draft sync where provider APIs allow it.
- League behavior model.
- User risk profile.
- Roster construction portfolio score.
- Draft room mode UI.
- Coach waiver assistant using shared market logic.
- Position-specific source reliability learned from backtesting.
- Position-specific upside modules.

### V3

- Auction draft support.
- Auction nomination recommendations.
- Learned opponent tendencies.
- Historical calibration by platform.
- Personalized GM and Coach agent.
- Full article-retrieval explanation layer.
