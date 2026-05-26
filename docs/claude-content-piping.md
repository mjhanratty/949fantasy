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
-> content_drafts rows with status = needs_review
-> review queue
-> approved content
-> posting queue
```

Claude should call internal 949 endpoints that return safe, compact JSON.

Claude Cowork should be treated as a scheduled content-production assistant, not as the final publisher.

Recommended operating rule:

```txt
Claude Cowork can create.
Claude Cowork can suggest.
Claude Cowork can summarize.
Claude Cowork cannot publish without approval.
```

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
- Proj (Total).
- ADP.
- platform rank where available.
- market discount.
- SOS.
- boom probability.
- bust probability.
- neutral / expected probability.
- YOY trend.
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

## Content Ops Pipeline

Recommended production pipeline:

```txt
Database
-> scheduled Claude job
-> content_drafts table
-> review queue
-> approved content
-> posting_queue
-> platform publisher
-> performance tracking
```

Separate draft creation from posting.

### Worker 1: Content Generator

Runs on schedule.

Input:

- computed player values.
- risers/fallers.
- injuries/news.
- usage trends.
- draft/ADP movement.
- Coach/GM reason-code summaries.

Output:

```txt
content_drafts.status = "needs_review"
```

### Worker 2: Publisher

Runs every 15-30 minutes.

Input:

```txt
approved content
```

Output:

```txt
posted | failed
```

Do not let the same job create and publish content.

## Content Drafts Table

Create a table similar to:

```sql
create table public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  platform text not null,
  title text,
  body text not null,
  player_ids uuid[] default '{}',
  source_data_snapshot jsonb not null,
  model_used text,
  confidence_score numeric,
  status text not null default 'needs_review',
  scheduled_for timestamptz,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  approved_by uuid,
  posted_at timestamptz
);
```

Recommended statuses:

- `draft`
- `needs_review`
- `approved`
- `rejected`
- `scheduled`
- `posted`
- `failed`

Claude Cowork should only create drafts with:

```txt
status = "needs_review"
```

## Posting Queue Table

Create a separate posting queue after approval:

```sql
create table public.posting_queue (
  id uuid primary key default gen_random_uuid(),
  content_draft_id uuid references public.content_drafts(id),
  platform text not null,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled',
  attempt_count integer not null default 0,
  last_error text,
  posted_url text,
  created_at timestamptz default now(),
  posted_at timestamptz
);
```

Only approved content should enter this table.

## Admin Review Page

Create an internal review surface:

```txt
/admin/content-review
```

Each draft should show:

- platform.
- content type.
- generated headline.
- post copy.
- players referenced.
- stats used.
- confidence score.
- source snapshot.
- model summary.
- approve / edit / reject controls.

Every Claude-generated claim should be reviewable against the underlying database inputs.

Example:

Claim:

```txt
Player X is trending up after three straight weeks of target growth.
```

Review evidence:

```txt
Week 1 targets: 5
Week 2 targets: 7
Week 3 targets: 9
Trend flag: positive
```

The admin is reviewing Claude's interpretation of 949 data, not ungrounded prose.

## Suggested Content Cadence

Fantasy season cadence:

| Time | Content Job |
|---|---|
| Monday night | Recalculate value scores after full week |
| Tuesday morning | Waiver and trend content |
| Wednesday morning | Ranking movement and matchup content |
| Thursday morning | Start/sit and Thursday Night Football content |
| Friday morning | Injury-impact content |
| Sunday morning | Last-minute start/sit alerts |
| Sunday night | Recap notes, not full ranking reset |

Monday night should remain the big value-score sync.

## Review Layers

Review every draft in three layers:

### 1. Data Check

Does the claim match the database?

Example:

```txt
Claim: Player is rising.
Check: value_score_delta > 0, usage_delta > 0, rank_change positive.
```

### 2. Brand Check

Good:

- clear.
- sharp.
- confident.
- data-backed.
- premium.
- clean.

Avoid:

- hypey.
- gambling-coded.
- sportsbook-coded.
- bro-sports tone.
- overpromising.

### 3. Publishing Check

Match format to platform:

- X: short and punchy.
- Threads: slightly more explanatory.
- Instagram: visual/carousel-friendly.
- Insights: longer analysis.
- Email: concise weekly digest.

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
11. Add `content_drafts` table.
12. Add `/admin/content-review`.
13. Add approve / reject / edit actions.
14. Add `posting_queue` table after review flow works.
15. Add publisher worker only after approval flow is proven.

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
- Claude Cowork does not publish without approval.

## SVG Asset Library And Visual Drafts

Claude should not invent brand visuals from scratch.

Use an approved SVG asset library plus metadata table.

Recommended visual flow:

```txt
SVG Asset Library
-> Supabase Storage
-> svg_assets metadata table
-> Claude visual draft selection
-> visual_drafts table
-> rendered preview
-> human review
-> approved export/post
```

Claude should be an assembler, not the designer.

### Supabase Storage Bucket

Create a bucket:

```txt
svg-assets
```

Recommended folder structure:

```txt
svg-assets/
  brand/
    logo-949-stacked.svg
    logo-949-wordmark.svg
  icons/
    trend-up.svg
    trend-down.svg
    waiver-wire.svg
    injury-alert.svg
    lock-premium.svg
  badges/
    value-a-plus.svg
    value-a.svg
    value-b.svg
    value-c.svg
    value-d.svg
    value-f.svg
  positions/
    qb.svg
    rb.svg
    wr.svg
    te.svg
  templates/
    weekly-riser-card.svg
    weekly-faller-card.svg
    top-10-rankings-card.svg
    waiver-watch-card.svg
    start-sit-card.svg
    injury-impact-card.svg
    value-score-card.svg
    player-comparison-card.svg
    premium-preview-card.svg
    weekly-recap-card.svg
  backgrounds/
    mint-grid.svg
    deep-green-noise.svg
    chart-grid.svg
