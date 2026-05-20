# 949Fantasy product context (external briefs)

Authoritative product, metrics, and engineering briefs live **outside this repo** on the primary dev machine. Open them when planning features, routes, data models, or integrations.

| Document | Path | In-repo copy |
|----------|------|----------------|
| Working brief | `/Users/matthewhanratty/Documents/New project/949fantasy-working-brief.md` | [working-brief.md](./working-brief.md) |
| V1 stack | `/Users/matthewhanratty/Documents/New project/949fantasy-v1-stack.md` | [v1-stack.md](./v1-stack.md) |
| Page content spec | `/Users/matthewhanratty/Documents/New project/949fantasy-page-content-spec.md` | [page-content-spec.md](./page-content-spec.md) |
| Metrics glossary | `/Users/matthewhanratty/Documents/New project/949fantasy-metrics-glossary.md` | — (external only) |
| Draft market engine | `/Users/matthewhanratty/Documents/New project/949fantasy-draft-market-engine.md` | [draft-market-engine.md](./draft-market-engine.md) |
| Draft theory source notes | `/Users/matthewhanratty/Documents/New project/949fantasy-draft-theory-source-notes.md` | [draft-theory-source-notes.md](./draft-theory-source-notes.md) |

If those paths move, update this file and re-sync the vendored copies.

## In-repo companions

- [page-content-spec.md](./page-content-spec.md) — FigJam → screens; **GM** manual draft board, value bands, **Coach**; flyouts and data deps.
- [working-brief.md](./working-brief.md) — Mission, brand, Codex/Cursor/Claude scope, IA, data gaps.
- [v1-stack.md](./v1-stack.md) — Stack, provider matrix, schema, model outputs, build order.
- [draft-theory-source-notes.md](./draft-theory-source-notes.md) → [draft-market-engine.md](./draft-market-engine.md) — GM scoring + `manual-board` pipeline.
- [ia-routes.md](./ia-routes.md) — Route map.
- [design-reference.md](./design-reference.md) — HTML prototypes.

## GM v1 (page spec + engine)

**Manual-first:** user clicks each drafted player; engine assigns `team_slot` from pick order (snake), no per-pick team picker.

**Surfaces:**

- **Left rail** — value bands: High Steal, Low Steal, Most Likely, Low Reach, High Reach.
- **Main grid** — interactive snake board (rounds × teams), position filters, undo, user column emphasized.
- **Engine** — top-5 picks, survival probability, spend grade, tier cliffs, platform edge ([draft-market-engine](./draft-market-engine.md)).

Planned code: `lib/draft-market/manual-board.ts`, pick-order, scoring, simulation, recommend.

## Navigation

Snapshot · Metrics · Performance · Rankings · Lineup · Games · Players · Draft Data · **GM** · **Coach** · Settings — [ia-routes.md](./ia-routes.md).

## Sync vendored docs

```bash
cp "/Users/matthewhanratty/Documents/New project/949fantasy-working-brief.md" docs/working-brief.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-v1-stack.md" docs/v1-stack.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-page-content-spec.md" docs/page-content-spec.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-draft-market-engine.md" docs/draft-market-engine.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-draft-theory-source-notes.md" docs/draft-theory-source-notes.md
```

Metrics glossary stays external only.
