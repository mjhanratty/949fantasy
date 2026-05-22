# 949Fantasy Evaluator Layering Spec

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-evaluator-layering-spec.md`


## Purpose

This document defines the layered evaluator architecture for `GM` and `Coach`.

The goal is to avoid a fragile `one prompt in -> one answer out` system.

Instead, 949 should use:

1. a canonical football data layer
2. deterministic evaluator modules
3. product-specific consensus logic
4. AI explanation and personality on top

This document should be used with:

- `949fantasy-draft-market-engine.md`
- `949fantasy-draft-theory-source-notes.md`
- `949fantasy-workbook-analysis-notes.md`
- `949fantasy-data-source-matrix.md`

## Core Product Framing

- `Coach = Weekly Decision Engine`
- `GM = Draft Market Engine`
- `Shared Core = 949 Intelligence Layer`

Coach and GM should feel distinct to the user, but both should sit on the same shared evaluator foundation.

## Architectural Principle

Do not think:

```txt
user -> OpenAI -> answer
```

Think:

```txt
user
-> data layer
-> specialist evaluators
-> consensus engine
-> risk/confidence layer
-> personality/explanation layer
-> final recommendation
```

This is what makes the system debuggable, tunable, and defensible.

## Layer 1: Data Layer

This is the source of truth. AI should not invent core football facts.

Primary source:

- `SportsDataIO` for football facts and fantasy data backbone

Secondary sources:

- `Sleeper` for platform behavior and eventual sync
- `Yahoo` for platform behavior and eventual sync
- `ESPN` ranking/board context if available
- public ADP/market sources where needed
- 949 internal workbook/history/backtests

Canonical data domains:

- teams
- players
- rosters
- schedules
- games
- venues
- weather
- injuries
- depth charts
- weekly player stats
- weekly team stats
- weekly fantasy points
- weekly fantasy projections
- season projections
- news
- ADP / rankings / market references
- roster percentage / add-drop trends where available

## Layer 2: Shared Core Evaluators

These modules should power both GM and Coach.

### `player_identity`

Purpose:

- Canonical player/team/position record

Inputs:

- player id
- team id
- position
- status

Outputs:

- normalized player object

Type:

- deterministic

### `scoring_rules`

Purpose:

- Convert raw stats into fantasy points

Inputs:

- league scoring rules

Outputs:

- fantasy scoring function

Type:

- deterministic

### `projection_core`

Purpose:

- Base expected fantasy output

Inputs:

- historical usage
- historical efficiency
- current role
- opponent
- game context
- health modifiers

Outputs:

- median projection

Type:

- deterministic

### `range_model`

Purpose:

- Produce floor and ceiling band around the median projection

Inputs:

- median projection
- volatility archetype
- role stability
- health risk
- game context

Outputs:

- floor
- ceiling
- band width

Type:

- deterministic

### `confidence_model`

Purpose:

- Estimate how much trust to place in the projection/range

Inputs:

- source agreement
- injury uncertainty
- role certainty
- week-to-week variance
- archetype stability

Outputs:

- confidence score
- confidence label

Type:

- deterministic

### `value_model`

Purpose:

- Translate projection into positional value

Inputs:

- projected points
- position average
- replacement or baseline level

Outputs:

- value ratio
- grade

Grade scale:

| Value | Grade |
| --- | --- |
| `1.25+` | `A+` |
| `1.10-1.24` | `A` |
| `0.95-1.09` | `B` |
| `0.80-0.94` | `C` |
| `0.65-0.79` | `D` |
| `< 0.65` | `F` |

Type:

- deterministic

### `trend_model`

Purpose:

- Direction of player usage and performance

Inputs:

- recent weeks
- snaps
- carries
- targets
- routes
- fantasy output

Outputs:

- trend score
- up / flat / down

Type:

- deterministic

### `injury_risk`

Purpose:

- Convert injury news into football risk

Inputs:

- practice status
- game status
- injury type
- historical missed time if available

Outputs:

- risk tag
- projection adjustment

Type:

- deterministic

### `game_context`

Purpose:

- Normalize environment and matchup context

Inputs:

- home / away
- weather
- indoor / outdoor
- spread
- total
- defense quality

Outputs:

- context modifiers

Type:

- deterministic

### `market_consensus`

Purpose:

- Compare 949 views against external projections/ranks

Inputs:

- SportsDataIO projections
- Sleeper projections/ranks
- Yahoo projections/ranks
- other approved benchmark sources

Outputs:

- consensus projection
- consensus rank
- source spread

Type:

- deterministic

### `news_summary`

Purpose:

- Turn football news into concise structured notes

Inputs:

- news feed
- injury blurbs
- beat notes if available

Outputs:

- structured note
- tags

Type:

- deterministic extraction plus AI summary

## Layer 3: Coach Evaluators

Coach is the weekly decision engine.

### `start_sit_score`

Purpose:

- Compare lineup candidates for the current week

Inputs:

- projections
- floor
- ceiling
- confidence
- matchup

Outputs:

- decision score

Type:

- deterministic

### `ceiling_score`

Purpose:

- Find high-upside weekly options

Inputs:

- ceiling
- volatility
- game script

Outputs:

- boom ranking

Type:

- deterministic

### `floor_score`

Purpose:

- Find stable weekly options

Inputs:

- floor
- touch stability
- confidence

Outputs:

- safety ranking

Type:

- deterministic

### `lineup_context`

Purpose:

- Adjust advice depending on whether the user should chase upside or hold floor

Inputs:

- team projection
- opponent projection
- matchup context

Outputs:

- strategy preference

Type:

- deterministic

### `bench_upgrade_check`

Purpose:

- Find lineup swaps that improve the active roster

Inputs:

- current starters
- bench options

Outputs:

- suggested swaps
- floor delta
- ceiling delta

Type:

- deterministic

### `waiver_opportunity`

Purpose:

- Find free-agent or low-rostered players worth adding or watching

Inputs:

- free agent pool
- roster percentage
- trend score
- injuries
- depth chart changes

Outputs:

- add
- watch
- drop candidate ideas

Type:

- deterministic

### `position_need`

Purpose:

- Identify weak positions on the user roster

Inputs:

- roster strength by slot
- bench depth
- injuries

Outputs:

- ranked position needs

Type:

- deterministic

### `schedule_spotlight`

Purpose:

- Highlight useful near-term context

Inputs:

- next 1-3 games
- home/away
- indoor/outdoor
- defense quality

Outputs:

- short-term schedule notes

Type:

- deterministic

### `coach_insight_generator`

Purpose:

- Produce the concise recommendation the user reads

Inputs:

- all structured Coach outputs

Outputs:

- final insight text

Type:

- AI

### `coach_comparison_answer`

Purpose:

- Answer direct prompts like `Allen vs Mahomes`

Inputs:

- structured comparison of two or more options

Outputs:

- recommendation plus explanation

Type:

- AI on top of deterministic comparison

## Layer 4: GM Evaluators

GM is the draft market engine.

### `adp_market`

Purpose:

- Treat ADP as market price

Inputs:

- ADP by platform
- scoring format
- league size

Outputs:

- market pick cost

Type:

- deterministic

### `draft_value_vs_market`

Purpose:

- Compare internal player value to market cost

Inputs:

- internal value
- ADP
- platform rank

Outputs:

- steal / expected / reach signal

Type:

- deterministic

### `vona_model`

Purpose:

- Compute value over next available

Inputs:

- current board
- user next pick
- player tiers

Outputs:

- VONA score

Type:

- deterministic

### `survival_probability`

Purpose:

- Estimate whether a player makes it back to the user

Inputs:

- ADP
- next pick distance
- platform behavior
- live board state
- current position run

Outputs:

- survive-to-next-pick percent

Type:

- deterministic

### `tier_cliff_detector`

Purpose:

- Detect when a position is about to dry up

Inputs:

- rankings
- tiers
- remaining players

Outputs:

- cliff warning

Type:

- deterministic

### `positional_scarcity`

Purpose:

- Quantify opportunity cost by position

Inputs:

- value curve by position
- starter demand
- remaining tier depth

Outputs:

- scarcity score

Type:

- deterministic

### `roster_construction`

Purpose:

- Measure how well a pick fits the current build

Inputs:

- current roster
- league settings
- starting requirements

Outputs:

- fit score
- build note

Type:

- deterministic

### `upside_profile`

Purpose:

- Identify high-ceiling, rangier draft options

Inputs:

- ceiling
- volatility
- archetype

Outputs:

- upside score

Type:

- deterministic

### `risk_penalty`

Purpose:

- Penalize fragile or overly uncertain players

Inputs:

- injury risk
- role uncertainty
- age/cliff risk

Outputs:

- risk deduction

Type:

- deterministic

### `run_detector`

Purpose:

- Detect live position runs during the draft

Inputs:

- recent picks
- position counts
- pick window

Outputs:

- run alert

Type:

- deterministic

### `draft_capital_grade`

Purpose:

- Grade a pick against cost and alternatives

Inputs:

- value ratio
- pick cost
- nearby alternatives

Outputs:

- A+ through F grade

Type:

- deterministic

### `gm_recommendation_stack`

Purpose:

- Generate the seven-option sidebar

Outputs:

- `High Steal`
- `Mid Steal`
- `Low Steal`
- `Expected`
- `Low Reach`
- `Mid Reach`
- `High Reach`

Type:

- deterministic

### `gm_explainer`

Purpose:

- Produce short draft-room commentary

Inputs:

- structured GM outputs

Outputs:

- concise nudge text

Type:

- AI

### `gm_question_answerer`

Purpose:

- Optional later conversational layer for paid/pro versions

Type:

- AI

## Layer 5: Consensus Logic

### Coach Consensus

```txt
coach_score =
  projection_core
  + matchup_adjustment
  + injury_adjustment
  + confidence_adjustment
  + lineup_context_adjustment
  + floor_or_ceiling_preference
  + trend_adjustment
