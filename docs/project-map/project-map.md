# WhiteBox - Project Map

## Top-level structure

```text
whitebox/
  apps/
    api/                   # NestJS backend
      src/
        auth/
        admin/
        maintenance/
        registered/
        health/
        oauth/
        prisma/
  prisma/
    schema.prisma
    migrations/
  src/
    app/
      (auth)/              # login/register
      (twa)/               # mobile Telegram Web App routes
      (portal)/            # desktop admin/company routes
    components/
      brand/
      ui/
    lib/
      api/
      prisma.ts
  docs/project-map/
```

## Important app routes

- TWA (mobile): `/`, `/onboarding`, `/companies`, `/marketplace`, `/wallet/[id]`, `/map`, `/history`, `/scan`, `/settings`
- Admin (desktop): `/admin`, `/admin/users`, `/admin/users/[uuid]`, `/admin/categories`, `/admin/companies`, `/admin/companies/[uuid]`, `/admin/subscriptions`, `/admin/growth`, `/admin/database`
- Admin operations: `/admin/audit`, `/admin/audit/new`, `/admin/audit/backups`
- Company (desktop): `/company`, `/company/payments`, `/company/compliance`

## Key files

- `src/app/(portal)/layout.tsx` - desktop sidebar layout with `WhiteBox` branding.
- `src/app/(portal)/admin/users/page.tsx` - user directory (read-only rows + profile navigation).
- `src/app/(portal)/admin/users/[uuid]/page.tsx` - full user CRUD workspace.
- `src/app/(portal)/admin/categories/page.tsx` - category CRUD workspace.
- `src/app/(portal)/admin/companies/[uuid]/page.tsx` - company profile + company-bound subscriptions CRUD.
- `src/app/(portal)/admin/database/page.tsx` - interactive DB map (zoom/pan/relations).
- `src/app/(portal)/admin/growth/page.tsx` - promo code and referral campaign controls.
- `src/app/(portal)/admin/audit/page.tsx` - audit feed UI with workspace filters.
- `src/app/(portal)/admin/audit/backups/page.tsx` - DB backups manager + restore statuses.
- `src/app/(twa)/onboarding/page.tsx` - first-run tutorial with skip flow.
- `src/app/(twa)/settings/page.tsx` - rich profile, privacy, promo and referral actions.
- `src/lib/api/admin-client.ts` - admin HTTP client methods.
- `src/lib/api/twa-client.ts` - TWA registered API read/actions client.
- `apps/api/src/admin/admin.controller.ts` - admin endpoints.
- `apps/api/src/admin/admin.service.ts` - admin business logic.
- `apps/api/src/maintenance/maintenance.guard.ts` - global API lock during restore.
- `apps/api/src/maintenance/maintenance-state.service.ts` - restore stage state machine.
- `apps/api/src/admin/admin.service.spec.ts` - admin unit tests.

## Layout conventions

- Root layout provides global theme/font shell.
- `(twa)` applies `.twa-viewport` for mobile constrained UI.
- `(portal)` applies desktop grid with sticky left menu.

## Notes

- Admin UI is desktop-first and intentionally separate from TWA viewport constraints.
- User role/status editing is done on profile page, not inline in the table.
