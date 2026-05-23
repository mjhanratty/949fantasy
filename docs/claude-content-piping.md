# 949Fantasy Claude Content Piping

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-claude-content-piping.md`


## Purpose

This document tells Cursor how Claude / Claude Cowork should access 949Fantasy data for content generation.

Goal:

```txt
949 calculates.
Claude explains, packages, and writes.
```

Claude should not calculate player values from raw tables. Claude should receive compact, content-ready packets from controlled backend routes.

## Product Use Case

User asks Claude Cowork:

```txt
Give me 3 risers and 3 fallers at QB for Week 6.
```

Expected flow:

```txt
User prompt
-> Claude Cowork content task
-> 949 content brief endpoint
-> Supabase computed model outputs
-> compact JSON packet
-> Claude drafts content
-> human review / CMS / Insights / social queue
```

## Architecture

Do not give Claude direct unrestricted Supabase access for V1.

Use a controlled backend content API:

```txt
Supabase computed tables
-> Next.js /api/content/briefs routes
-> Claude Cowork
-> draft content artifacts
```

Claude should call internal 949 endpoints that return safe, compact JSON.

## Where To Build

In the Next.js app:

```txt
src/app/api/content/briefs/weekly-risers-fallers/route.ts
src/app/api/content/briefs/player-value-summary/route.ts
src/app/api/content/briefs/adp-value-edges/route.ts
src/app/api/content/briefs/fragile-value/route.ts
src/app/api/content/briefs/coach-trends/route.ts
```

These routes should query Supabase server-side.

React components should not call provider APIs or expose private database access.

## Authentication

Use an internal token for content endpoints.

Environment variable:

```txt
CONTENT_BRIEF_API_KEY=...
```

Claude Cowork requests should include:

```txt
Authorization: Bearer <CONTENT_BRIEF_API_KEY>
```

Endpoint behavior:

- Reject missing token.
- Reject invalid token.
- Return only content-safe data.
- Never return private user roster data unless the route is explicitly built for a personalized content workflow.

## Initial Endpoint: Weekly Risers / Fallers

Route:

```txt
GET /api/content/briefs/weekly-risers-fallers
```

Query params:

```txt
position=QB
week=6
season=2026
limit=3
audience=public|paid|internal
```

Example:

```txt
GET /api/content/briefs/weekly-risers-fallers?position=QB&week=6&season=2026&limit=3
```

Response:

```ts
type WeeklyRisersFallersBrief = {
  briefType: "weekly_risers_fallers"
  generatedAt: string
  season: number
  week: number
  position: "QB" | "RB" | "WR" | "TE" | "K" | "DST" | "ALL"
  audience: "public" | "paid" | "internal"
  methodologyNote: string
  risers: ContentPlayerMovement[]
  fallers: ContentPlayerMovement[]
  editorialGuidance: EditorialGuidance
  safetyRules: string[]
}

type ContentPlayerMovement = {
  playerId: string
  playerName: string
  team: string
  position: string
  previousGrade: "A+" | "A" | "B" | "C" | "D" | "F" | null
  currentGrade: "A+" | "A" | "B" | "C" | "D" | "F"
  previousValue: number | null
  currentValue: number
  valueDelta: number
  currentPace?: number | null
  preseasonValue?: number | null
  confidenceLabel?: "low" | "medium" | "high" | null
  stabilityLabel?: "stable" | "volatile" | "fragile" | null
  reasonCodes: string[]
  modelSummary: string
  contentAngle: string
  doNotSay?: string[]
}

