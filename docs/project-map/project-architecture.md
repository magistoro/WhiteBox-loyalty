# WhiteBox - Architecture Overview

## Stack

- Frontend: Next.js App Router + React + TypeScript + Tailwind
- Backend: NestJS + Passport (local) + JWT + Swagger
- Data: Prisma + PostgreSQL
- Motion/UI: Framer Motion + shadcn/ui

## Main layers

1. UI layer (`src/app`, `src/components`)
2. API client layer (`src/lib/api/*`)
3. HTTP API layer (`apps/api/src/*`)
4. Persistence layer (`prisma/schema.prisma`, Prisma client)

## Access model

- `CLIENT`: TWA mobile routes
- `COMPANY`: company portal routes
- `ADMIN`: admin portal and admin API routes

Role checks happen in two places:

- Next.js middleware (`src/middleware.ts`) for route-level redirection
- NestJS `JwtAuthMiddleware` + `RolesGuard` for API authorization
- NestJS global `MaintenanceGuard` for restore-time API lock

## Admin architecture additions

- Desktop shell with left navigation and `WhiteBox` brand block.
- Dashboard entry page (`/admin`) for operational overview.
- User profile workspace (`/admin/users/[uuid]`) backed by secure admin CRUD APIs.
- Categories workspace (`/admin/categories`) for full taxonomy CRUD.
- Company workspace (`/admin/companies/[uuid]`) for company profile + subscription management.
- Interactive DB map (`/admin/database`) to visualize Prisma entities and relations.
- Audit workspace (`/admin/audit`, `/admin/audit/new`) for manager/developer events.
- Backup workspace (`/admin/audit/backups`) for DB snapshot lifecycle.
- Growth workspace (`/admin/growth`) for promo codes and referral campaign configuration.

## Data flow examples

### Admin user profile

1. UI opens `/admin/users/[uuid]`
2. Frontend calls `GET /api/admin/users/:uuid`
3. `AdminService.getUserByUuid()` aggregates user + related entities
4. UI renders and edits data
5. Save action calls `PATCH /api/admin/users/:uuid`

### Login security signals

1. `POST /api/auth/login` stores normalized request metadata in `LoginEvent`.
2. `AdminService.getUserByUuid()` aggregates recent events.
3. Service computes anomaly hints (`loginRisk`) from country distribution.
4. Admin UI displays "review required" hints during manual account recovery.

### Backup restore safety flow

1. Admin triggers restore from `/admin/audit/backups`.
2. Backend enters maintenance mode (global API lock) and exposes live status via `GET /api/admin/backups/restore-status`.
3. Restore runs in transaction with table lock and staged progress updates.
4. On success/failure, maintenance mode is released and status is finalized (`DONE` / `FAILED`).

### TWA categories

1. UI calls `/api/registered/categories`
2. `RegisteredService` returns sorted categories with favorite flags

### TWA marketplace and wallet

1. UI calls registered read-model endpoints (`/marketplace`, `/companies`, `/wallet`, `/history`).
2. `RegisteredService` reads Prisma entities and returns UI-ready payloads.
3. Company levels are calculated from user spend totals and `CompanyLevelRule`.
4. Subscription activation currently creates `UserSubscription` directly; payment providers are planned as a later adapter layer.
5. Wallet detail requests `/api/registered/qr`; the API returns a UUID-based payload and the client renders a fresh QR in canvas.
6. Partner and category screens filter against real company/category relations, including additional `CompanyCategory` links.

### TWA onboarding and growth

1. New CLIENT registration redirects to `/onboarding`.
2. Tutorial completion/skip is persisted through registered endpoints into `UserProfilePreference`.
3. `/settings` calls `GET /api/registered/profile` for activity stats, preferences, favorite categories, and referral code.
4. Promo-code redemption validates `PromoCode` state and writes `PromoCodeRedemption`.
5. Referral redemption uses admin-controlled `ReferralCampaign` values and records the invite as rewarded.

## Testing

- Unit tests run in `apps/api` via Jest (`npm run api:test`).
- Coverage includes `AuthService`, `AdminService`, and `RegisteredService` scenarios.
