<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Product briefs and **Cursor piping handoff** (API contracts, franchise modes, fallbacks): [docs/product-context.md](docs/product-context.md). **Start here for implementation wiring:** [docs/cursor-piping-handoff.md](docs/cursor-piping-handoff.md). Routes: [docs/ia-routes.md](docs/ia-routes.md). Prototype: [docs/design-reference.md](docs/design-reference.md).

**Local dev:** `npm run dev` uses **Webpack** dev (lighter on low-RAM machines). Use `npm run dev:turbo` for Turbopack. `npm run diag:compile` runs a one-shot production compile check. **`npm run prototype`** serves the vendored v2 HTML/Babel shell at http://localhost:3456 (`prototype/`). If macOS spams `MallocStackLogging`, check for `MallocStackLogging` in your shell env (`unset MallocStackLogging`).
