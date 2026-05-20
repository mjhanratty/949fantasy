# 949Fantasy Draft Theory Source Notes

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-draft-theory-source-notes.md`

## Purpose

This document converts the provided draft strategy sources into structured product lessons for the 949Fantasy GM agent.

Use this as the human-readable bridge between source research and the deterministic draft market engine in `949fantasy-draft-market-engine.md`.

## Source Access Notes

Some pages were fully accessible through browser fetch. Some were only available through search-index excerpts or failed direct fetch. Do not treat partially accessible sources as exhaustively reviewed until manually verified.

| Source | Access | 949 Use |
|---|---|---|
| FantasyPros ADP | Full | ADP definition, scoring/provider splits, consensus market view |
| FantasyLife ADP | Full | Platform-specific ADP filtering and multi-platform market comparison |
| Yahoo Draft Analysis | Failed fetch | Keep as planned source, verify manually later |
| Footballguys ADP | Full | Multi-source ADP spread and market dispersion |
| FantasyPros VBD / VORP / VOLS / VONA | Full | Core value-based draft math |
| FantasyPros VBD picks article | Full | Same article family, reinforces VBD limitations |
| Advanced Football Analytics game theory | Search excerpt only | Draft as multi-player zero-sum/perfect-information game |
| Subvertadown Snake VBD | Search-indexed full excerpt | Snake-value, VONA, scarcity, smoothing |
| DraftSharks auction strategy | Full | Budget buckets, tiers, flexible spending, opportunity cost |
| RotoWire auction values | Full | Custom league settings, auction value calculation, budget discipline |
| Fantasy Footballers strategic nominations | Full | Auction nomination tactics and opponent-budget pressure |
| FantasyPros position scarcity | Search-indexed full excerpt | Scarcity as drop-off by ADP tiers |
| FantasyPros Draft Wizard / Mock Draft Simulator | Search-indexed excerpts | Custom settings, computer opponent logic, repeated strategy testing, instant draft analysis |
| FanGraphs BPA vs scarcity | Search excerpt only | BPA and scarcity should not be separate if value is position-adjusted |
| FFInsights QB strategy | Search-indexed full excerpt | Projection vs ADP validation and QB breakout signals |
| SMU data science paper | Failed fetch | Verify manually later |
| OpenFPL arXiv | Full abstract | Public-data, position-specific ensemble forecasting and prospective testing |
| Integer programming arXiv | Full abstract | Constrained optimization, robust IP, Monte Carlo, hybrid metrics |

## Structured Lessons

### 1. ADP Is A Market Price, Not A Projection

Sources:

- FantasyPros ADP: https://www.fantasypros.com/nfl/adp/overall.php
- FantasyLife ADP: https://www.fantasylife.com/tools/nfl-adp
- Footballguys ADP: https://www.footballguys.com/adp
- FFInsights QB strategy: https://www.ffinsights.com/p/fantasy-football-qb-draft-strategy

Lesson:

ADP measures how the draft market prices players. It is useful because it captures manager behavior, platform defaults, late news, sentiment, and crowd movement. It is not the same thing as a point projection.

GM engine implication:

- Store ADP by source, platform, scoring format, and timestamp.
- Never collapse ADP into one truth too early.
- Compare `platform_rank`, `consensus_adp`, `nine49_rank`, and `projection_rank`.
- Use ADP as the expected acquisition price and simulation center.
- Use projections as the expected production baseline.

Engine signal:

```txt
market_gap =
  adp_implied_pick_cost
  - nine49_rank_or_value
