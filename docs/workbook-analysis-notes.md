# 949Fantasy Workbook Analysis Notes

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-workbook-analysis-notes.md`  
> **Workbook:** `/Users/matthewhanratty/Downloads/Fantasy Football V2.0 (1).xlsx` — methodology inspiration, not production architecture.

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
| > 1.00 | A+ |
| 0.90 - 1.00 | A |
| 0.80 - 0.89 | B |
| 0.70 - 0.79 | C |
| 0.60 - 0.69 | D |
| < 0.60 | F |

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
