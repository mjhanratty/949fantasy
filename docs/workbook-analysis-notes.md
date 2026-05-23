# 949Fantasy Workbook Analysis Notes

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-workbook-analysis-notes.md`


Source workbook: `/Users/matthewhanratty/Downloads/Fantasy Football V2.0 (1).xlsx`

Primary tab reviewed: `Fantasy Rankings`

## Purpose

This workbook is the inspiration layer for 949Fantasy player value, projected grades, floor/ceiling bands, and draft ranking logic.

For product use, treat the workbook as a methodology source, not as the final production model. The app should preserve the best concepts while moving the calculations into explicit, testable model code.

## Workbook Structure

Visible sheets:

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

There is no visible sheet named `How`; the method is embedded through formulas across the test/ranking sheets.

## Fantasy Rankings Layout

`Fantasy Rankings` is arranged as three horizontal position blocks:

| Position | Player Column | Predicted | Actual | Historical Seasons | Avg | 2025 PPG | Value | Projected Value | Predicted PPG | Ceiling | Floor | Summary Row |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QB | A | B | C | D:F | G | H | L | M | N | O | P | 52 |
| RB | R | S | T | U:W | X | Y | AC | AD | AE | AF | AG | 76 |
| WR | AI | AJ | AK | AL:AN | AO | AP | AT | AU | AV | AW | AX | 77 |

The workbook has current actual points for QB/RB/WR in the `2025` columns, but only QB has `Pts/GM 25` populated in this tab. RB and WR `Pts/GM 25` are blank, so RB/WR 17-game pace testing requires a separate games-played source or weekly player log.

## Current Formula Pattern

The current prediction model is a historical weighted average plus a trend component:

```text
predicted_points = 0.7 * weighted_average_recent_history + 0.3 * linear_trend
```

Common weighting pattern:

```text
3 years available: 60% most recent + 30% prior + 10% oldest
2 years available: 75% most recent + 25% prior
1 year available: use that season
```

Some QB rows have custom/manual weighting, which is useful as exploration but should not be hidden in production formulas. If we use manual adjustments later, they should be stored as named adjustment factors with reasons.

Floor and ceiling are based on predicted season total plus/minus a volatility band:

```text
range_delta = 1.28 * points_per_game_volatility * sqrt(17)
ceiling = max(predicted_points, predicted_points + range_delta)
floor = max(0, min(predicted_points, predicted_points - range_delta))
```

The intent is strong: translate historical player volatility into a season range. The production version needs a wider uncertainty model that also accounts for role change, health, age, team context, depth chart, rookies, and playing-time risk.

## Value And Grades

The workbook calculates player value by dividing the player score by the position group average.

Examples:

```text
actual_value = historical_or_actual_average / position_group_average
projected_value = projected_points / projected_position_average
```

For 949Fantasy, value should drive tiers and A+ to F grades.

| Value | Grade |
| --- | --- |
| 1.25+ | A+ |
| 1.10 - 1.24 | A |
| 0.95 - 1.09 | B |
| 0.80 - 0.94 | C |
| 0.65 - 0.79 | D |
| < 0.65 | F |

This version intentionally keeps the top tier exclusive. A+ should mean the player is creating a clear positional advantage, not merely sitting above the average player.

Needed production fields:

- `last_season_value`
- `last_season_grade`
- `projected_value`
- `projected_grade`
- `career_value`
- `career_grade`
- `position_average_basis`
- `scoring_format`
- `season`

## Preliminary Range Validation

Initial audit of `Fantasy Rankings` with the workbook values:

| Position | Players | With Predicted/Floor/Ceiling/Actual | Actual Total Hit Rate | 17-Game Pace Test |
| --- | ---: | ---: | ---: | --- |
| QB | 50 | 44 | 8/44, 18.2% | 9/44, 20.5% |
| RB | 74 | 62 | 14/62, 22.6% | Cannot validate from this tab because `Pts/GM 25` is blank |
| WR | 75 | 69 | 4/69, 5.8% | Cannot validate from this tab because `Pts/GM 25` is blank |

Interpretation:

- The current range bands are too narrow for the desired 70% hit-rate target.
- Some misses are not pure model misses; injuries, benchings, role changes, or partial seasons distort full-season totals.
- Even using QB 17-game pace, the hit rate remains low, which means the volatility/floor/ceiling formula needs to be redesigned, not just injury-adjusted.
- RB/WR need games-played or weekly logs before we can answer the 17-game pace question responsibly.

Large QB pace misses included Lamar Jackson, Anthony Richardson, Daniel Jones, Drake Maye, Michael Penix, and Marcus Mariota. These are useful because they represent different miss types: over-projection, injury/benching, new opportunity, young player breakout, and replacement-start relevance.

## Missing Rookie Predictions

The workbook leaves several rookies or low-history players without predictions.

QB examples:

- JJ McCarthy
- Cam Ward
- Tyler Shough
- Jaxson Dart
- Dillion Gabriel
- Jalen Milroe

RB examples:

- Ashton Jeanty
- Quinshon Judkins
- Omarion Hampton
- RJ Harvey
- TreVeyon Henderson
- Cam Skattebo
- Kaleb Johnson
- Jaydon Blue
- Trever Etienne
- Bhayshul Tuten
- Dylan Sampson
- Woody Marks

WR examples:

- Tetairoa McMillan
- Emeka Egbuka
- Matthew Golden
- Travis Hunter
- Tre Harris
- Jack Bech

Production cannot rely only on NFL history because rookies, role changes, and second-year breakouts are central to draft value.

## Rookie Projection Model

Rookies should use a separate model family, then merge into the same value/grade system.

Recommended rookie inputs:

- NFL draft capital
- College production share
- College yards per route run or rush efficiency where available
- Athletic profile
- Projected depth chart role
- Team offensive environment
- Vacated targets/carries
- Red-zone opportunity
- Coaching tendency
- Platform ADP
- 949 analyst adjustment, if needed

Rookie output should still normalize into:

- projected points
- floor
- median
- ceiling
- projected value
- projected grade
- uncertainty score

Rookies should usually carry a wider range because the uncertainty is real and user trust is better served by showing that range clearly.

## Model Accuracy Improvements

Priority improvements before this powers GM/Coach:

1. Normalize the workbook into a long table: one row per player, position, season, scoring format, source, and metric.
2. Separate features from labels. Do not let `2025` actuals leak into 2025 predictions.
3. Add games played and weekly logs so the model can compare actual full-season totals, points per game, and 17-game pace.
4. Replace one-size volatility with position-specific uncertainty bands.
5. Add role and availability context: injury, games missed, starter status, team change, quarterback change, depth-chart movement.
6. Tune floor/ceiling multipliers by position to target roughly 70% range coverage after excluding major injury/availability events.
7. Track error by position and player archetype, not only overall error.
8. Add a rookie/new-opportunity model for players without stable NFL history.
9. Convert value tiers into explicit model outputs instead of using floor/ceiling as the tiering basis.

## Ceiling/Floor Model Rebuild

The current workbook range is centered on a historical weighted projection and then widened by historical points-per-game volatility. That is a useful starting point, but the audit shows the range is usually too narrow and often centered too high.

The production model should rebuild ceiling/floor around three separate ideas:

- `median_projection`: the most likely season-long point outcome.
- `expected_range`: the cleaner user-facing floor/ceiling shown in rankings, GM, Coach, and Player Tape.
- `calibrated_range`: the internal model range tuned to hit roughly 70% coverage after excluding major availability/injury events.

Weekly and season ranges must be separate products.

- Weekly floor/ceiling can be wider because a single game can swing on opponent, weather, injury exits, game script, missing teammates, or a disrupted offensive line.
- Season floor/ceiling should be tighter because variance smooths across the schedule.
- Do not create season ceiling by summing every weekly ceiling, and do not create season floor by summing every weekly floor.
- Season ranges should be anchored to the player's historical season totals, games played, role security, and availability profile.

### Step 1: Build A Conservative Median

Do not use raw historical trend as the center of the range by itself.

Recommended median formula:

```text
median_projection =
  weighted_recent_production
  * availability_factor
  * role_security_factor
  * team_context_factor
  * age_curve_factor
  * scoring_format_factor