```

If a player is projected strongly but has a lower ADP on the user's draft platform, GM should flag a market discount and estimate whether waiting is safe.

### 2. Platform-Specific ADP Is A Product Requirement

Sources:

- FantasyPros ADP lists source-specific values.
- FantasyLife ADP exposes provider filters such as ESPN, Sleeper, Yahoo, CBS, RTSports, Underdog, Guillotine, FFPC, and SuperFlex.
- Footballguys ADP shows multiple source columns and wide player-to-player source differences.

Lesson:

GM should not use generic ADP when the user is drafting on ESPN, Yahoo, Sleeper, or another platform. Platform rank controls what the user sees in the draft room, which shapes behavior.

GM engine implication:

- Store `platform_rank` separately from `consensus_adp`.
- Calculate `platform_edge = platform_rank - nine49_rank`.
- Simulate opponents using the selected platform's visible ranks when available.
- Show the user when a player is hidden value on their platform.

### 3. Value-Based Drafting Is Necessary But Not Sufficient

Sources:

- FantasyPros VBD article: https://www.fantasypros.com/2025/06/fantasy-football-draft-strategy-value-based-drafting-vorp-vols-vona/
- FantasyPros VBD picks article: https://www.fantasypros.com/2025/08/fantasy-football-draft-strategy-value-based-drafting-picks/

Lesson:

Fantasy value depends on what a player adds above comparable alternatives at the same position. Raw points alone overvalue positions with many high scorers, especially QB in 1-QB leagues.

GM engine implication:

- Calculate VORP against replacement-level rostered players.
- Calculate VOLS against the last expected starter.
- Calculate baselines from league size, lineup slots, bench depth, scoring type, and flex settings.
- Use VBD most heavily in early and middle rounds, where drafted players are likely to be weekly starters.

VBD formulas:

```txt
vorp = player_projected_points - replacement_player_projected_points
vols = player_projected_points - last_starter_projected_points
```

### 4. VBD Has Known Limits

Sources:

- FantasyPros VBD article.

Lesson:

Pure VBD can create unbalanced rosters and can overweight safe median projections. Fantasy drafts are won by ceiling outcomes too, especially after early-round starter slots are filled.

GM engine implication:

- Do not rank by VBD alone.
- Add roster construction, upside, volatility, injury risk, and replacement-option depth.
- Increase upside weighting in later rounds.
- Suppress recommendations that produce extreme positional imbalance unless the value edge is unusually high.

Guardrail:

```txt
if roster_balance_penalty > threshold
  require market_discount or upside_score to clear a higher bar
```

### 5. VONA Is The Core Snake-Draft Concept

Sources:

- FantasyPros VBD article.
- Subvertadown Snake VBD: https://subvertadown.com/article/fantasy-snake-drafts-and-strategizing-for-scarcity----snake-value-based-drafting

Lesson:

In snake drafts, the right question is not only "Who is best now?" It is "What do I lose if I wait until my next pick?" VONA captures the expected drop-off at the same position before the user's next turn.

GM engine implication:

- Calculate expected best available by position at the user's next pick.
- Estimate availability with ADP-centered simulation.
- Raise players near steep tier cliffs.
- Lower players whose position remains deep through the next turn.

Formula:

```txt
vona =
  current_player_value
  - expected_best_available_same_position_at_next_user_pick
```

### 6. Snake Draft Value Should Smooth Future Availability

Sources:

- Subvertadown Snake VBD.

Lesson:

Snake-draft scarcity is not just a binary "will player X be there?" question. Because draft behavior is uncertain, next-available estimates should be smoothed around the expected future pick window.

GM engine implication:

- Use Monte Carlo simulation rather than a single deterministic ADP line.
- Smooth expected next-available value across a pick range.
- Increase the smoothing window as the draft gets later and uncertainty grows.
- Add only a fraction of the opportunity-cost adjustment to the base value to avoid jumpy rankings.

Initial implementation:

```txt
next_available_value =
  weighted_average(projected_value of candidates near next_pick_window)

snake_value =
  value_over_baseline
  + opportunity_cost_weight * vona
```

### 7. Scarcity Means Drop-Off, Not Just Low Position Count

Sources:

- FantasyPros position scarcity article.
- FanGraphs BPA vs scarcity excerpt.
- Subvertadown Snake VBD.

Lesson:

Scarcity matters when the remaining production drop-off at a position is meaningful. A position with fewer players is not automatically a priority if the next tier remains flat. BPA and scarcity should be reconciled through position-adjusted value, not treated as separate draft religions.

GM engine implication:

- Measure tier drop-off slope, not just number of players remaining.
- Weight scarcity in fantasy point/value units.
- Use roster settings to define how many starters are truly needed.
- Treat multi-position/flex eligibility as a depth modifier.

Scarcity formula:

```txt
scarcity_pressure =
  expected_position_demand_before_next_user_pick
  * tier_dropoff_slope
  / max(remaining_startable_players_at_position, 1)
