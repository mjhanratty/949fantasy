# 949Fantasy Vercel Environment Plan

> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-vercel-env-plan.md`
> **Secrets:** use `.env.local` locally (not Vercel Development env). Never commit `.env.local` or API keys.


## Purpose

This document defines the environment variables 949Fantasy should add to Vercel in priority order.

Current Vercel target:

| Field | Value |
|---|---|
| Team | `TRI-TWO's projects` |
| Team ID | `team_bP9m6LUc0AUqp35NMZsVAWgb` |
| Project | `949fantasy` |
| Project ID | `prj_85Z7uujufU2oaofg2cT2FcUrVAXK` |
| Framework | `nextjs` |
| Current production URL | `https://949fantasy.vercel.app` |

## Setup Rule

Add variables in this order:

1. V0 non-secret app/data configuration.
2. Supabase once the database project exists.
3. Free NFL test source configuration.
4. OpenAI only when Coach/GM explanation endpoints are ready.
5. SportsDataIO/Yahoo/Sleeper production integrations.
6. Payments/analytics/observability.

Do not put secrets in `NEXT_PUBLIC_*` variables.

## Environment Scope Rule

Vercel is currently blocking new Development environment variables in this project flow, including `NEXT_PUBLIC_*` values.

Use this split:

| Environment | Where values live |
|---|---|
| Production | Vercel environment variables |
| Preview | Vercel environment variables |
| Local development | `.env.local` in the app repo |

Do not rely on Vercel Development environment variables. Cursor/local Next.js should use `.env.local` for development values and secrets.

## Priority 1: V0 App Configuration

These are safe non-secret values needed immediately. Add to Vercel Production/Preview for hosted deployments and to `.env.local` for local development.

| Variable | Scope | Value | Notes |
|---|---|---|---|
| `APP_ENV` | Production, Preview, local `.env.local` | `v0` | Internal environment label. |
| `NEXT_PUBLIC_APP_NAME` | Production, Preview, local `.env.local` | `949Fantasy` | Browser-safe display config. |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://949fantasy.vercel.app` | Update after Squarespace/domain decision. |
| `NEXT_PUBLIC_MARKETING_SITE_URL` | Production, Preview, local `.env.local` | TBD | Squarespace URL/domain once purchased. |
| `NEXT_PUBLIC_PRODUCT_MODE` | Production, Preview, local `.env.local` | `test` | Lets UI show test/beta state if needed. |
| `DATA_MODE` | Production, Preview, local `.env.local` | `v0_free_nfl_manual` | Server-side mode flag. |
| `FEATURE_MANUAL_DRAFT_ROOM` | Production, Preview, local `.env.local` | `true` | GM live draft board. |
| `FEATURE_DRAFT_SIMULATOR` | Production, Preview, local `.env.local` | `true` | Draft simulator mode. |
| `FEATURE_COACH_INSIGHTS` | Production, Preview, local `.env.local` | `true` | Coach insight button. |
| `FEATURE_LEAGUE_SYNC` | Production, Preview, local `.env.local` | `false` | Keep false until Yahoo/Sleeper are wired. |
| `FEATURE_PAYWALL` | Production, Preview, local `.env.local` | `false` | Keep false until Stripe is configured. |

## Priority 2: V0 Free NFL Test Data

For today's testing, use public/free sources first so we can validate data flow before paid providers.

Recommended V0 provider stack:

| Data Need | V0 Source | Env Variable |
|---|---|---|
| NFL team/player/schedule test data | RapidAPI NFL API Data | `RAPIDAPI_NFL_API_*` |
| NFL player pool / fantasy player IDs fallback | Sleeper public API | `SLEEPER_API_BASE_URL` |
| Platform rankings | Manual import first | `PLATFORM_RANKINGS_SOURCE` |
| 949 rankings/projections | Internal seed tables | no external secret |

Variables:

| Variable | Scope | Value | Notes |
|---|---|---|---|
| `FREE_NFL_DATA_PROVIDER` | Production, Preview, local `.env.local` | `rapidapi_nfl_api_data` | V0 test provider from RapidAPI. |
| `RAPIDAPI_NFL_API_HOST` | Production, Preview, local `.env.local` | `nfl-api-data.p.rapidapi.com` | RapidAPI host header. |
| `RAPIDAPI_NFL_API_BASE_URL` | Production, Preview, local `.env.local` | `https://nfl-api-data.p.rapidapi.com` | RapidAPI base URL. |
| `RAPIDAPI_NFL_API_KEY` | Production, Preview, local `.env.local` | secret | Server-only. Rotate if exposed in screenshots. |
| `RAPIDAPI_NFL_TEAMS_ENDPOINT` | Production, Preview, local `.env.local` | `/nfl-team-listing/v1/data` | Test endpoint shown in RapidAPI UI. |
| `SLEEPER_API_BASE_URL` | Production, Preview, local `.env.local` | `https://api.sleeper.app/v1` | Public Sleeper API base. |
| `PLATFORM_RANKINGS_SOURCE` | Production, Preview, local `.env.local` | `manual_import` | ESPN top 300 and other rankings start as imports. |
| `DEFAULT_SCORING_FORMAT` | Production, Preview, local `.env.local` | `ppr` | Default only; franchise settings override. |
| `DEFAULT_LEAGUE_SIZE` | Production, Preview, local `.env.local` | `12` | Default only; franchise settings override. |

