# WhiteBox - UI Components and Routes

## Route structure

| Path | Purpose | Access |
|---|---|---|
| `/` | TWA home | CLIENT |
| `/login` | Login page | Public |
| `/register` | Registration page | Public |
| `/onboarding` | First-run tutorial with skip support | CLIENT |
| `/companies` | Partners list | CLIENT |
| `/loyalty-cards` | User loyalty cards from companies where points were earned | CLIENT |
| `/marketplace` | Subscription catalog | CLIENT |
| `/marketplace/[id]` | Subscription details | CLIENT |
| `/wallet/[id]` | Loyalty card details | CLIENT |
| `/map` | Partners map | CLIENT |
| `/history` | Points history | CLIENT |
| `/scan` | QR scan surface | CLIENT |
| `/settings` + subpages | User settings | CLIENT |
| `/help/*` | Help and legal pages | Public |
| `/company` + subpages | Company workspace | COMPANY / ADMIN |
| `/admin` | Admin dashboard | ADMIN |
| `/admin/users` | Users table and search | ADMIN |
| `/admin/users/[uuid]` | Full user profile CRUD | ADMIN |
| `/admin/categories` | Categories CRUD | ADMIN |
| `/admin/companies` | Company accounts directory | ADMIN |
| `/admin/companies/[uuid]` | Company profile + subscriptions CRUD | ADMIN |
| `/admin/companies/[uuid]/clients` | Company clients table with search/sort/pagination + expandable details | ADMIN |
| `/admin/subscriptions` | Subscription stats and UUID lookup | ADMIN |
| `/admin/growth` | Promo codes and referral campaign controls | ADMIN |
| `/admin/database` | Interactive DB schema map | ADMIN |
| `/admin/payments` | Payments placeholder | ADMIN |
| `/admin/compliance` | Compliance placeholder | ADMIN |
| `/admin/audit` | Audit feed (manager/developer) | ADMIN |
| `/admin/audit/new` | Manual audit event form | ADMIN |
| `/admin/audit/backups` | Backup manager with restore flow | ADMIN |

## Layout hierarchy

- `app/layout.tsx`: root shell, global dark theme and typography.
- `app/(twa)/layout.tsx`: mobile viewport (`.twa-viewport`), `PageTransition`, `BottomNav`.
- `app/(portal)/layout.tsx`: desktop workspace with left sidebar, brand/logo, section menu.
- `app/(auth)/layout.tsx`: centered auth forms.

## Admin UX notes

- Admin and company consoles are desktop-first; they are not constrained by TWA mobile width.
- Left menu includes `Dashboard`, user and subscription tools, operations pages, and `Database map`.
- Users table is read-only for role/status in-place; editing is moved to `/admin/users/[uuid]`.
- Sensitive fields are protected in profile view: password/email are not directly editable, and account deletion schedule is read-only with explicit reactivation action.
- Company profile uses `Min redeem` as the points threshold for allowing redemption; levels are configured separately for cashback progression.
- Audit page includes workspace-aware stream for operations and developer git events.
- Backup page includes save/download/restore/delete actions and live restore timeline.
- During restore, operation buttons are locked and UI shows maintenance + progress stages.
- Database map supports wheel zoom, node visibility toggle, and schema view presets for focused exploration.
- TWA home, marketplace, partners, category, wallet, map, and history surfaces now read user-facing data from registered API read models.
- `/onboarding` is a polished first-run flow for new CLIENT users; it explains favorites, geolocation, QR, points, subscriptions, and map value, and always provides a skip action.
- `/settings` is now a richer profile surface with activity level, favorite categories, promo-code redemption, referral code/redeem actions, and privacy switches.
- `/admin/growth` manages promo codes and referral campaign rules with status cards and redemption stats.
- `/map` uses Yandex Maps JavaScript API v3 via `reactify` and renders saved `CompanyLocation` coordinates from the registered API.
- `/map` supports browser geolocation opt-in, a visible user marker, search by company/address/category, `Open now`, active-subscription filtering, zoom-aware marker clustering, category-icon custom markers, and route presets for car/walking/public transit.
- `/map` selected-location cards show open/closed status, working hours, distance when geolocation is available, user points at the partner, route actions, wallet-card navigation, and nearby branches for the same company.
- Admin company profile pages include a `Locations` section for multi-address companies; addresses are geocoded server-side and persisted with coordinates.
- TWA marketplace and partner filters use compact quick chips plus extended sheet filters; partner filters respect companies with multiple categories.
- Subscription detail activation uses `/api/registered/subscriptions/:uuid/activate` in the current non-payment flow.
- Wallet detail renders a fresh canvas QR from `/api/registered/qr` payload and shows a company level ladder calculated from `CompanyLevelRule`.

## Manual testing checklist

- Register a new CLIENT account and verify redirect to `/onboarding`.
- On `/onboarding`, open favorite categories, save at least one category, and return to the tutorial.
- On `/onboarding`, press geolocation allow/deny and verify the tutorial remains usable.
- On `/onboarding`, press `Skip` and verify the app opens normally.
- In admin `/admin/growth`, create a `POINTS` promo code and verify it appears in the inventory.
- In TWA `/settings`, redeem the points promo and verify the success message plus updated activity/points after refresh.
- In admin `/admin/growth`, create a `SUBSCRIPTION` promo with a valid subscription UUID.
- In TWA `/settings`, redeem the subscription promo and verify the subscription appears in active subscriptions.
- In admin `/admin/growth`, change referral inviter/invited points and pause/activate the campaign.
- In TWA `/settings`, copy a referral code from user A and redeem it on user B; verify duplicate/self redemption is blocked.
- In TWA `/settings`, toggle privacy switches and reload the page; verify persisted state.
- Run database backup after creating promo/referral data and verify the backup payload includes growth tables.

## Key components

- `src/components/brand/WhiteBoxLogo.tsx` - brand logo used in portal sidebar.
- `src/components/ui/select-field.tsx` - styled select control with consistent dropdown arrow.
- `src/components/PageTransition.tsx` - route-level animation wrapper.
- `src/components/BottomNav.tsx` - TWA mobile bottom navigation.
