# Design reference: HTML prototypes

## 1) Bundler export — `949Fantasy.html`

**Path:** `/Users/matthewhanratty/Downloads/949Fantasy.html`

**How to use it:** open in a desktop browser (file:// is fine). After the loader runs, the embedded React app mounts into `#root` for **layout, density, and copy** from that Cursor export.

**Do not commit** the full file (~1.5MB): most of the size is a single-line base64 manifest.

### Readable without JavaScript

1. **Splash SVG**: `viewBox="0 0 1200 800"`, `#050807`, **949** `#95F9AE`, **FANTASY** `#D9FFE4` — matches `app/globals.css`.
2. **Bundler shell** unpacks assets into the template.

### Template vs manifest

| Piece | Role |
|--------|------|
| `__bundler/template` (~line 177) | Small HTML: JetBrains Mono `@font-face`, `<div id="root"></div>`, UUID script tags. No static rankings markup. |
| `__bundler/manifest` (~line 169) | UUID → gzip/base64 **JS bundles** that render the UI. |

**Decode helper:** `scripts/decode-bundler-manifest.mjs` — `npm run decode:bundle -- --list` or `--grep "<text>"` (default file `$HOME/Downloads/949Fantasy.html`; pass another path as the last argument).

---

## 2) Readable v2 shell — `prototype/index.html`

**In-repo path:** [`prototype/index.html`](../prototype/index.html) (vendored from `949fantsyv2.html`).

**Run locally:** `npm run prototype` → http://localhost:3456 (must use HTTP; Babel fetches `src/*.jsx` via XHR).

**Original export:** `/Users/matthewhanratty/Downloads/949fantsyv2.html` (if you saved it as `949fantasyhtmlv2.html`, same artifact).

**What it is:** self-contained HTML/CSS + React/Babel `src/` tree (not the bundler format). Easier to **inspect structure and tokens** in source.

**Notable stack from the file head:** Google Fonts **Sora**, **Space Grotesk**, **JetBrains Mono**; CSS variables (`--black`, `--green-800`, `--mint`, `--mint-soft`, `--slate`, etc.) aligned with the 949 palette.

**IA alignment:** wire view ids and nav to [ia-routes.md](./ia-routes.md) and the page content spec at `Documents/New project/949fantasy-page-content-spec.md`.

---

## Next.js alignment (this repo)

- **Marketing / brand:** surface, mint, white-mint in `app/globals.css`.
- **Typography (Next):** **Sora** as `font-sans` / `.font-display`, **Space Grotesk** as `.font-stat`, **JetBrains Mono** as `font-mono` / `.font-data` — mirrors v2 Google Fonts link.

## Related docs

- **[product-context.md](./product-context.md)** — all external `.md` brief paths + stack notes.
- **[ia-routes.md](./ia-routes.md)** — top nav + HTML `view id` → product surface map.