```

Do not store copyrighted NFL logos, team logos, or player likenesses unless rights are secured.

### SVG Assets Table

```sql
create table public.svg_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,
  description text,
  storage_path text not null,
  public_url text,
  tags text[] default '{}',
  allowed_platforms text[] default '{}',
  color_mode text default 'brand',
  aspect_ratio text,
  width integer,
  height integer,
  is_template boolean default false,
  is_active boolean default true,
  brand_safe boolean default true,
  usage_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Example row:

```txt
name: Weekly Riser Card
slug: weekly-riser-card
category: templates
description: Social card template for players moving up in weekly value score.
storage_path: templates/weekly-riser-card.svg
tags: ["weekly", "riser", "value_score", "social", "x", "instagram"]
allowed_platforms: ["x", "threads", "instagram", "insights"]
aspect_ratio: "1:1"
is_template: true
brand_safe: true
usage_notes: Use for players with positive value_score_delta and rank improvement.
```

### SVG Template Variables

Use placeholders inside SVG templates:

```svg
<text id="player_name">{{PLAYER_NAME}}</text>
<text id="position">{{POSITION}}</text>
<text id="value_score">{{VALUE_SCORE}}</text>
<text id="rank_change">{{RANK_CHANGE}}</text>
<text id="headline">{{HEADLINE}}</text>
```

Claude should return structured variables. The system should replace placeholders programmatically.

Example:

```json
{
  "template_slug": "weekly-riser-card",
  "variables": {
    "PLAYER_NAME": "Davante Adams",
    "POSITION": "WR",
    "VALUE_SCORE": "1.21",
    "RANK_CHANGE": "+6",
    "HEADLINE": "Trending Up"
  }
}
```

### Visual Drafts Table

```sql
create table public.visual_drafts (
  id uuid primary key default gen_random_uuid(),
  content_draft_id uuid references public.content_drafts(id),
  template_slug text not null,
  asset_slugs text[] default '{}',
  variables jsonb not null,
  rendered_svg_path text,
  rendered_png_path text,
  status text default 'needs_review',
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
```

Recommended statuses:

- `needs_review`
- `approved`
- `rejected`
- `needs_revision`
- `rendered`
- `posted`

### Visual Review Page

Create:

```txt
/admin/visual-review
```

Each visual draft should show:

- template used.
- assets used.
- rendered preview.
- player/stat inputs.
- Claude reasoning.
- approve / edit variables / reject / regenerate controls.

### Visual Safety Rules

Enforce:

- No NFL team logos without rights.
- No player photos without rights.
- No sportsbook-style graphics.
- No betting language.
- No fake injury claims.
- No guaranteed-outcome language.
- No unapproved colors.
- No SVG scripts.
- No external image hrefs inside SVGs.

SVGs must be sanitized before rendering.

Strip:

```txt
<script>
onload=
onclick=
foreignObject
external hrefs
remote image links
```

### Minimum Viable Visual Library

Start with:

- 10 templates.
- 20 icons/badges.
- 1 Supabase Storage bucket.
- `svg_assets` table.
- `visual_drafts` table.
- one Claude visual-selection prompt.
- one review page.