```

Where:

- `weighted_recent_production`: historical fantasy production, weighted toward the most recent season.
- `availability_factor`: games played, missed-game history, injury flag, suspension risk.
- `role_security_factor`: starter certainty, snap share, route share, touch share, target share, committee risk.
- `team_context_factor`: offensive environment, quarterback quality, pace, implied scoring, offensive line where available.
- `age_curve_factor`: position-specific aging adjustment.
- `scoring_format_factor`: Standard, Half PPR, Full PPR.

The current workbook has up to 5 years of historical point data, which is enough for local testing. SportsDataIO should become the production source for the most recent 3 years, with the workbook logic used as the conceptual baseline.

### Step 2: Separate Volatility Types

The current model treats volatility mostly as prior points-per-game variance. That misses the biggest fantasy risk categories.

Production should calculate a composite volatility score:

```text
volatility_score =
  weekly_points_volatility
  + role_volatility
  + availability_volatility
  + team_context_volatility
  + player_archetype_volatility
```

Examples:

| Volatility Type | What It Captures |
| --- | --- |
| Weekly points volatility | How uneven the player's scoring is week to week |
| Role volatility | Committee risk, target competition, unclear snap share |
| Availability volatility | Injury history, missed games, recurrence risk |
| Team context volatility | QB uncertainty, offensive coordinator change, team quality |
| Archetype volatility | Deep threat WR, pass-catching RB, rushing QB, rookie, backup promoted to starter |

This matters because a player can be historically stable but currently risky if his role changed.

### Step 3: Use Position And Archetype Range Factors

Do not widen every player the same way. Each player should receive a range profile.

Example user-facing factors:

| Profile | Floor Factor | Ceiling Factor |
| --- | ---: | ---: |
| Stable elite QB | 0.82 | 1.12 |
| Volatile rushing QB | 0.72 | 1.18 |
| Bellcow RB | 0.72 | 1.20 |
| Committee RB | 0.55 | 1.25 |
| Target hog WR | 0.70 | 1.18 |
| Deep threat WR | 0.50 | 1.35 |
| Rookie | 0.45 | 1.40 |

Formula:

```text
floor_points = median_projection * floor_factor
ceiling_points = median_projection * ceiling_factor
```

Then apply a small calibrated adjustment from the player's volatility score:

```text
adjusted_floor = floor_points * (1 - downside_volatility_adjustment)
adjusted_ceiling = ceiling_points * (1 + upside_volatility_adjustment)
```

This lets stable players keep tight ranges while volatile players show honest uncertainty.

### Step 4: Calibrate To 70% Without Making Ranges Useless

The goal is not to force every player into a massive band. The goal is to make the range trustworthy.

Use a calibration loop:

1. Backtest by season and position.
2. Exclude or separately tag major availability events, such as season-ending injuries, suspensions, and players who lost their role for non-performance reasons.
3. Measure whether actual season points landed inside the model range.
4. Tune range multipliers by position and archetype until each group approaches 70% coverage.
5. Keep a maximum range-width guardrail so the UI does not show meaningless ranges.

Suggested guardrails:

```text
QB expected range width: usually 25% - 45% of median
RB expected range width: usually 35% - 65% of median
WR expected range width: usually 35% - 70% of median
Rookie expected range width: usually 50% - 90% of median
```

If a range needs to exceed the guardrail to hit 70%, show a lower confidence rating instead of making the displayed range absurdly wide.

### Step 4A: Keep Floor/Ceiling From Chasing Noise

Floor and ceiling should describe a player's likely performance range when he plays his expected role. They should not be interpreted as the worst and best games of the player's career.

Backtests should tag outliers separately:

- Injury exit.
- Playoff safety or benching.
- Role loss.
- Normal-role bad game.
- Normal-role spike game.
- New-role spike game.

Do not adjust the core median or range because of short-term scoring misses alone. If usage and availability are intact, hold the projection and lower confidence or add a watch note. If the miss comes with changed snaps, routes, touches, attempts, injury status, or team context, update the role/health/context factors.

Rule of thumb:

```text
one bad game with normal role = variance
two bad games with normal role = watch trend, hold projection
bad game with role or health change = update projection inputs
above-ceiling game with normal role = spike outcome
above-ceiling game with new role = possible projection upgrade
```

### Step 5: Add Confidence Beside The Range

Every floor/ceiling output should include confidence.

Recommended confidence labels:

| Confidence | Meaning |
| --- | --- |
| High | Stable role, stable history, strong data sample |
| Medium | Some role or context uncertainty |
| Low | Rookie, major team change, injury risk, role uncertainty, or low data sample |

Example output:

```json
{
  "projected_points": 238.4,
  "floor_points": 178.8,
  "ceiling_points": 292.6,
  "range_confidence": "Medium",
  "range_reason": ["committee risk", "strong efficiency", "limited 3-year sample"]
}
```

This is important for user trust. A wider range with a reason feels intelligent; a wide range without context feels evasive.

### Step 6: Use Workbook History Now, SportsDataIO Later

V0/testing:

- Use the workbook's 5-year historical player point data.
- Use available points-per-game columns where present.
- Add a manual games-played field where missing, especially RB/WR.
- Backtest alternate floor/ceiling factors against the workbook.

V1/production with SportsDataIO:

- Use SportsDataIO for the most recent 3 seasons of weekly player stats.
- Rebuild fantasy points by scoring format from raw stats.
- Calculate weekly volatility directly from game logs.
- Calculate games played, missed games, snap/touch/target trends where available.
- Store model outputs in Supabase so GM, Coach, Player Tape, and Draft Rankings all read the same values.

### Step 7: Keep Value Separate From Range

Value grades should not be determined by floor/ceiling.

Correct relationship:

```text
value_grade = relative positional scoring power
floor/ceiling = expected outcome range
confidence = how trustworthy the range is
```

Example:

```text
Player A:
Projected Value: 1.28
Grade: A+
Range: Wide
Confidence: Medium