## Priority 3: Supabase

Add after the Supabase project is created.

Current Supabase project:

| Field | Value |
|---|---|
| Project ref | `vnubuviqqenumpmeitsq` |
| Dashboard | `https://supabase.com/dashboard/project/vnubuviqqenumpmeitsq/database/tables` |
| Project URL | `https://vnubuviqqenumpmeitsq.supabase.co` |

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, local `.env.local` | No | `https://vnubuviqqenumpmeitsq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, local `.env.local` | No | Browser-safe anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, local `.env.local` | Yes | Server-only. Never expose to client. |
| `DATABASE_URL` | Production, Preview, local `.env.local` | Yes | Use the Supabase transaction pooler connection string for Vercel/serverless. |

Supabase values still needed from dashboard:

```txt
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

Dashboard path:

```txt
Supabase -> Project Settings -> API
```

For `DATABASE_URL`, use:

```txt
Supabase -> Connect -> transaction mode
```

Project transaction-mode connect page:

```txt
https://supabase.com/dashboard/project/vnubuviqqenumpmeitsq?showConnect=true&method=transaction
```

Use the transaction pooler connection string, which should use port `6543`.

Do not use session mode for Vercel/serverless. Session mode is for longer-lived/persistent clients and some IPv4 compatibility cases. Keep `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` server-only.

## Priority 4: Coach / GM Explanation Layer

Add only when routes exist.

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `OPENAI_API_KEY` | Production, Preview, Development | Yes | Server-side Coach/GM explanations. |
| `OPENAI_MODEL_COACH` | Production, Preview, Development | No | Suggested value later. |
| `OPENAI_MODEL_GM` | Production, Preview, Development | No | Suggested value later. |

Coach and GM should still rely on deterministic 949 model outputs. OpenAI explains, compares, and summarizes.

## Priority 5: V1 Production Football / League Sources

Add when provider accounts are ready.

### SportsDataIO

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `SPORTSDATAIO_API_KEY` | Production, Preview, Development | Yes | Primary production NFL data. |
| `SPORTSDATAIO_BASE_URL` | Production, Preview, Development | No | Provider base URL. |

### Yahoo Fantasy

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `YAHOO_CLIENT_ID` | Production, Preview, Development | Yes | OAuth app client id. |
| `YAHOO_CLIENT_SECRET` | Production, Preview, Development | Yes | OAuth app secret. |
| `YAHOO_REDIRECT_URI` | Production, Preview, Development | No | Must match Yahoo app config. |

### Sleeper

Sleeper public endpoints do not require a key for the expected V0/V1 use cases.

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `SLEEPER_API_BASE_URL` | Production, Preview, Development | No | Already included in V0. |

### ESPN Rankings / Later ESPN Sync

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `ESPN_RANKINGS_SOURCE` | Production, Preview, Development | No | `manual_import` for V1. |
| `ESPN_INTEGRATION_ENABLED` | Production, Preview, Development | No | `false` until V2. |

## Priority 6: Weather / News / Analytics / Payments

Add later.

| Variable | Scope | Secret? | Notes |
|---|---|---:|---|
| `WEATHER_API_KEY` | Production, Preview, Development | Yes | Only if SportsDataIO weather is insufficient. |
| `WEATHER_API_BASE_URL` | Production, Preview, Development | No | Provider-specific. |
| `POSTHOG_KEY` | Production, Preview, Development | No/Yes | Depends on client/server usage. |
| `SENTRY_DSN` | Production, Preview, Development | No | Browser-safe DSN if client-side. |
| `STRIPE_SECRET_KEY` | Production, Preview, Development | Yes | Server-only. |
| `STRIPE_WEBHOOK_SECRET` | Production, Preview, Development | Yes | Server-only. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production, Preview, Development | No | Browser-safe. |

Stripe will be the payment provider for 949Fantasy. Keep `FEATURE_PAYWALL=false` until Stripe checkout, webhook handling, and entitlement records are wired.

