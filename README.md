# Alfred Notification Service

NestJS service for email notification delivery in the Alfred monorepo.

This service is responsible for:
- storing email templates in PostgreSQL
- processing email jobs through Redis/BullMQ
- sending emails through SMTP
- exposing health endpoints for deployment checks

## Tech Stack

- NestJS 11
- TypeORM 0.3.x
- PostgreSQL
- Redis / BullMQ
- Nodemailer
- pnpm

## Project Structure

```text
alfred-notification-service/
├── scripts/                 # utility scripts such as db creation
├── src/
│   ├── common/              # shared utilities
│   ├── migrations/          # TypeORM migrations
│   ├── modules/             # feature modules
│   ├── app.module.ts        # Nest root module
│   └── data-source.ts       # TypeORM CLI datasource
├── test/                    # e2e tests
├── .env.example             # local environment template
├── Makefile                 # common dev commands
└── package.json             # scripts and dependencies
```

## Requirements

Before running locally, ensure these are available:

- Node.js 20+
- pnpm
- PostgreSQL
- Redis

Optional for container workflow:

- Docker

## Environment Configuration

Create a local env file:

```bash
cp .env.example .env
```

Minimum required variables:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=<CHANGE_ME>
SMTP_PASSWORD=<CHANGE_ME>
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME="Alfred Notification"

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<CHANGE_ME>
DB_DATABASE=alfred_notification

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<CHANGE_ME>
```

Important notes:

- `DB_DATABASE` must point to a PostgreSQL database that this service can access.
- `migration:generate` requires the database to be reachable.
- `REDIS_PASSWORD` must match the Redis instance configuration.
- `CORS_ALLOWED_ORIGINS` is optional for local development.
- `MTLS_*` variables are only needed in environments that use mTLS.

## Install Dependencies

```bash
make install
```

Or directly:

```bash
pnpm install
```

## Run In Development

Start the service in watch mode:

```bash
make dev
```

Or directly:

```bash
pnpm dev
```

Default local port from `.env.example`:

```text
http://localhost:8300
```

## Build And Run Production Locally

Build:

```bash
make build
```

Start compiled app:

```bash
make start
```

Or directly:

```bash
pnpm build
pnpm start:prod
```

## Database Workflow

### Create Database

If the target database does not exist yet:

```bash
pnpm run db:create
```

### Run Migrations

Apply pending migrations:

```bash
make migration-run
```

Or directly:

```bash
pnpm run migration:run
```

### Revert Last Migration

```bash
make migration-revert
```

Or directly:

```bash
pnpm run migration:revert
```

### Create Empty Migration

Use this when you want to write SQL manually:

```bash
pnpm run migration:create src/migrations/YourMigrationName
```

Example:

```bash
pnpm run migration:create src/migrations/EnsureGenerateUuidV7Function
```

### Generate Migration From Entity Changes

Use this after modifying entity definitions.

```bash
pnpm run migration:generate src/migrations/YourMigrationName
```

Example:

```bash
pnpm run migration:generate src/migrations/AddEmailTemplateIndexes
```

Important:

- this command compares entity metadata with the current database schema
- PostgreSQL must be running and reachable
- if the database connection fails, no migration file will be created

### Migration Discovery

The service is configured to auto-discover:

- entities via `src/modules/**/*.entity{.ts,.js}`
- migrations via `src/migrations/*{.ts,.js}`

That means you do not need to import every migration file manually into:

- `src/app.module.ts`
- `src/data-source.ts`

## Testing

Run unit tests:

```bash
make test
```

Watch mode:

```bash
make test-watch
```

Coverage:

```bash
make test-cov
```

E2E tests:

```bash
make test-e2e
```

## Code Quality

Lint:

```bash
make lint
```

Format:

```bash
make format
```

## Docker

Build image:

```bash
make docker-build
```

Build without cache:

```bash
make docker-build-nc
```

Clean unused images:

```bash
make docker-clean
```

## Production Deployment

Prepare image for infra deployment:

```bash
make prod-deploy
```

Then deploy from the infra workspace:

```bash
cd ../alfred-infra
make prod-deploy
```

## Common Issues

### `migration:generate` does not create a file

Check these first:

- PostgreSQL is running
- `.env` values are correct
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` are valid
- you are using the correct command:

```bash
pnpm run migration:generate src/migrations/YourMigrationName
```

Do not use this form for the current script setup:

```bash
pnpm run migration:generate -- src/migrations/YourMigrationName
```

### Database connection refused

Typical cause:

```text
ECONNREFUSED 127.0.0.1:5432
```

Meaning:

- PostgreSQL is not running
- wrong port
- wrong host
- wrong local `.env`

### Redis connection issues

Check:

- Redis is running
- `REDIS_HOST` and `REDIS_PORT` are correct
- password matches the actual instance

## Recommended Local Workflow

```bash
cp .env.example .env
pnpm install
pnpm run db:create
pnpm run migration:run
pnpm dev
```

When changing schema:

```bash
pnpm run migration:generate src/migrations/YourMigrationName
pnpm run migration:run
```