```

### 8. Auction Strategy Teaches Capital Allocation

Sources:

- DraftSharks auction strategy: https://www.draftsharks.com/kb/best-auction-draft-strategy-salary-cap
- RotoWire auction values: https://www.rotowire.com/football/auction-values.php

Lesson:

Auction drafts make the economics explicit: managers have a budget, player values must be customized to league settings, and overspending at one position creates opportunity cost elsewhere.

GM engine implication for snake drafts:

- Treat every pick as draft capital with opportunity cost.
- Convert pick number into a pick-capital curve.
- Grade whether a player is a good use of that capital.
- Track positional spend allocation through rounds, even in snake drafts.

Spend formula:

```txt
spend_efficiency =
  expected_player_value / pick_capital_cost
```

Auction-specific later:

```txt
auction_value =
  player_value_share
  * total_draftable_budget_after_min_bids
```

### 9. Draft Plans Should Bend When Market Value Appears

Sources:

- DraftSharks auction strategy.
- RotoWire auction values.

Lesson:

A pre-draft plan is a guide, not a script. The edge comes from knowing when the room has mispriced a tier or position and shifting capital accordingly.

GM engine implication:

- Maintain a planned roster construction path.
- Calculate deviation from plan after every pick.
- Recommend pivots when room behavior creates discounts.
- Explain how a pick changes remaining roster flexibility.

Reason codes:

- `plan_preserving_pick`
- `profitable_plan_deviation`
- `tier_discount`
- `budget_or_capital_shift`

### 10. One-Starter Positions Need Extra Opportunity-Cost Checks

Sources:

- FantasyPros VBD article.
- DraftSharks auction strategy.
- FFInsights QB strategy.

Lesson:

In 1-QB leagues, usable QB production is often available later, but QB upside still matters. The right answer is not "never draft QB early." It is "pay only when the value, scarcity, and upside justify the opportunity cost."

GM engine implication:

- Penalize one-starter positions when replacement depth is strong.
- Make exceptions for formats like Superflex, two-QB, or TE premium.
- Add QB-specific upside signals such as rushing involvement.
- Break QB ties with projections first, then rushing upside and platform discount.

### 11. Projection vs ADP Accuracy Should Be Validated By Position

Sources:

- FFInsights QB strategy.
- FFInsights RB strategy search excerpt.

Lesson:

Projection and ADP accuracy can differ by position. FFInsights found projections beat ADP slightly for 2024 QBs, while ADP slightly beat projections for 2024 RBs in their dataset. This suggests GM should not hard-code one source as superior across all positions.

GM engine implication:

- Maintain position-specific source reliability weights.
- Backtest projections, ADP, and 949 rankings by position.
- Use dynamic reliability weights in recommendation scoring.

Initial source-weight shape:

```txt
position_source_weight = {
  QB: { projections: high, adp: medium },
  RB: { projections: medium, adp: medium_high },
  WR: { projections: pending_validation, adp: pending_validation },
  TE: { projections: pending_validation, adp: pending_validation }
}
```

### 12. Position-Specific Upside Signals Belong In GM

Sources:

- FFInsights QB strategy.
- FFInsights RB strategy search excerpt.

Lesson:

Breakout indicators are position-specific. For QBs, rushing usage and aggressive/high-volume passing can create upside. For RBs, projected rushing efficiency, goal-line touchdown paths, and undervalued veteran discounts may matter more than receiving projection alone.

GM engine implication:

- Add position-specific upside modules.
- Do not use one generic upside score for all positions.

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
  + age_discount_signal
  - fragile_receiving_dependency_penalty
```

### 13. Forecasting Should Be Public-Data First And Prospectively Tested

Sources:

- OpenFPL arXiv: https://arxiv.org/abs/2508.09992

