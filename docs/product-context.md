# 949Fantasy product context (external briefs)

Authoritative briefs live under `/Users/matthewhanratty/Documents/New project/`. Vendored copies in `docs/` — re-sync with the block at the bottom.

| Document | In-repo |
|----------|---------|
| [working-brief.md](./working-brief.md) | Mission, brand, handoff index |
| [workbook-analysis-notes.md](./workbook-analysis-notes.md) | Excel `Fantasy Rankings` formulas, value grades, floor/ceiling audit, rookie model |
| [player-value-modeling.md](./player-value-modeling.md) | Position-agnostic value model, preseason vs pace, fragile value, QB validation slice |
| [v1-stack.md](./v1-stack.md) | Stack, Supabase, providers, schema |
| [vercel-env-plan.md](./vercel-env-plan.md) | **Vercel + `.env.local`** priorities (V0 RapidAPI, feature flags, Supabase) |
| [page-content-spec.md](./page-content-spec.md) | Screens, GM, Coach |
| [cursor-piping-handoff.md](./cursor-piping-handoff.md) | API contracts, franchise modes |
| [games-feed-handoff.md](./games-feed-handoff.md) | Games surface: matchup feed, top players, cache/refresh |
| [coach-gm-cache-weekly-ops.md](./coach-gm-cache-weekly-ops.md) | Coach/GM cache layers, weekly Value Score ops, manual waiver fallback |
| [data-source-matrix.md](./data-source-matrix.md) | V0/V1/V1.1/V2 data sources |
| [metrics-glossary.md](./metrics-glossary.md) | Metric names, formulas |
| [draft-market-engine.md](./draft-market-engine.md) | GM/Coach engine |
| [evaluator-layering-spec.md](./evaluator-layering-spec.md) | Shared GM/Coach evaluator layers, consensus, AI boundaries |
| [draft-theory-source-notes.md](./draft-theory-source-notes.md) | Draft research → lessons |
| [ia-routes.md](./ia-routes.md) | Routes |
| [localhost-rapidapi-notes.md](./localhost-rapidapi-notes.md) | V0 RapidAPI + Sleeper stats hydration |
| [v0-roster-stats-bridge.md](./v0-roster-stats-bridge.md) | Live 2025 points on fixed demo roster personas |
| [design-reference.md](./design-reference.md) | `prototype/` shell |

## Environment & hosting

- **Production:** https://949fantasy.vercel.app — env vars in Vercel **Production** and **Preview** only.
- **Local dev:** copy non-secrets from [vercel-env-plan.md](./vercel-env-plan.md) into **`.env.local`** (gitignored). Do **not** use Vercel Development env (blocked in current project flow).
- **Supabase:** project `vnubuviqqenumpmeitsq` — `DATABASE_URL` = transaction pooler (port **6543**), server-only.
- **V0 data:** `DATA_MODE=v0_rapidapi_manual`, RapidAPI teams + **Sleeper** weekly stats on demo roster (`GET /api/nfl/roster-stats`). Prototype keeps mock player names/ids; see [v0-roster-stats-bridge.md](./v0-roster-stats-bridge.md).

## Who does what

| Owner | Scope |
|-------|--------|
| **Codex** | Logic, metrics, schemas, ingestion, Vercel/Supabase |
| **Cursor** | Next app — [cursor-piping-handoff.md](./cursor-piping-handoff.md) |
| **Claude** | UI exploration |

## Implementation snapshot

- **Franchise modes:** `connected_league` · `manual_draft_room` · `manual_user_roster` · `demo_or_empty`
- **GM / Coach architecture:** [evaluator-layering-spec.md](./evaluator-layering-spec.md) — data → specialist evaluators → consensus → risk → AI explanation (not prompt-only); ops/caching in [coach-gm-cache-weekly-ops.md](./coach-gm-cache-weekly-ops.md)
- **Draft / GM:** board, simulator, 7 bands, ticker, queue, alerts, value grades — see piping handoff + page spec + draft engine
- **Coach:** advisory only; Insights, scenarios, Q&A — no auto lineup submit (lives on Start/Sit per [games-feed-handoff.md](./games-feed-handoff.md))
- **Games:** live matchup context surface — [games-feed-handoff.md](./games-feed-handoff.md) (prototype image only today)
- **Metrics / projections:** [metrics-glossary.md](./metrics-glossary.md); value modeling in [player-value-modeling.md](./player-value-modeling.md); workbook lineage in [workbook-analysis-notes.md](./workbook-analysis-notes.md)

## Sync vendored docs

```bash
DOCS="/Users/matthewhanratty/Documents/New project"
for f in working-brief workbook-analysis-notes player-value-modeling v1-stack vercel-env-plan page-content-spec cursor-piping-handoff coach-gm-cache-weekly-ops games-feed-handoff \
  data-source-matrix metrics-glossary draft-market-engine evaluator-layering-spec draft-theory-source-notes localhost-rapidapi-notes; do
  cp "$DOCS/949fantasy-${f}.md" docs/${f}.md
done
```

After sync, restore the `> **Canonical source:**` header on each file if the copy overwrote it.
