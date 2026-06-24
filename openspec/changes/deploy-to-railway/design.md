## Context

SitePing is a Bun + Turborepo monorepo with a Next.js 16 demo app (`apps/demo`). The demo app already has a multi-stage Dockerfile and `output: "standalone"` in Next.js config. The Prisma adapter (`@siteping/adapter-prisma`) exists as a workspace package. Currently there's no Railway configuration, no Prisma migration setup, and no production-ready env var documentation.

Railway auto-detects Dockerfiles, supports monorepos via root directory and `RAILWAY_DOCKERFILE_PATH`, and provides managed PostgreSQL with automatic `DATABASE_URL` injection.

## Goals / Non-Goals

**Goals:**
- One-click deploy of SitePing demo app on Railway with PostgreSQL
- `railway.json` config-as-code at repo root
- Documentation for "Deploy on Railway" button in README
- Prisma migration runs automatically on deploy
- Healthcheck endpoint for Railway monitoring
- No manual steps beyond clicking "Deploy on Railway"

**Non-Goals:**
- Deploying individual packages (widget, adapters, CLI) — only the demo app
- Railway template creation (done in Railway dashboard UI, not code)
- Production monitoring, alerts, or scaling configuration
- Alternative cloud providers (Fly, Render, etc.)

## Decisions

### 1. Dockerfile location → `RAILWAY_DOCKERFILE_PATH`
The Dockerfile lives at `apps/demo/Dockerfile` because it's specific to the demo app. Railway will be configured with `RAILWAY_DOCKERFILE_PATH=apps/demo/Dockerfile` to find it. This avoids moving the Dockerfile to the repo root, which would couple the root to demo-specific config.

### 2. No Dockerfile changes needed
The existing Dockerfile is already correct for Railway:
- Multi-stage: bun builder → node runner
- Standalone Next.js output
- Port 3000 with `EXPOSE`
- Non-root user

The `COPY . .` copies the entire monorepo, which is correct because the build needs workspace packages.

### 3. Prisma mode vs in-memory mode
Two deployment modes:
- **In-memory (default)**: No database needed. Railway deploys with zero config. Good for evaluation/demo.
- **Prisma + PostgreSQL (recommended for production)**: Requires Railway PostgreSQL add-on. `DATABASE_URL` is auto-injected.

The Docker builds and deploys with in-memory by default. Users opt into Prisma by adding a PostgreSQL service and setting `DATABASE_URL`.

### 4. Migration strategy → pre-deploy command
Prisma migrations run via Railway's `preDeployCommand`:
```
bun run --filter='@siteping/adapter-prisma' db:migrate
```
This ensures the DB schema is current before the new deployment starts. Rollback is handled by Railway's instant rollback to a previous deployment.

### 5. Healthcheck → `/api/siteping` GET endpoint
The existing API handler supports `GET /api/siteping` (returns feedbacks). Railway healthcheck will point to `/api/siteping` with a timeout of 300s (Next.js serverless default).

### 6. Configuration → `railway.json` at repo root
A single `railway.json` at the repo root with build/deploy config for the demo service. This keeps configuration versioned alongside code.

### 7. Repository setup → fork or clone
The current local repo (`C:\Users\USUARIO\Desktop\P\SitePing`) is not the full source — it only has `.git`, `.opencode/`, and `openspec/`. Two options:
- **Fork** the upstream `NeosiaNexus/SitePing` to the user's GitHub account, then clone locally with `--recurse-submodules`
- **Clone** directly and add this OpenSpec directory as a submodule or separate branch

**Recommendation**: Fork the repo to your GitHub account, clone it locally, then apply changes and push.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Docker build is slow (copies entire monorepo, builds all packages) | Acceptable for Railway — build cache persists between deploys. Could optimize with `.dockerignore` refinement later. |
| Prisma client generation not in Dockerfile | Prisma client is a devDependency of the demo app. `next build` runs it automatically. If missing, add `prisma generate` step. |
| `preDeployCommand` migration could fail on first deploy (no DB yet) | Railway provisions PostgreSQL before the first deploy. The pre-deploy runs after DB is ready. |
| Fork drift from upstream | Keep fork synced via GitHub's "Sync fork" button. Changes are additive (config files, not core code). |
| `SITEPING_API_KEY` not set → API is public | Documented as required for production. Healthcheck still works without it (read-only GET). |

## Open Questions

- Should the `railway.json` be at root or inside `apps/demo/`? → Decision: root, since Railway expects it at the source root and the Dockerfile path is configured separately.
- Prisma schema: should we commit it to the repo or generate it via `postinstall` script? → Commit it, for transparency and migration history.
