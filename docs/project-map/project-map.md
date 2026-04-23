# WhiteBox - Project Map

## Top-level structure

```text
whitebox/
  apps/
    api/                   # NestJS backend
      src/
        auth/
        admin/
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
      mockData.ts
      prisma.ts
  docs/project-map/
```

## Important app routes

- TWA (mobile): `/`, `/companies`, `/marketplace`, `/wallet/[id]`, `/map`, `/history`, `/scan`, `/settings`
- Admin (desktop): `/admin`, `/admin/users`, `/admin/users/[uuid]`, `/admin/categories`, `/admin/companies`, `/admin/companies/[uuid]`, `/admin/subscriptions`, `/admin/database`
- Company (desktop): `/company`, `/company/payments`, `/company/compliance`

## Key files

- `src/app/(portal)/layout.tsx` - desktop sidebar layout with `WhiteBox` branding.
- `src/app/(portal)/admin/users/page.tsx` - user directory (read-only rows + profile navigation).
- `src/app/(portal)/admin/users/[uuid]/page.tsx` - full user CRUD workspace.
- `src/app/(portal)/admin/categories/page.tsx` - category CRUD workspace.
- `src/app/(portal)/admin/companies/[uuid]/page.tsx` - company profile + company-bound subscriptions CRUD.
- `src/app/(portal)/admin/database/page.tsx` - interactive DB map (zoom/pan/relations).
- `src/lib/api/admin-client.ts` - admin HTTP client methods.
- `apps/api/src/admin/admin.controller.ts` - admin endpoints.
- `apps/api/src/admin/admin.service.ts` - admin business logic.
- `apps/api/src/admin/admin.service.spec.ts` - admin unit tests.

## Layout conventions

- Root layout provides global theme/font shell.
- `(twa)` applies `.twa-viewport` for mobile constrained UI.
- `(portal)` applies desktop grid with sticky left menu.

## Notes

- Admin UI is desktop-first and intentionally separate from TWA viewport constraints.
- User role/status editing is done on profile page, not inline in the table.