type EditorialGuidance = {
  primaryAngle: string
  headlineOptions: string[]
  seoKeywords: string[]
  recommendedFormats: ("insights_article" | "social_thread" | "newsletter_blurb" | "push_copy")[]
}
```

Example packet:

```json
{
  "briefType": "weekly_risers_fallers",
  "generatedAt": "2026-10-13T09:00:00Z",
  "season": 2026,
  "week": 6,
  "position": "QB",
  "audience": "public",
  "methodologyNote": "Value Score compares a player's fantasy output to a fantasy-relevant positional baseline. Weekly movement adjusts current pace, floor/ceiling, and confidence without automatically overwriting preseason Value.",
  "risers": [
    {
      "playerId": "player_drake_maye",
      "playerName": "Drake Maye",
      "team": "NE",
      "position": "QB",
      "previousGrade": "B",
      "currentGrade": "A",
      "previousValue": 1.05,
      "currentValue": 1.22,
      "valueDelta": 0.17,
      "confidenceLabel": "medium",
      "stabilityLabel": "stable",
      "reasonCodes": ["efficiency_jump", "passing_volume", "rushing_floor"],
      "modelSummary": "Maye's baseline-relative value improved after a strong efficiency week and stable rushing usage.",
      "contentAngle": "Maye is moving from useful streamer into credible weekly starter territory."
    }
  ],
  "fallers": [
    {
      "playerId": "player_tua_tagovailoa",
      "playerName": "Tua Tagovailoa",
      "team": "MIA",
      "position": "QB",
      "previousGrade": "B",
      "currentGrade": "C",
      "previousValue": 1.02,
      "currentValue": 0.84,
      "valueDelta": -0.18,
      "confidenceLabel": "low",
      "stabilityLabel": "fragile",
      "reasonCodes": ["turnover_volatility", "low_floor", "fragile_value"],
      "modelSummary": "Tua's weekly value profile is being dragged down by volatility and reduced floor confidence.",
      "contentAngle": "Tua still has spike-week appeal, but his floor is not stable enough to treat as a set-and-forget QB."
    }
  ],
  "editorialGuidance": {
    "primaryAngle": "Separate stable value from false promise at QB.",
    "headlineOptions": [
      "Week 6 QB Value Risers and Fallers",
      "The QBs Gaining Real Value, and the Ones Losing Trust",
      "Week 6 Fantasy QB Market Report"
    ],
    "seoKeywords": ["fantasy football QB rankings", "QB risers fallers", "fantasy football value score"],
    "recommendedFormats": ["insights_article", "social_thread", "newsletter_blurb"]
  },
  "safetyRules": [
    "Do not claim a player is available on waivers unless waiverStateAvailable is true.",
    "Do not invent injury information.",
    "Do not guarantee future performance.",
    "Explain Value Score as baseline-relative, not raw projection."
  ]
}
```

## Other Content Brief Endpoints

### Player Value Summary

```txt
GET /api/content/briefs/player-value-summary?playerId=...&week=...&season=...
```

Use for individual player articles, Player Tape summaries, or social posts.

Should return:

- preseason value.
- current value pace.
- grade movement.
- floor/ceiling movement.
- stability label.
- reason codes.
- short model summary.
- content-safe do/don't claims.

### ADP Value Edges

```txt
GET /api/content/briefs/adp-value-edges?position=RB&season=2026&limit=10
```

Use for draft content.

Should return:

- player value grade.
- ADP.
- platform rank where available.
- market discount.
- draft stock.
- fragile value flag.
- GM interpretation.

### Fragile Value

```txt
GET /api/content/briefs/fragile-value?position=QB&week=6&limit=10
```

Use for false-promise / volatile player content.

Should return:

- value grade.
- ceiling grade.
- floor grade.
- stability score.
- spike-week dependency.
- injury/role flags.
- Coach trust label.
- GM draft warning.

### Coach Trends

```txt
GET /api/content/briefs/coach-trends?position=WR&week=6&limit=10
```

Use for weekly lineup/start-sit content.

Should return:

- start/sit movement.
- confidence changes.
- matchup changes.
- injury flags.
- usage trends.
- floor/ceiling deltas.

## Supabase Source Tables

Content endpoints should read from computed/internal tables, not raw provider tables where possible.

Expected future sources:

- `players`
- `teams`
- `player_week_values`
- `player_season_values`
- `player_value_predictions`
- `player_value_stability`
- `player_floor_ceiling_adjustments`
- `position_baselines`
- `player_grade_validation_runs`
- `draft_market_snapshots`
- `gm_recommendation_outputs`
- `coach_recommendation_outputs`
- `injury_reports`
- `usage_trends`

## Content Safety Rules

Claude should receive safety rules in every packet.

Required rules:

- Do not say a player is available in a league without real waiver state.
- Do not invent injury status.
- Do not invent news.
- Do not guarantee future performance.
- Do not pretend Value Score is raw projected points.
- Do not mention private user roster data in public content.
- Do not cite internal model confidence as certainty.

## Public Vs Paid Content

Use `audience` to control what the endpoint returns.

### Public

Allowed:

- basic risers/fallers.
- broad grade movement.
- methodology explanations.
- limited player summaries.

Avoid:

- full premium rankings.
- complete value board.
- detailed Coach recommendation logic.
- full GM draft strategy.

### Paid

Allowed:

- deeper reason codes.
- grade movement history.
- fragile value flags.
- more detailed player comparisons.
- premium Coach/GM interpretation.

### Internal

Allowed:

- detailed debug summaries.
- validation notes.
- model caveats.
- fuller reason-code payloads.

## Claude Output Targets

Claude Cowork can generate:

- Insights articles.
- content briefs.
- headline options.
- SEO titles/meta descriptions.
- social posts.
- X/Threads threads.
- newsletter blurbs.
- push notification copy.
- internal editorial notes.

Content should be generated from packet data and model summaries.

## Example Claude Cowork Task

Prompt:

```txt
Use the 949Fantasy content brief endpoint to create 3 QB risers and 3 QB fallers for Week 6. Write an Insights article, 5 headline options, and 3 social posts. Keep the voice analytical and explain Value Score as baseline-relative.
```

Claude Cowork process:

```txt
1. Call /api/content/briefs/weekly-risers-fallers?position=QB&week=6&limit=3
2. Read the returned packet.
3. Draft the requested content.
4. Preserve safety rules.
5. Do not calculate new stats from memory.
```

## Cursor Implementation Checklist

1. Add `CONTENT_BRIEF_API_KEY`.
2. Create content brief route folder(s).
3. Add internal auth helper for content routes.
4. Build first endpoint: `weekly-risers-fallers`.
5. Return mocked packet first if computed tables do not exist.
6. Later wire to Supabase computed tables.
7. Include `methodologyNote`, `editorialGuidance`, and `safetyRules` in response.
8. Keep payload compact.
9. Do not expose user-private data.
10. Document example requests for Claude Cowork.

## V0 Mocking

Before computed tables exist, Cursor can implement route-level mocks that match the final response shape.

This lets Claude/Cowork content flow be tested before the full model pipeline is ready.

Mock data should be clearly marked:

```json
{
  "sourceStatus": "mock"
}
```

Production packets should use:

```json
{
  "sourceStatus": "computed"
}
```

## Non-Negotiables

- Claude does not get unrestricted database access in V1.
- Claude does not calculate Value Score from raw stats.
- Claude does not invent rankings, injuries, or availability.
- Content endpoints return compact model outputs and editorial guidance.
- 949 backend owns the numbers.
- Claude owns wording, packaging, and content formats.
