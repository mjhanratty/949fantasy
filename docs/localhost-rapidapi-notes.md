# 949Fantasy Localhost RapidAPI Notes

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-localhost-rapidapi-notes.md`
> **In-repo paths:** `lib/rapidapi.ts`, `app/api/nfl/teams/route.ts`, `app/(dev)/data-lab/page.tsx` (Codex Documents workspace used `src/`).


## Current Status

A minimal Next.js App Router scaffold now exists in this workspace.

Local app URL:

```text
http://127.0.0.1:3000
```

Implemented (this repo):

- Data lab page: `app/(dev)/data-lab/page.tsx` → http://127.0.0.1:3000/data-lab
- Client test panel: `components/dev/nfl-data-test.tsx`
- Server-only RapidAPI route: `app/api/nfl/teams/route.ts`
- RapidAPI fetch/normalization helper: `lib/rapidapi.ts`

Verified:

- `npm install` completed.
- `npm run typecheck` passed.
- `npm run build` passed.
- Home page returns HTTP 200 locally.
- `/api/nfl/teams` is reachable locally.

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

The non-secret local defaults are already present:

```bash
RAPIDAPI_NFL_API_HOST=nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_API_BASE_URL=https://nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_TEAMS_ENDPOINT=/nfl-team-listing/v1/data
NEXT_PUBLIC_SUPABASE_URL=https://vnubuviqqenumpmeitsq.supabase.co
```

## Test Flow

After the local key is added:

1. Start the app:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

2. Test the API route:

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

3. Open the test page:

```text
http://127.0.0.1:3000/data-lab
```

4. Click `Load Teams`.

## Implementation Notes

The browser never calls RapidAPI directly.

Correct flow:

```text
Browser -> /api/nfl/teams -> RapidAPI -> normalized team JSON -> Browser
```

This keeps `RAPIDAPI_NFL_API_KEY` server-only.

The normalization helper accepts several possible response shapes because the exact RapidAPI response envelope may vary. Once the first live response succeeds, tighten the normalizer to the actual provider payload.
