# 949Fantasy product context (external briefs)

Authoritative product, metrics, and engineering briefs live **outside this repo** on the primary dev machine.

| Document | Path | In-repo copy |
|----------|------|----------------|
| Working brief | `…/949fantasy-working-brief.md` | [working-brief.md](./working-brief.md) |
| **Cursor piping handoff** | `…/949fantasy-cursor-piping-handoff.md` | [cursor-piping-handoff.md](./cursor-piping-handoff.md) |
| V1 stack | `…/949fantasy-v1-stack.md` | [v1-stack.md](./v1-stack.md) |
| Page content spec | `…/949fantasy-page-content-spec.md` | [page-content-spec.md](./page-content-spec.md) |
| Metrics glossary | `…/949fantasy-metrics-glossary.md` | — (external) |
| Draft market engine | `…/949fantasy-draft-market-engine.md` | [draft-market-engine.md](./draft-market-engine.md) |
| Draft theory source notes | `…/949fantasy-draft-theory-source-notes.md` | [draft-theory-source-notes.md](./draft-theory-source-notes.md) |

Base path: `/Users/matthewhanratty/Documents/New project/`

## Who does what

| Owner | Scope |
|-------|--------|
| **Codex** | Product logic, metrics, schemas, provider strategy, Supabase/Vercel data |
| **Cursor** | App build — wire views to typed APIs per [cursor-piping-handoff.md](./cursor-piping-handoff.md) |
| **Claude** | Visual/UI exploration |

## Cursor implementation (piping handoff)

**Replace** prototype `window.*` mocks with franchise-scoped API contracts.

**Global:** franchise/team selector + setup questionnaire; data modes: `connected_league` · `manual_draft_room` · `manual_user_roster` · `demo_or_empty`; tier 1–3 benchmark fallback when league/opponent data missing.

**Draft tab** (new): Draft Rankings · Draft Board · Draft Score · GM · Simulator — see handoff § Draft Tab Piping.

**GM sidebar bands (7):** High Steal · Mid Steal · Low Steal · Expected · Low Reach · Mid Reach · High Reach.

**Coach:** on Start/Sit — `POST /api/coach/insight`, `POST /api/coach/question`; structured outputs only.

**Non-negotiable:** no provider calls from React; dynamic roster slots; manual draft board + manual roster upload are first-class fallbacks.

Full route list and TypeScript shapes: [cursor-piping-handoff.md](./cursor-piping-handoff.md).

## Related specs

- Screens / GM UI: [page-content-spec.md](./page-content-spec.md)
- Engine math: [draft-market-engine.md](./draft-market-engine.md)
- Routes map: [ia-routes.md](./ia-routes.md)
- Prototype source: [design-reference.md](./design-reference.md) → `prototype/src/`

## Sync vendored docs

```bash
cp "/Users/matthewhanratty/Documents/New project/949fantasy-working-brief.md" docs/working-brief.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-cursor-piping-handoff.md" docs/cursor-piping-handoff.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-v1-stack.md" docs/v1-stack.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-page-content-spec.md" docs/page-content-spec.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-draft-market-engine.md" docs/draft-market-engine.md
cp "/Users/matthewhanratty/Documents/New project/949fantasy-draft-theory-source-notes.md" docs/draft-theory-source-notes.md
```
