## Why

SitePing is a self-hosted feedback widget, but deploying it requires manual infrastructure setup. Railway provides one-click deploys with managed PostgreSQL, but the repo lacks the configuration (Docker, Railway template, Prisma DB setup) needed to leverage it. This change makes SitePing deployable on Railway in a single click, with an optional template for teams that want the full stack (app + DB).

## What Changes

- Add `railway.json` config-as-code for the deployable demo service
- Update Dockerfile to support Railway's Dockerfile path config (already compatible, but add `RAILWAY_DOCKERFILE_PATH` documentation)
- Add healthcheck endpoint to the Next.js API for Railway's health monitoring
- Create Prisma schema setup for Railway PostgreSQL (via `@siteping/cli init` or manual)
- Add `DATABASE_URL` and `SITEPING_API_KEY` env var configuration
- Add Prisma migration as a pre-deploy command
- Add "Deploy on Railway" button and deployment instructions to README
- Update `.env.example` with Railway-appropriate defaults
- Create Railway template configuration (dashboard-side, documented)

## Capabilities

### New Capabilities
- `railway-deployment`: Railway deployment configuration — Docker, railpack, env vars, healthchecks, and template setup for the demo app
- `prisma-database`: PostgreSQL database provisioning via Railway, Prisma schema management, migrations, and connection configuration

### Modified Capabilities

<!-- No existing specs to modify -- first capabilities for this project. -->

## Impact

- **Dockerfile**: Will be used as-is from `apps/demo/Dockerfile`; may add optimization (caching layers)
- **Next.js config**: Already has `output: "standalone"` — no changes needed
- **Prisma schema**: Already provided by `@siteping/cli init` — needs migration setup
- **Environment**: `DATABASE_URL` (from Railway Postgres), `SITEPING_API_KEY` (manual), `NODE_ENV`
- **README**: New "Deploy on Railway" section with button and instructions
- **Infrastructure**: Railway PostgreSQL service added alongside the demo app service
