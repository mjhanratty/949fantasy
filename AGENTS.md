<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Product thesis and vendored briefs (working brief, v1 stack, **page content spec**, draft theory notes, draft market engine), **top-nav IA** (incl. GM / Coach), external metrics glossary: [docs/product-context.md](docs/product-context.md). HTML prototypes: [docs/design-reference.md](docs/design-reference.md). Routes: [docs/ia-routes.md](docs/ia-routes.md). GM: [docs/page-content-spec.md](docs/page-content-spec.md) + [docs/draft-market-engine.md](docs/draft-market-engine.md).

**Local dev:** `npm run dev` uses **Webpack** dev (lighter on low-RAM machines). Use `npm run dev:turbo` for Turbopack. `npm run diag:compile` runs a one-shot production compile check. **`npm run prototype`** serves the vendored v2 HTML/Babel shell at http://localhost:3456 (`prototype/`). If macOS spams `MallocStackLogging`, check for `MallocStackLogging` in your shell env (`unset MallocStackLogging`).
