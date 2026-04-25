# WhiteBox - Loyalty Wallet (TWA) + API

Monorepo: **Next.js** (Telegram Web App UI) + **NestJS** (REST API) + **Prisma** + **PostgreSQL**.

## Prerequisites

- Node.js 20+
- PostgreSQL (local or remote)
- Copy `.env.example` -> `.env` and set `DATABASE_URL`, `JWT_SECRET`, etc.

## Install

```bash
npm install
npx prisma generate
```

## Run the web app (port 3000)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run the API (port 3001)

```bash
npm run api:dev
```

- Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- Health: `GET /api/health`

## API Overview

Auth routes (`/api/auth/*`):

- `POST /api/auth/register` - default role is `CLIENT`; `ADMIN` is rejected
- `POST /api/auth/login` - email + password (Passport local)
- `POST /api/auth/refresh` - refresh token rotation
- `GET /api/auth/me` - Bearer JWT profile

Admin routes (`/api/admin/*`, ADMIN only):

- `GET /api/admin/users` - list/search users
- `GET /api/admin/users/:uuid` - full user profile with related entities
- `PATCH /api/admin/users/:uuid` - update allowed profile fields (email/password/telegram/deletion date are locked)
- `DELETE /api/admin/users/:uuid` - delete user (self-delete is blocked)
- `POST /api/admin/users/:uuid/email-change-request` - send secure email-change confirmation link to the new email
- `POST /api/admin/users/:uuid/reactivate-account` - unfreeze account pending deletion
- `GET /api/admin/categories` / `POST` / `PATCH /:id` / `DELETE /:id` - category CRUD
- `GET /api/admin/company-users` - list users with `COMPANY` role
- `GET /api/admin/company-users/:uuid` / `PATCH` / `DELETE` - company user CRUD
- `PUT /api/admin/company-users/:uuid/company-profile` - upsert company profile
- `GET /api/admin/company-users/:uuid/subscriptions` - company subscriptions
- `GET /api/admin/company-users/:uuid/clients` - company clients with search, pagination, sorting, points stats, and current level
- `POST /api/admin/company-users/:uuid/subscriptions` - create company-bound subscription
- `PATCH /api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` - update company subscription
- `DELETE /api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` - delete company subscription
- `GET /api/admin/subscriptions/stats` - subscription KPI/stats payload
- `GET /api/admin/subscriptions/:uuid` - subscription lookup by UUID
- `GET /api/admin/audit` - audit stream (`workspace=MANAGER|DEVELOPER`, filters by query/tag/page)
- `POST /api/admin/audit` - create manual audit event from admin UI
- `GET /api/admin/backups` - list DB snapshots
- `POST /api/admin/backups` - create DB snapshot (`CURRENT | SEED | MANUAL`)
- `GET /api/admin/backups/:backupId/file` - download snapshot payload
- `POST /api/admin/backups/:backupId/restore` - destructive restore (requires confirmation)
- `DELETE /api/admin/backups/:backupId` - delete snapshot
- `GET /api/admin/backups/restore-status` - live restore process status

Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` for the Next.js auth and admin API clients.

## Backup and Restore Safety

- During DB restore, API enters maintenance lock mode and blocks regular operations with `503`.
- Allowed during maintenance:
- `GET /api/health`
- `POST /api/admin/backups/:backupId/restore`
- `GET /api/admin/backups/restore-status`
- Restore uses transactional flow plus DB table lock to preserve consistency.
- Admin backup UI shows real-time restore stages and progress.

## Admin UI Overview

- `/admin` - desktop dashboard
- `/admin/users` - users directory
- `/admin/users/:uuid` - full user profile editor
- `/admin/categories` - categories CRUD
- `/admin/companies` - company users directory
- `/admin/companies/:uuid` - company profile + subscriptions CRUD
- `/admin/companies/:uuid/clients` - company clients table with search, sorting, pagination, and expandable details
- `/admin/database` - interactive DB map (zoom, pan, relations)
- `/admin/subscriptions` - KPI/SLA dashboard + forecast analytics
- `/admin/audit` - manager/developer audit feed
- `/admin/audit/new` - manual audit event creation
- `/admin/audit/backups` - save/download/restore/delete DB snapshots
- `/email-change/confirm?token=...` - public confirmation page for user email change

## Tests

API tests:

```bash
npm run api:test
```

## Loyalty notes

- `Min redeem` (stored as `pointsPerReward`) defines the minimum points threshold from which a client can redeem points.
- Level validation prevents invalid cashback ladders: for higher spend thresholds, cashback must stay the same or increase.

## Build

```bash
npm run build
npm run api:build
```

## Docs

See `docs/project-map/` for architecture, entities, routes, and services.

## Contribution Policy

- PR-only workflow to `main`.
- Direct pushes to `main` are not allowed by project policy.
- Merge to `main` is done manually by repository owner after review.

Details: see `CONTRIBUTING.md`.