Interpretation:
Elite value profile, but outcome volatility is meaningful.
```

This separation lets GM explain draft picks more clearly:

- "A+ value, but expensive and volatile."
- "B value, but safe floor."
- "C value, but A-level ceiling if the role breaks right."

## Production Model Outputs Needed

For Cursor/app piping and later Supabase tables, every ranked player should expose:

```json
{
  "player_id": "string",
  "player_name": "string",
  "position": "QB|RB|WR|TE|DST|K",
  "team": "string",
  "season": 2026,
  "scoring_format": "standard|half_ppr|full_ppr",
  "projected_points": 0,
  "floor_points": 0,
  "median_points": 0,
  "ceiling_points": 0,
  "projected_value": 0,
  "projected_grade": "A+|A|B|C|D|F",
  "last_season_value": 0,
  "last_season_grade": "A+|A|B|C|D|F",
  "career_value": 0,
  "career_grade": "A+|A|B|C|D|F",
  "uncertainty_score": 0,
  "rookie_flag": false,
  "model_notes": []
}
```

## GM And Coach Implications

GM should use projected value and draft capital to grade picks. Floor/ceiling should help identify sleepers, reaches, and fragile profiles, but value should drive the core tier.

Coach should use weekly projected floor/median/ceiling and current role trends. It should not blindly trust season-long value if recent usage shows the player is losing work.

Player Tape should become the explainability surface for why the model moved: usage, opportunity, weekly scoring, pace, floor/ceiling drift, and value trend.

## Next Build Step

Create a repeatable Python model audit script that:

- reads the workbook or exported CSVs
- normalizes `Fantasy Rankings`
- calculates direct hit rate
- calculates 17-game pace hit rate when games/PPG exists
- flags players with missing predictions
- outputs grade distributions by position
- reports biggest misses by miss type
- tests alternate floor/ceiling multipliers by position

This should live outside the spreadsheet so the model can be rerun every time new stats are imported.
