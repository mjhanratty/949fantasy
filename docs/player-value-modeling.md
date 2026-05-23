# 949Fantasy Player Value Modeling

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-player-value-modeling.md`


## Purpose

This document gives Cursor a modeling handoff for 949Fantasy's player value system.

The current validation work was run on quarterbacks only, but the framework should be built as a position-agnostic player value model that can later be tested against RB, WR, TE, K, and DST.

## Core Principle

Do not treat raw projected points as the product.

949Fantasy should model:

- baseline-relative value.
- value stability.
- floor / ceiling profile.
- weekly volatility.
- role security.
- injury and availability noise.
- draft cost vs expected value.
- Coach confidence by weekly context.

AI can explain these outputs, but the backend should calculate them.

## Value Concepts

### Preseason Value

Stable season expectation created before the season from:

- prior seasons.
- projected points.
- position baseline.
- role expectation.
- team context.
- age/lifecycle risk.
- injury history where available.

This should not be rewritten after every weekly result.

### Current Value Pace

What the player is actually delivering during the season.

Example:

```txt
current_value_pace = current_fantasy_points / current_position_baseline
```

This can move weekly and should be shown as current performance, not as the original preseason value.

### Weekly C/F Adjustment

Weekly results should adjust:

- floor.
- ceiling.
- confidence.
- volatility.
- Coach trust.
- start/sit risk.

They should not automatically overwrite the player's full-season Value Grade.

Example:

If a player has preseason value `1.10` but starts Weeks 1-2 at `0.80`, the app should show:

- Preseason Value: `1.10`
- Current Pace: `0.80`
- Confidence: down.
- Floor: down.
- Ceiling: unchanged or slightly down depending on usage.
- Coach: more cautious until role rebounds.

## Baseline Pool Vs Evaluation Pool

### Baseline Pool

Used to calculate positional averages.

The baseline pool should avoid emergency players, dead-weight backups, and tiny-sample outliers that drag the average down.

Recommended early rule:

```txt
baseline_pool =
  historical_value > 0.30
  AND completed_nfl_seasons >= 3
  AND recent_activity_passes_minimum
```

Then trim the bottom quartile where needed to create a realistic fantasy-relevant baseline.

### Evaluation Pool

Used to grade all players.

This includes:

- veterans.
- rookies.
- second-year players.
- backups.
- breakout candidates.

Rookies should not define the veteran baseline, but they should still be graded against it once they have projected points.

## Rookie Handling

Rookies need a separate projection path because they lack NFL history.

Suggested rookie inputs:

- draft capital.
- college production.
- rushing/receiving profile by position.
- projected starting role.
- offensive environment.
- depth chart opportunity.
- coaching tendency.
- camp/preseason/news signal where available.

Once projected points exist, rookie Value Grade should use the same position baseline as veterans.

## Initial QB Validation Slice

The first prototype tested weekly grade prediction for 12 quarterbacks using the supplied 2025, 2024, and 2023 QB data.

The first 6 QBs were premium or high-performing profiles:

- Jalen Hurts.
- Josh Allen.
- Kyler Murray.
- Joe Burrow.
- Justin Herbert.
- Dak Prescott.

The added 6 QBs were more average, unstable, injured, or role-sensitive profiles:

- Daniel Jones.
- Trevor Lawrence.
- Tua Tagovailoa.
- Joe Flacco.
- Kenny Pickett.
- Kirk Cousins.

Files:

- `docs/data/qb-grade-validation-prototype.csv`
- `docs/data/qb-grade-validation-12qb.csv`
- `docs/data/qb-grade-validation-12qb-summary.csv`

## QB Baseline Used In 12-QB Test

The baseline used the supplied QB population, filtered for:

- historical value above `0.30`.
- at least three seasons.
- bottom 25% trimmed from the baseline calculation.

Resulting QB baselines:

| Year | Baseline | Per Game |
|---:|---:|---:|
| 2025 | 239.82 | 14.11 |
| 2024 | 294.24 | 17.31 |
| 2023 | 294.16 | 17.30 |

This baseline is intentionally higher than an all-QB average because the all-QB average is dragged down by backups, one-off appearances, and emergency players.

## 12-QB Validation Summary

Simple model tested:

```txt
predicted_weekly_grade =
  grade(prior_2023_2024_weekly_average / 2025_position_weekly_baseline)
