# WhiteBox - Architecture Overview

## Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind, Framer Motion.
- Backend: NestJS, Passport local/JWT, Swagger, global guards.
- Data: Prisma 7, PostgreSQL, generated Prisma Client.
- Maps: Yandex Maps JavaScript API v3 with reactify; server-side Yandex Geocoder.
- Deployment: Railway API service, Railway Web service, Railway PostgreSQL.
- CI/CD: GitHub Actions PR verification and production migration gate.

## Main layers

1. UI layer: `src/app`, `src/components`.
2. API client layer: `src/lib/api/*`.
3. HTTP API layer: `apps/api/src/*`.
4. Persistence layer: Prisma schema, migrations and PostgreSQL.
5. Deployment layer: Railway scripts and GitHub Actions.

## Access model

- `CLIENT`: TWA app routes and `/api/registered/*`.
- `COMPANY`: company portal routes.
- `ADMIN`: admin portal and `/api/admin/*`.

Authorization is layered:

- Next middleware handles UX redirects and role-aware route routing.
- Nest `JwtAuthMiddleware` verifies API JWT signatures and attaches `req.user`.
- `RolesGuard` enforces role access on controllers.
- `MaintenanceGuard` blocks normal API operations during DB restore.

## Core data flows

### Auth/session

1. User registers or logs in through `/api/auth/*`.
2. API creates short-lived access token and rotating refresh token.
3. Frontend stores access token in localStorage and `wb_access_token` cookie.
4. Web middleware uses decoded token role/expiry for routing only.
5. API guards perform real signed-token verification.

### TWA marketplace and wallet

1. TWA calls `/api/registered/marketplace`, `/companies`, `/wallet`, `/history`.
2. `RegisteredService` builds UI-ready read models from Prisma.
3. Category filters are derived from active data, not hardcoded mock lists.
4. Activation creates an active `UserSubscription` and ensures company-user linkage.

### Company points and levels

1. `UserCompany` stores company-specific balance.
2. `LoyaltyTransaction` stores earn/spend ledger events.
3. `CompanyLevelRule` defines spend thresholds and cashback percentages.
4. TWA and admin analytics calculate current level from persisted company-specific activity.

### Locations and map

1. Admin saves company addresses in `/admin/companies/[uuid]`.
2. API resolves coordinates through Yandex Geocoder and stores `CompanyLocation`.
3. Registered API returns active locations to TWA.
4. `/map` renders category markers, clusters, selected-point cards, route presets and filters.

### Growth

1. Admin configures promo codes and referral campaign in `/admin/growth`.
2. Promo redemption records `PromoCodeRedemption` and grants either company points or subscription activation.
3. Referral redemption records `ReferralInvite` and rewards both users using current `ReferralCampaign` rules.

### Backup restore safety

1. Admin starts restore from `/admin/audit/backups`.
2. `MaintenanceStateService` enters restore mode.
3. `MaintenanceGuard` returns `503 MAINTENANCE_RESTORE` for regular operations.
4. Restore validates payload, clears/restores tables and resets sequences.
5. UI polls restore status and unlocks after `DONE` or `FAILED`.

## Testing and quality gates

- `npm run ci:verify` runs Prisma generate/validate, ESLint, web build, API build and API Jest tests.
- GitHub Actions runs the same verification on PRs with temporary PostgreSQL.
- Production migrations run only after `main` verification succeeds.