## First Env Add Batch

Add these first to Vercel:

```txt
APP_ENV=v0
NEXT_PUBLIC_APP_NAME=949Fantasy
NEXT_PUBLIC_SITE_URL=https://949fantasy.vercel.app
NEXT_PUBLIC_MARKETING_SITE_URL=
NEXT_PUBLIC_PRODUCT_MODE=test
DATA_MODE=v0_free_nfl_manual
FEATURE_MANUAL_DRAFT_ROOM=true
FEATURE_DRAFT_SIMULATOR=true
FEATURE_COACH_INSIGHTS=true
FEATURE_LEAGUE_SYNC=false
FEATURE_PAYWALL=false
FREE_NFL_DATA_PROVIDER=rapidapi_nfl_api_data
RAPIDAPI_NFL_API_HOST=nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_API_BASE_URL=https://nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_TEAMS_ENDPOINT=/nfl-team-listing/v1/data
SLEEPER_API_BASE_URL=https://api.sleeper.app/v1
PLATFORM_RANKINGS_SOURCE=manual_import
DEFAULT_SCORING_FORMAT=ppr
DEFAULT_LEAGUE_SIZE=12
ESPN_RANKINGS_SOURCE=manual_import
ESPN_INTEGRATION_ENABLED=false
```

Current status as of May 21, 2026:

| Scope | Status |
|---|---|
| Production | Added |
| Development | Do not use Vercel env; use local `.env.local` |
| Preview | Pending |

RapidAPI update status as of May 21, 2026:

| Scope | Status |
|---|---|
| Production | Non-secret RapidAPI config added |
| Development | Do not use Vercel env; use local `.env.local` |
| Preview | Pending |
| Secret key | Pending secure add after key rotation |

Production and Development now use:

```txt
DATA_MODE=v0_rapidapi_manual
FREE_NFL_DATA_PROVIDER=rapidapi_nfl_api_data
RAPIDAPI_NFL_API_HOST=nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_API_BASE_URL=https://nfl-api-data.p.rapidapi.com
RAPIDAPI_NFL_TEAMS_ENDPOINT=/nfl-team-listing/v1/data
```

Still needed:

```txt
RAPIDAPI_NFL_API_KEY
```

Because the key was visible in a screenshot, rotate it in RapidAPI before adding it to Vercel.

Preview requires one of:

```bash
vercel env add VARIABLE_NAME preview --value "value" --yes
```

or manual dashboard entry for all Preview branches.

The local folder has been linked to Vercel project `949fantasy`. Vercel created `.vercel/project.json` and added `.vercel` to `.gitignore`; do not commit `.vercel`.

Supabase status as of May 21, 2026:

| Variable | Production | Development | Preview |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Added | Use `.env.local` | Pending |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Added | Use `.env.local` | Added |
| `SUPABASE_SERVICE_ROLE_KEY` | Added | Use `.env.local` | Added |
| `DATABASE_URL` | Pending value | Use `.env.local` | Pending |

Current Supabase mismatch to resolve:

- Development should be ignored for Vercel env purposes. Use local `.env.local`.
- Preview has `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`, but is missing `NEXT_PUBLIC_SUPABASE_URL`.
- `DATABASE_URL` is still missing in hosted scopes. Use the Supabase transaction pooler URL on port `6543`.

RapidAPI secret status from Vercel verification:

| Variable | Production | Development | Preview | Note |
|---|---|---|---|---|
| `RAPIDAPI_NFL_API_KEY` | Present | Use `.env.local` | Present | Confirm/rotate because a key appeared in a screenshot. I did not add this key. |

Current mismatch to resolve:

- Preview has `RAPIDAPI_NFL_API_KEY`, but most non-secret V0/RapidAPI config is only in Production and Development.
- Development should use local `.env.local` for RapidAPI config and key.
- Production has both non-secret RapidAPI config and `RAPIDAPI_NFL_API_KEY`.

## Vercel Dashboard Path

If using the dashboard:

```txt
Vercel -> TRI-TWO's projects -> 949fantasy -> Settings -> Environment Variables
```

Add the first batch to:

- Production
- Preview

For local development, place the values in `.env.local`. Do not rely on Vercel Development env vars.

## CLI Path

The local workspace currently does not have the Vercel CLI installed.

Once CLI is available and the app repo is present:

```bash
vercel link --yes --project 949fantasy --scope tri-twos-projects
vercel env pull .env.local --yes
```

For new variables:

```bash
printf "value" | vercel env add VARIABLE_NAME production preview development
```

Use dashboard entry for secret values unless scripting is safer.
