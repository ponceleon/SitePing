## ADDED Requirements

### Requirement: Dockerfile discovery
Railway SHALL discover the Dockerfile at `apps/demo/Dockerfile` via the `RAILWAY_DOCKERFILE_PATH` variable.

#### Scenario: Dockerfile used for build
- **WHEN** Railway builds the service
- **THEN** the Dockerfile at `apps/demo/Dockerfile` SHALL be used as the build instructions

### Requirement: Config-as-code via railway.json
The repository SHALL include a `railway.json` at the root with build and deploy configuration for the demo service.

#### Scenario: railway.json defines build config
- **WHEN** Railway reads the project config
- **THEN** `railway.json` SHALL specify the build command, start command, and healthcheck path

### Requirement: Healthcheck endpoint
The demo app SHALL expose a healthcheck endpoint at `/api/siteping` that returns HTTP 200.

#### Scenario: Healthcheck succeeds
- **WHEN** Railway sends a GET request to `/api/siteping`
- **THEN** the response SHALL have HTTP status 200

#### Scenario: Healthcheck during deployment
- **WHEN** Railway checks deployment health via the configured healthcheck path
- **THEN** the healthcheck SHALL respond within 300 seconds

### Requirement: Environment variables
The system SHALL support the following Railway-injected environment variables:
- `DATABASE_URL` — PostgreSQL connection string (optional, for Prisma mode)
- `PORT` — Railway-assigned port (defaults to 3000)
- `NODE_ENV` — set to `production` by Railway

#### Scenario: DATABASE_URL is optional
- **WHEN** `DATABASE_URL` is not set
- **THEN** the app SHALL fall back to the in-memory store

#### Scenario: PORT is respected
- **WHEN** Railway sets `PORT`
- **THEN** the Next.js server SHALL listen on that port

### Requirement: Production API security
The system SHALL support `SITEPING_API_KEY` environment variable to protect admin API operations (GET, PATCH, DELETE).

#### Scenario: API key protects write operations
- **WHEN** `SITEPING_API_KEY` is set
- **THEN** PATCH and DELETE requests SHALL require the key via `x-api-key` header

### Requirement: Minimal dockerignore
The `.dockerignore` SHALL exclude `node_modules`, `.git`, `.next`, `.turbo`, and `dist` directories from the Docker build context.

#### Scenario: Unnecessary files excluded
- **WHEN** Docker builds the image
- **THEN** the build context SHALL NOT include `node_modules`, `.git`, or `.next` directories

### Requirement: Deploy button in README
The README SHALL include a "Deploy on Railway" button with the template URL.

#### Scenario: Button renders correctly
- **WHEN** the README is viewed on GitHub
- **THEN** the "Deploy on Railway" button image SHALL be visible and linked to the correct template URL
