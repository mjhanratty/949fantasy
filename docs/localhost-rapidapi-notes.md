# 949Fantasy Localhost RapidAPI Notes

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-localhost-rapidapi-notes.md`
> **In-repo paths:** `lib/rapidapi.ts`, `app/api/nfl/teams/route.ts`, `app/(dev)/data-lab/page.tsx` (Codex Documents workspace used `src/`).


## Current Status

A minimal Next.js App Router scaffold now exists in this workspace.

Local app URL:

```text
http://127.0.0.1:3000
```

Prototype URL:

```text
http://localhost:3456
```

Implemented / restored:

- Restored v2 prototype entry from `/Users/matthewhanratty/Downloads/949fantsyv2.html` to `prototype/index.html`.
- Restored readable v2 prototype source from `/Users/matthewhanratty/Downloads/949Fantasy (2).zip` to `prototype/src/`.
- Added prototype startup hydration in `prototype/src/data.jsx`:
  - calls `http://127.0.0.1:3000/api/nfl/teams`
  - merges normalized team metadata into the existing `TEAMS` object
  - dispatches `nfl-data-status`
  - falls back to prototype mock data when the API route is unavailable
- Added v2 top-nav data badge in `prototype/src/app.jsx`:
  - `NFL Loading`
  - `NFL Live · {team count}`
  - `NFL Mock`
- Server-only RapidAPI route: `app/api/nfl/teams/route.ts`
- RapidAPI fetch/normalization helper: `lib/rapidapi.ts`

Verified:

- `npm install` completed.
- `npm run typecheck` passed.
- `npm run build` passed.
- V2 prototype returns HTTP 200 locally at `http://localhost:3456`.
- `/api/nfl/teams` is reachable locally.
- `/api/nfl/teams` returns CORS headers for `http://localhost:3456`.
- The v2 prototype no longer uses the temporary `Load Teams` button.

## Current Blocker

The local `.env.local` file was pulled from Vercel Preview, but sensitive values were pulled as empty quoted values.

Observed locally without exposing values:

```text
RAPIDAPI_NFL_API_KEY: empty
NEXT_PUBLIC_SUPABASE_ANON_KEY: empty
SUPABASE_SERVICE_ROLE_KEY: empty
```

Because `RAPIDAPI_NFL_API_KEY` is empty, the server route currently returns:

```json
{
  "ok": false,
  "error": "Missing required environment variable: RAPIDAPI_NFL_API_KEY"
}
```

## Needed Next Step

Add the actual RapidAPI key into `.env.local` locally:

```bash
RAPIDAPI_NFL_API_KEY=your_actual_key_here
```

Do not commit `.env.local`. It is already gitignored.

After changing `.env.local`, restart the Next dev server. Next.js does not reliably reload new server env values without a restart.

The non-secret local defaults are already present:

```bash
RAPIDAPI_NFL_API_HOST=nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_API_BASE_URL=https://nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_TEAMS_ENDPOINT=/nfl-team-listing/v1/data
NEXT_PUBLIC_SUPABASE_URL=https://vnubuviqqenumpmeitsq.supabase.co
```

## Test Flow

After the local key is added:

1. Start the Next API server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

2. Start the v2 prototype:

```bash
npm run prototype
```

3. Test the API route:

```bash
curl http://127.0.0.1:3000/api/nfl/teams
```

Expected shape:

```json
{
  "ok": true,
  "status": 200,
  "teams": [],
  "provider": "rapidapi_nfl_api_data"
}
```

4. Open the v2 prototype:

```text
http://localhost:3456
```

5. Hard-refresh the browser if needed.

Expected prototype result:

```text
NFL Live · {team count}
```

## Implementation Notes

The browser never calls RapidAPI directly.

Correct flow:

```text
Prototype browser on :3456 -> Next API on :3000 -> RapidAPI -> normalized team JSON -> Prototype
```

This keeps `RAPIDAPI_NFL_API_KEY` server-only.

The normalization helper accepts several possible response shapes because the exact RapidAPI response envelope may vary. Once the first live response succeeds, tighten the normalizer to the actual provider payload.
