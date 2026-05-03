# WhiteBox - Project Map

## Current product shape

WhiteBox is a loyalty marketplace with three surfaces:

- TWA/mobile client app for end users.
- Admin portal for operations, analytics, growth, database map, backups and audit.
- Company portal placeholder for partner-facing finance/compliance flows.

The runtime is a monorepo:

```text
whitebox/
  apps/api/              # NestJS REST API
  prisma/                # Prisma schema, migrations, seed
  src/app/(auth)/        # Login/register/email confirmation
  src/app/(twa)/         # Mobile app routes
  src/app/(portal)/      # Admin/company desktop portal routes
  src/components/        # UI, brand, TWA components
  src/lib/api/           # Typed API clients
  docs/                  # Architecture, CI/CD, deployment docs
  scripts/               # Railway and local developer helpers
```

## Runtime entry points

- Web dev: `npm run dev:web`
- API dev: `npm run api:dev`
- Combined local dev: `npm run dev:local`
- Local DB: `npm run db:local:up`
- Full verification: `npm run ci:verify`
- Railway-aware build: `npm run build`
- Railway-aware start: `npm run start`

## Important app routes

TWA/mobile:

- `/` dashboard with points balance, active subscriptions and loyalty cards.
- `/onboarding` first-run tutorial with skip support.
- `/companies` all partners with category and price/filter UX.
- `/loyalty-cards` companies where the user has earned points.
- `/marketplace` subscription catalog from DB.
- `/marketplace/[id]` subscription details and activation.
- `/wallet/[id]` company loyalty card, levels, subscriptions and addresses.
- `/map` Yandex map with branches, clustering, route presets, user location and filters.
- `/history` activity + archived subscriptions.
- `/scan` QR screen.
- `/settings` profile, favorites, promo/referral and subpages.

Admin:

- `/admin` dashboard.
- `/admin/users` and `/admin/users/[uuid]` user operations.
- `/admin/categories` category dictionary.
- `/admin/companies` and `/admin/companies/[uuid]` company users, profile, locations and subscriptions.
- `/admin/companies/[uuid]/clients` company client analytics.
- `/admin/subscriptions` KPI/SLA/forecast analytics.
- `/admin/growth` promo codes and referral campaign rules.
- `/admin/database` interactive Prisma schema visualizer.
- `/admin/audit`, `/admin/audit/new`, `/admin/audit/backups` audit and DB backups.
- `/admin/payments`, `/admin/compliance` placeholders for future operational modules.

Company portal:

- `/company`, `/company/payments`, `/company/compliance`.

## Key files

- `prisma/schema.prisma` - source of truth for relational schema.
- `prisma/seed.mjs` - professional demo seed data.
- `apps/api/src/admin/admin.controller.ts` - admin API surface.
- `apps/api/src/admin/admin.service.ts` - admin business logic.
- `apps/api/src/registered/registered.controller.ts` - client/TWA API surface.
- `apps/api/src/registered/registered.service.ts` - DB-backed mobile read models.
- `apps/api/src/auth/auth.service.ts` - auth, sessions, account freeze/reactivation.
- `apps/api/src/maintenance/*` - restore-time maintenance lock.
- `src/middleware.ts` - web route UX redirection based on JWT role/expiry; API remains the security boundary.
- `src/app/(portal)/admin/database/page.tsx` - visual DB map synced with Prisma models.
- `src/app/(portal)/admin/growth/page.tsx` - promo/referral admin UI.
- `src/app/(portal)/admin/companies/[uuid]/page.tsx` - company profile, addresses and subscriptions.
- `src/app/(twa)/map/page.tsx` - Yandex Maps integration and location UX.
- `src/lib/api/admin-client.ts`, `src/lib/api/twa-client.ts`, `src/lib/api/auth-client.ts` - frontend API clients.
- `.github/workflows/whitebox-ci-cd.yml` - PR verification and production migration gate.

## Local and production environments

- Local development should use Docker PostgreSQL from `docker-compose.yml`.
- Production DB credentials live in Railway variables and GitHub Secrets, not in committed files.
- PRs run full checks against a temporary GitHub Actions PostgreSQL service.
- Pushes to `main` run the same checks and then apply production Prisma migrations.
- Railway deploys `whitebox-api` and `whitebox-web` from `main`.

## Notes

- User-facing TWA surfaces are DB-backed through `/api/registered/*`; `mockData` is legacy/static fallback only.
- Points are company-scoped. Promo/referral point rewards require a company context and write normal loyalty ledger rows.
- Company addresses are stored as `CompanyLocation` with coordinates, hours and active/main flags.
- Payment providers are intentionally stubbed; subscription activation is currently a non-payment flow.
