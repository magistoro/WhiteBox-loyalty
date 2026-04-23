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
- `POST /api/admin/company-users/:uuid/subscriptions` - create company-bound subscription
- `PATCH /api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` - update company subscription
- `DELETE /api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` - delete company subscription

Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` for the Next.js auth and admin API clients.

## Admin UI Overview

- `/admin` - desktop dashboard
- `/admin/users` - users directory
- `/admin/users/:uuid` - full user profile editor
- `/admin/categories` - categories CRUD
- `/admin/companies` - company users directory
- `/admin/companies/:uuid` - company profile + subscriptions CRUD
- `/admin/database` - interactive DB map (zoom, pan, relations)
- `/email-change/confirm?token=...` - public confirmation page for user email change

## Tests

API tests:

```bash
npm run api:test
```

## Build

```bash
npm run build
npm run api:build
```

## Docs

See `docs/project-map/` for architecture, entities, routes, and services.
