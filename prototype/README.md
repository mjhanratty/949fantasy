# 949fantsyv2 static prototype

Readable React/Babel reference implementation (design tokens, nav, mock data, interactions).

## Run locally

From repo root:

```bash
npm run prototype
```

Open http://localhost:3456 — **use HTTP**, not `file://` (Babel loads `src/*.jsx` via XHR).

## Layout

- `index.html` — entry (React 18 + Babel standalone + CDN)
- `src/` — views, mock data, primitives, US map paths

Next.js product routes are ported from these sources under `components/product/` and `lib/mock/`.

**Recent map / analytics updates (prototype-first):**

- Stadium dots use CSV lat/lng projected to SVG `2000×1200` (`prototype/src/data.jsx` → `NFL_CITIES`, `NFL_MAP_MARKERS`).
- Shared venues: MetLife (NYG/NYJ) and LAC/LAR collapse to one dot at the week’s home coords (`WEEK11_HOME_AT_SHARED`).
- **Games** top-nav tab and **Start / Sit** both embed `StadiumMap`.
- Analytics (Snapshot) team points chart SVG height is **390px** (`src/views/dashboard.jsx`).

Hard-refresh the browser after edits (Babel caches fetched `.jsx` in some setups).
