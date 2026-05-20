# 949Fantasy product context (external briefs)

Authoritative product, metrics, and engineering briefs live **outside this repo** on the primary dev machine. Open them when planning features, routes, data models, or integrations.

| Document | Path | In-repo copy |
|----------|------|----------------|
| Working brief | `/Users/matthewhanratty/Documents/New project/949fantasy-working-brief.md` | [working-brief.md](./working-brief.md) |
| V1 stack | `/Users/matthewhanratty/Documents/New project/949fantasy-v1-stack.md` | [v1-stack.md](./v1-stack.md) |
| Page content spec | `/Users/matthewhanratty/Documents/New project/949fantasy-page-content-spec.md` | — (external only) |
| Metrics glossary | `/Users/matthewhanratty/Documents/New project/949fantasy-metrics-glossary.md` | — (external only) |
| Draft market engine | `/Users/matthewhanratty/Documents/New project/949fantasy-draft-market-engine.md` | [draft-market-engine.md](./draft-market-engine.md) |
| **Draft theory source notes** | `/Users/matthewhanratty/Documents/New project/949fantasy-draft-theory-source-notes.md` | [draft-theory-source-notes.md](./draft-theory-source-notes.md) |

If those paths move, update this file and re-sync the vendored copies.

## In-repo companions

- [working-brief.md](./working-brief.md) — Mission, brand, pillars, handoff doc index (incl. draft theory notes), IA, data gaps.
- [v1-stack.md](./v1-stack.md) — Stack, provider matrix, DB tables (`draft_source_reliability`, …), model outputs.
- [draft-theory-source-notes.md](./draft-theory-source-notes.md) — **15 structured lessons** from draft articles/research → GM rules, engine components, build order.
- [draft-market-engine.md](./draft-market-engine.md) — GM/Coach pipeline (pairs with source notes); `snake_value`, tier drop-off, position-specific reliability/upside.
- [design-reference.md](./design-reference.md) — HTML prototypes, tokens.
- [ia-routes.md](./ia-routes.md) — Top-nav IA + routes.
- [../AGENTS.md](../AGENTS.md) — Next.js guardrails.

## Draft / GM doc chain

```txt
draft-theory-source-notes.md  →  lessons + source table + GM agent rules
         ↓
draft-market-engine.md        →  scoring, simulation, DB, API JSON, AI boundary
         ↓
metrics-glossary.md           →  snake_value, tier_dropoff_slope, source_reliability_score, …
         ↓
lib/draft-market/*            →  implementation (planned)
```

Populate `draft_theory_lessons` from source notes; use `source_confidence` when access was partial (see source notes access table).

## Stack snapshot (v1 stack)

| Layer | Tool |
|-------|------|
| Frontend | Next.js App Router |
| Hosting | Vercel Pro |
| DB / Auth | Supabase Postgres + Auth |
| Payments | Stripe (`$9.49` season pass) |
| Primary NFL data | **SportsDataIO** |
| League import | **Sleeper** first; Yahoo second |
| Consensus / ADP | FantasyPros if licensed; **platform-specific ADP** required for GM (ESPN, Sleeper, Yahoo, CBS, …) |
| AI | OpenAI — explanations only |
| Cache | Redis/KV — draft state, computed GM outputs |

**Prototype data:** RapidAPI via `DataProvider` adapter only; never from React directly.

## GM metrics (glossary + engine — recent)

Beyond `draft_score` / VONA / `platform_edge`:

- `snake_value` — baseline + weighted opportunity cost (snake drafts).
- `smoothed_next_available_value` — pick-window smoothing, not single ADP cutoff.
- `tier_dropoff_slope` — scarcity as value drop-off, not player count.
- `source_reliability_score` — position-specific projection vs ADP weights (backtested).
- `platform_visibility_score` — room-visible rank vs 949 value.
- `draft_source_reliability` table (stack) for calibration storage.

## League provider matrix

Sleeper (5, green) → Yahoo (4, yellow) → ESPN/CBS/NFL Fantasy deferred. See [v1-stack.md](./v1-stack.md).

## Build order

1. App shell + snapshot/metrics/performance/rankings/player/tape/lineup/games.
2. Stripe + ingestion.
3. **Platform-aware ADP** → pick order → VORP/VOLS → VONA simulation → snake value → tier slope → spend grade → roster guardrails → position upside ([draft-theory-source-notes](./draft-theory-source-notes.md) § Recommended First Build Order).
4. GM API JSON, then AI explanation layer.

## Navigation

Snapshot · Metrics · Performance · Rankings · Lineup · Games · Players · Draft Data · **GM** · **Coach** · Settings — [ia-routes.md](./ia-routes.md).

## Sync vendored docs

```bash
cp "/Users/matthewhanratty/Documents/New project/949fantasy-working-brief.md" docs/working-brief.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-v1-stack.md" docs/v1-stack.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-draft-market-engine.md" docs/draft-market-engine.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-draft-theory-source-notes.md" docs/draft-theory-source-notes.md
```

Metrics glossary and page content spec stay external; sync path only in the table above.