```

Overall across 150 active QB games:

| Metric | Result |
|---|---:|
| Exact grade accuracy | 32.0% |
| Within-one-grade accuracy | 47.3% |
| Average absolute value error | 0.50 |
| Overprojection rate | 54.0% |

Series-level movement:

| Series | Games | Exact Grade | Within 1 Grade | Avg Abs Value Error | Overproject | Underproject |
|---|---:|---:|---:|---:|---:|---:|
| Premium 6 QBs | 78 | 48.7% | 65.4% | 0.46 | 53.8% | 43.6% |
| Average / unstable 6 QBs | 72 | 13.9% | 27.8% | 0.54 | 52.8% | 45.8% |
| All 12 QBs | 150 | 32.0% | 47.3% | 0.50 | 53.3% | 44.7% |

## Interpretation

The simple prior-average model has some value for broad season tiering, especially with premium QBs.

It is not good enough for weekly Coach decisions.

Main reason:

- Premium players often stay in a high-value range even when the model misses slightly.
- Average and unstable players need role, injury, matchup, and volatility context.
- Simple prior average cannot identify false promise or fragile value profiles.

Useful content insight:

```txt
Daniel Jones, Trevor Lawrence, Tua, Flacco, Pickett, and Cousins do not behave like stable premium assets.
```

Product translation:

```txt
These players can flash starter weeks, but their value profile is fragile. GM should not draft them like anchors, and Coach should not treat them like set-and-forget starters.
```

## Fragile Value / False Promise Model

949Fantasy should explicitly model players whose projected value looks useful but is unstable.

Potential signals:

- spike weeks carrying the average.
- low weekly floor.
- high standard deviation.
- poor floor hit rate.
- role uncertainty.
- injury history.
- team change.
- benching risk.
- pass-volume dependency.
- TD dependency.
- weak rushing floor for QB.
- matchup sensitivity.
- poor offensive environment.
- turnover/sack volatility.

Suggested outputs:

```txt
value_grade = B
ceiling_grade = A-
floor_grade = D
stability = Low
coach_trust = Risky
gm_note = Volatile value profile
```

## GM Usage

GM should use fragile value to:

- discount risky players unless draft cost is right.
- avoid treating volatile players as core roster anchors.
- mark some players as upside/reach picks rather than stable values.
- flag players whose ADP is pricing ceiling rather than weekly stability.
- identify false-promise profiles before draft day.

## Coach Usage

Coach should use fragile value to:

- avoid risky players when protecting a lead.
- allow risky players when chasing ceiling.
- lower confidence even when projection looks playable.
- explain boom/bust profiles.
- separate stable starts from desperation ceiling plays.

## Next Model Layer

The next version should not rely on prior average alone.

Recommended hybrid model:

```txt
weekly_value_prediction =
  preseason_value
  + current_season_rolling_form
  + role_security
  + injury_availability_flag
  + matchup_adjustment
  + floor_stability
  + ceiling_signal
  + position_specific_context
  - volatility_penalty