Lesson:

OpenFPL demonstrates the product value of public-data, position-specific ensemble models that are tested prospectively rather than only fit retrospectively.

GM engine implication:

- Build transparent model runs and validation tables.
- Use position-specific model families.
- Report prospective accuracy after each season.
- Avoid claiming model strength until it has been tested out of sample.

### 14. Roster Decisions Are Constrained Optimization Problems

Sources:

- Integer programming arXiv: https://arxiv.org/abs/2505.02170

Lesson:

Fantasy team selection can be modeled as constrained optimization: maximize expected points or hybrid value subject to roster, budget, formation, risk, and availability constraints.

GM engine implication:

- Use greedy scoring for V1 draft recommendations.
- Move toward constrained optimization for full-draft planning and Coach lineup decisions.
- Use robust optimization or Monte Carlo scenarios when inputs are uncertain.

Future formulation:

```txt
maximize expected_roster_value
subject to:
  roster_slot_constraints
  position_min_max_constraints
  draft_capital_constraints
  risk_constraints
  bye_week_constraints
```

### 15. Auction Nominations Are Opponent-Modeling Signals

Sources:

- Fantasy Footballers strategic nomination article: https://www.thefantasyfootballers.com/analysis/fantasy-football-auction-drafts-the-power-of-strategic-nominations-fantasy-football/

Lesson:

Auction nominations can shape opponents' budgets and roster needs. Even though GM V1 is snake-first, the broader insight applies: opponent behavior changes future availability and price.

GM engine implication:

- In auction mode, recommend nomination targets based on opponent budgets, roster gaps, and price-inflation potential.
- In snake mode, track opponent roster construction to predict future positional demand.
- Do not recommend nominating desired sleepers early unless the user's max bid protection is strong.

### 16. Draft Simulation Should Be Fast, Customizable, And Variable

Sources:

- FantasyPros Mock Draft / Draft Wizard search excerpts.

Lesson:

The simulator should let users practice from their exact league context: league size, draft slot, roster settings, scoring, and platform assumptions. It should allow repeated mocks because users are testing strategy, not just one static expected draft.

GM engine implication:

- Use the user's actual league settings.
- Make simulator picks quickly.
- Include computer opponent logic.
- Return instant draft analysis.
- Add randomness and behavior presets so simulations do not become predictable.
- Track repeated simulations to show players who frequently do or do not make it back.

Simulator should include a mix of:

- Expected picks.
- Reaches.
- Steals.
- Position runs.
- Roster-need picks.
- Platform-rank picks.

## GM Agent Rules Derived From Sources

1. The GM agent must always distinguish projected production from market price.
2. The GM agent must use platform-specific ADP/rank when the user provides a platform.
3. The GM agent must score VORP, VOLS, and VONA separately.
4. The GM agent must treat VONA/snake value as the main differentiator in snake drafts.
5. The GM agent must smooth availability estimates instead of relying on one ADP cutoff.
6. The GM agent must measure scarcity as tier drop-off in value units.
7. The GM agent must include roster construction and balance guardrails.
8. The GM agent must increase upside weighting later in drafts.
9. The GM agent must apply position-specific source reliability and upside signals.
10. The GM agent must validate recommendations after the season and recalibrate.

## Recommended New Engine Components

Add these components to the draft market engine:

- `sourceReliabilityScore`
- `platformVisibilityScore`
- `snakeValue`
- `nextAvailableSmoothedValue`
- `tierDropoffSlope`
- `positionSpecificUpsideScore`
- `rosterConstructionPenalty`
- `capitalAllocationScore`
- `planDeviationScore`
- `opponentDemandForecast`

## Recommended First Build Order

1. Build platform-aware ADP ingestion.
2. Build pick-order and next-pick calculation.
3. Build VORP and VOLS baselines.
4. Build VONA with ADP-centered simulation.
5. Add smoothed snake value.
6. Add tier drop-off slope.
7. Add spend/capital grade.
8. Add roster construction guardrails.
9. Add position-specific upside scores.
10. Add AI explanation layer only after deterministic JSON is stable.
