# WhiteBox - UI Components and Routes

## Route structure

| Path | Purpose | Access |
|---|---|---|
| `/` | TWA dashboard | CLIENT |
| `/login` | Login | Public |
| `/register` | Registration | Public |
| `/email-change/confirm` | Email change confirmation | Public |
| `/onboarding` | First-run tutorial with skip | CLIENT |
| `/companies` | All partners | CLIENT |
| `/loyalty-cards` | Companies where the user has points/activity | CLIENT |
| `/marketplace` | Subscription catalog | CLIENT |
| `/marketplace/[id]` | Subscription detail | CLIENT |
| `/wallet/[id]` | Company loyalty card detail | CLIENT |
| `/map` | Yandex partner map | CLIENT |
| `/history` | Activity and subscription archive | CLIENT |
| `/scan` | User QR | CLIENT |
| `/settings` | Profile, stats, favorites, promo/referral | CLIENT |
| `/settings/account` | Privacy/account actions | CLIENT |
| `/settings/favorites` | Favorite categories | CLIENT |
| `/settings/business`, `/settings/partnership`, `/settings/reviews` | Profile subpages/placeholders | CLIENT |
| `/help/*` | FAQ/contact/privacy | Public |
| `/company/*` | Company portal | COMPANY/ADMIN |
| `/admin` | Admin dashboard | ADMIN |
| `/admin/users`, `/admin/users/[uuid]` | User operations | ADMIN |
| `/admin/categories` | Category CRUD | ADMIN |
| `/admin/companies`, `/admin/companies/[uuid]` | Company accounts/profile/locations/subscriptions | ADMIN |
| `/admin/companies/[uuid]/clients` | Company client analytics | ADMIN |
| `/admin/subscriptions` | Subscription analytics | ADMIN |
| `/admin/growth` | Promo/referral management | ADMIN |
| `/admin/database` | Prisma schema visualizer | ADMIN |
| `/admin/audit`, `/admin/audit/new`, `/admin/audit/backups` | Audit and backups | ADMIN |
| `/admin/payments`, `/admin/compliance` | Future modules | ADMIN |

## Layout hierarchy

- `src/app/layout.tsx`: root shell, dark theme and typography.
- `src/app/(auth)/layout.tsx`: centered auth pages.
- `src/app/(twa)/layout.tsx`: mobile viewport, transitions and bottom nav.
- `src/app/(portal)/layout.tsx`: desktop portal sidebar and content grid.

## TWA UX state

- QR element is only on `/scan`; it was removed from global/profile surfaces.
- Bottom nav labels use `Profile` instead of old `Settings` naming where applicable.
- Favorite categories can be selected in onboarding/settings and are capped at 10 in UI/API validation.
- Marketplace and partner filters use compact quick chips and extended filter panels.
- Partner filters respect multi-category companies and hide empty categories where appropriate.

## Map UX

- Yandex Maps JS API v3 is used on `/map`.
- Browser geolocation is optional and shows a user marker when allowed.
- Search matches company name, address and category and shows results under the input without chaotic camera jumps.
- Filters include all/main branches, open-now and active-subscription partners.
- Markers use category icons and cluster at low zoom.
- Clicking a cluster shows up to 10 addresses below the map.
- Selected-point card shows open/closed state, categories, hours, distance, user points, route presets, open-card action and nearby branches.
- Route presets open Yandex routes for car, walk and public transit.

## Admin UX

- Admin pages are desktop-first.
- Company pages use collapsible sections with quick-jump controls.
- Locations section supports multiple addresses, geocoding, main/active flags, hours and duplicate prevention.
- Subscriptions admin has KPI/SLA cards, 30/90-day forecast and visual analytics.
- Growth admin supports promo search/sort/edit/pause/activate and referral campaign settings.
- Database map has grouped chips, icons, presets, hide/show eye buttons, pan and wheel zoom.
- Backups UI supports snapshot creation, download, restore confirmation, deletion and live restore statuses.

## Key components

- `WhiteBoxLogo` - portal brand.
- `BottomNav` - TWA nav.
- `CategoryIcon` - shared category icon renderer.
- `CategoryChipStrip` - horizontal category chips.
- `select-field`, `category-select`, `category-multi-select` - styled form controls.
- `FrozenAccountDialog`, `DeleteAccountDialog`, `ChangePasswordDialog` - account state UX.

## Manual smoke checklist

- Register client -> onboarding appears -> skip works.
- Login admin/company/client seed accounts.
- Admin creates/edits company location and sees coordinates saved.
- TWA map shows branch marker and route button.
- Activate marketplace subscription -> dashboard active subscriptions updates.
- Earn points for company -> `/loyalty-cards` and `/wallet/[id]` update.
- Create points promo -> redeem in TWA -> loyalty transaction appears.
- Create subscription promo -> redeem in TWA -> active subscription appears.
- Referral code redeem rewards both sides and blocks self/duplicate redemption.
- Create backup -> download -> restore status UI updates.