```

For QB, position-specific context should include:

- rushing floor.
- designed rush / scramble usage where available.
- TD dependency.
- sack rate.
- interception rate.
- pass attempts.
- yards per attempt.
- offensive environment.
- benching risk.

Other positions will need their own position-specific context.

## Accuracy Metrics To Track

For every position test, track:

- exact grade accuracy.
- within-one-grade accuracy.
- average absolute value error.
- overprojection rate.
- underprojection rate.
- average grade delta.
- floor hit rate.
- ceiling hit rate.
- above/below baseline directional accuracy.
- injury-excluded accuracy.
- injury-included accuracy.
- player-level volatility.

## Lineup Optimization Translation

Floor/ceiling honesty matters most in Start/Sit Studio and lineup optimization.

The app should not optimize only one lineup total and pretend that outcome is certain. It should support three lineup views:

```txt
median_lineup = highest expected lineup
floor_lineup = safest lineup
ceiling_lineup = highest-upside lineup
```

The median lineup is the default recommendation. The floor lineup is the safer alternative when the user is favored or wants to avoid a fragile player. The ceiling lineup is the chase alternative when the user is projected behind or needs a high-variance path.

The model should be honest: it is predicting how another person will perform in a sport. A player can land below the modeled floor or above the modeled ceiling. When that happens, the product should treat it as an outlier signal to explain, not as a reason to make the displayed range so wide that it becomes meaningless.

Weekly floor/ceiling must be player-specific, not position-wide. Stable players should show tighter ranges; volatile, role-sensitive, or low-confidence players should show wider ranges or lower confidence. If the range must become absurdly wide to hit the target coverage, show low confidence instead of expanding the UI band.

Season floor/ceiling must be calculated separately from weekly floor/ceiling. Do not sum every weekly ceiling to create a season ceiling, because that assumes a player hits the top of his likely weekly range every week. Weekly ranges can be wider because single games are noisy; season ranges should be tighter because variance smooths over 15-17 games.

Season ranges should respect the player's historical season profile. If a player has never approached 400 points, a 400+ season should be labeled as an outlier or stretch outcome, not the normal ceiling. If a player has repeatedly lived near 385, then a 400-point ceiling may be reasonable and a floor around the mid-330s may be honest depending on role and health.

Floor and ceiling are likely-performance bands, not career-minimum and career-maximum claims. Do not let benching, playoff safety, injury exits, or other disrupted-role games redefine a player's normal floor unless those events change the forward-looking role or availability profile.

The model should hold its core prediction through short-term scoring misses when the role is intact:

```txt
bad game, role intact -> hold projection, note variance
two bad games, role intact -> hold range, lower confidence/watch trend
bad game with reduced snaps or injury -> adjust role/health factor
two games with role loss -> update median and floor
above ceiling with stable usage -> tag spike, do not overinflate
above ceiling with new role -> upgrade projection
```

This prevents the product from chasing noise. The model is suggesting where a player is likely to perform, not the worst or best game he has ever had.

Recommended lineup output:

```ts
type LineupScenarioTotals = {
  medianTotal: number
  floorTotal: number
  ceilingTotal: number
  opponentMedianTotal?: number
  confidence: "high" | "medium" | "low"
  scenario: "median" | "floor" | "ceiling"
}
```

Coach should explain tradeoffs in plain language:

```txt
This swap raises your median by 0.4 but lowers your floor by 4.8. That is not enough gain unless you are specifically chasing ceiling.
```

## Cursor Implementation Notes

When this becomes code, keep it position-agnostic.

Recommended concepts:

- `position_baselines`
- `player_season_values`
- `player_week_values`
- `player_value_predictions`
- `player_grade_validation_runs`
- `player_value_stability`
- `player_floor_ceiling_adjustments`

Recommended validation run fields:

```ts
type PlayerGradeValidationRow = {
  playerId: string
  playerName: string
  position: string
  season: number
  week: number
  predictedGrade: "A+" | "A" | "B" | "C" | "D" | "F"
  actualGrade: "A+" | "A" | "B" | "C" | "D" | "F"
  gradeDelta: number
  predictedValue: number
  actualValue: number
  valueError: number
  modelVersion: string
  baselineVersion: string
  injuryFlag?: boolean
  roleFlag?: string
}
```

Do not hardcode QB-only assumptions into the table names or API shape.

The current QB validation is a first slice, not the final model.