```

Interpretation:

- If the user is favored, bias toward floor and confidence.
- If the user is behind, bias toward ceiling and volatility.

### GM Consensus

```txt
gm_score =
  draft_value_vs_market
  + vona_model
  + positional_scarcity
  + roster_construction
  + upside_profile
  + survival_probability_adjustment
  - risk_penalty
```

Interpretation:

- GM is probabilistic.
- Market price and future availability matter as much as raw projection.

## Player Lifecycle / Cliff Model

This is a major required layer for 949 and should sit inside the shared core.

Raw projections alone are not enough. A player can remain productive right up until a rapid decline phase. The model should estimate not only what the player is worth now, but how close they are to a performance cliff.

### Why This Matters

Examples:

- A running back over 30 with very high historical carry volume may still project well, but have elevated decline risk.
- A WR sharing targets with another alpha may have a thinner margin for stable elite value than a WR with a more secure target monopoly.
- A veteran workhorse like Derrick Henry may require a different durability and workload lens than a committee back.

This is not purely a statistical output issue. It is a football-context and role-shape issue.

### Required Concepts

The lifecycle model should account for:

- age
- career touch load
- recent seasonal carry volume
- recent seasonal target volume
- committee intensity
- role centrality
- teammate competition
- injury accumulation
- athletic decline indicators where available
- historical comps by position/archetype

### Positional Box-Chart Requirement

Build positional distributions, excluding clear outliers, to understand normal aging and workload curves.

Suggested positional box-chart features:

#### RB

- age
- carries per season
- touches per season
- receptions per season
- yards after contact / first contact context where available
- committee share
- goal-line dependence

#### WR

- age
- targets per season
- target share
- air yards
- yards per route or similar opportunity metrics where available
- teammate target competition
- slot vs perimeter role if available later

#### QB

- age
- rushing dependence
- sack rate / pressure exposure
- designed rushes
- pass attempts per season
- multi-year efficiency stability

#### TE

- age
- route participation
- target share
- red-zone dependence
- teammate target competition

### Cliff Evaluator

Add a shared evaluator:

#### `cliff_risk_model`

Purpose:

- estimate whether the player is pre-peak, peak, post-peak, or near-decline

Inputs:

- age
- seasonal usage history
- recent role trend
- committee pressure
- teammate competition
- injury history
- position-specific historical comp set

Outputs:

- lifecycle bucket
- cliff risk score
- decline proximity label

Lifecycle buckets:

- `ascending`
- `prime`
- `plateau`
- `decline-risk`
- `post-cliff`

Type:

- deterministic initially

### How GM Uses Cliff Risk

GM should use cliff risk to prevent overpaying for aging or overloaded profiles whose market cost assumes prior peak production still holds.

Applications:

- draft capital penalty
- veteran tie-breakers
- dynasty later if relevant
- seasonal risk framing in close calls

### How Coach Uses Cliff Risk

Coach should use cliff risk more softly in-season.

Applications:

- trend explanations
- waiver/drop watch
- “usage still strong, but efficiency decline is showing”
- “committee pressure is increasing”

Coach should not overreact to cliff risk on a weekly start/sit call unless the decline is already visible in current usage or efficiency.

## Build Order

Priority order for implementation:

1. `scoring_rules`
2. `projection_core`
3. `range_model`
4. `confidence_model`
5. `value_model`
6. `trend_model`
7. `cliff_risk_model`
8. `start_sit_score`
9. `lineup_context`
10. `adp_market`
11. `draft_value_vs_market`
12. `vona_model`
13. `survival_probability`
14. `tier_cliff_detector`
15. `roster_construction`
16. `run_detector`
17. AI explanation layer

## V1 Implementation Rule

For V1, only these should use OpenAI:

- `news_summary`
- `coach_insight_generator`
- `coach_comparison_answer`
- `gm_explainer`
- optional later `gm_question_answerer`

Everything else should be deterministic and inspectable.

## Cursor Notes

- Preserve the distinction between `data facts`, `evaluators`, `consensus logic`, and `AI explanation`.
- Do not build Coach or GM as giant prompts.
- Treat `cliff_risk_model` as a first-class shared evaluator, not a later embellishment.
- Prefer canonical shared tables and reusable evaluator outputs over view-specific logic.
