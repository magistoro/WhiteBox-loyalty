# WhiteBox - Services and Data Access

## Current data strategy

- TWA map data is sourced from persisted `CompanyLocation` rows exposed by the registered API; saved locations are rendered on Yandex Maps JS API v3.
- Admin company location management uses the Yandex Geocoder API server-side (`YANDEX_GEOCODER_API_KEY`) to resolve addresses once and store coordinates in the database.
- `CompanyLocation` stores `address`, `city`, resolved latitude/longitude, geocoder precision metadata, `openTime`, `closeTime`, `workingDays`, and `isMain/isActive` flags.
- Duplicate company addresses are rejected server-side during location create/update after geocoder normalization, so one company cannot save the same physical address twice.
- TWA route links are generated client-side for Yandex Maps using saved coordinates. If browser geolocation is available, route links include the user coordinates as the route start; otherwise they open with only the destination.
- Map clustering is client-side and zoom-aware: clusters collapse on lower zoom levels and expand into individual category-icon markers at close zoom levels.
- TWA marketplace and subscription details now use registered API read models from PostgreSQL.
- First-run onboarding is tracked in `UserProfilePreference` and can be completed or skipped without blocking the app.
- Promo codes are persisted in `PromoCode`/`PromoCodeRedemption` and can grant bonus points or activate an existing subscription.
- Referral conditions are stored in `ReferralCampaign`; each user gets a stable `ReferralInvite.code`, and admins can change campaign points without deployments.
- Persistent backend model is in Prisma (`prisma/schema.prisma`) on PostgreSQL.
- Auth, admin, and registered APIs run in NestJS (`apps/api`).

## Frontend API clients

- `src/lib/api/auth-client.ts` - auth session and account actions.
- `src/lib/api/categories-client.ts` - registered category/favorites endpoints.
- `src/lib/api/admin-client.ts` - admin directory, secure user management, categories/company/subscription CRUD, audit and backup operations.
- `src/lib/api/twa-client.ts` - typed TWA read models for marketplace, wallet, history, companies, and subscriptions.

## Admin API surface (`/api/admin/*`)

All routes require valid JWT and `ADMIN` role.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/admin/profile` | GET | Current admin payload |
| `/api/admin/accounts` | POST | Create account (CLIENT/COMPANY/ADMIN) |
| `/api/admin/users` | GET | Search users by role/query |
| `/api/admin/users/:uuid` | GET | Full user profile + related entities |
| `/api/admin/users/:uuid` | PATCH | Update allowed user fields (no direct email/password/telegram/deletion date editing) |
| `/api/admin/users/:uuid` | DELETE | Delete user (self-delete blocked) |
| `/api/admin/users/:uuid/email-change-request` | POST | Send secure email-change confirmation link to new email |
| `/api/admin/users/:uuid/reactivate-account` | POST | Unfreeze account and clear scheduled deletion |
| `/api/admin/users/:uuid/role` | PATCH | Legacy role update endpoint |
| `/api/admin/categories` | GET | List categories |
| `/api/admin/categories` | POST | Create category |
| `/api/admin/categories/:id` | PATCH | Update category |
| `/api/admin/categories/:id` | DELETE | Delete category |
| `/api/admin/company-users` | GET | List users with COMPANY role |
| `/api/admin/company-users/:uuid` | GET | Get company user with managed company profile |
| `/api/admin/company-users/:uuid` | PATCH | Update company user fields |
| `/api/admin/company-users/:uuid` | DELETE | Delete company user (self-delete blocked) |
| `/api/admin/company-users/:uuid/company-profile` | PUT | Create/update company profile for the user |
| `/api/admin/company-users/:uuid/subscriptions` | GET | List subscriptions owned by the company |
| `/api/admin/company-users/:uuid/clients` | GET | List company clients with loyalty stats (search, pagination, sorting) |
| `/api/admin/company-users/:uuid/subscriptions` | POST | Create subscription for company (company required) |
| `/api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` | PATCH | Update company subscription |
| `/api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` | DELETE | Delete company subscription |
| `/api/admin/subscriptions/stats` | GET | Subscription counters |
| `/api/admin/subscriptions/:uuid` | GET | Subscription lookup |
| `/api/admin/promo-codes` | GET | List promo codes with redemption counts |
| `/api/admin/promo-codes` | POST | Create points or subscription promo code |
| `/api/admin/promo-codes/:id` | PATCH | Update promo code status/settings |
| `/api/admin/referral-campaign` | GET | Get referral rules and invite stats |
| `/api/admin/referral-campaign` | PATCH | Update referral title, bonuses and active flag |
| `/api/admin/audit` | GET | Audit feed by workspace (`MANAGER` / `DEVELOPER`) |
| `/api/admin/audit` | POST | Create manual audit event |
| `/api/admin/backups` | GET | List database snapshots |
| `/api/admin/backups` | POST | Create snapshot (`CURRENT` / `SEED` / `MANUAL`) |
| `/api/admin/backups/:backupId/file` | GET | Download snapshot payload |
| `/api/admin/backups/:backupId/restore` | POST | Restore snapshot (destructive, confirmed) |
| `/api/admin/backups/:backupId` | DELETE | Delete snapshot |
| `/api/admin/backups/restore-status` | GET | Live restore stage/progress status |

## Registered API surface (`/api/registered/*`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/registered/profile` | GET | Current client payload |
| `/api/registered/onboarding/complete` | POST | Mark first-run tutorial as completed |
| `/api/registered/onboarding/skip` | POST | Skip first-run tutorial |
| `/api/registered/profile/preferences` | PUT | Update profile privacy and communication preferences |
| `/api/registered/referral` | GET | Current user's referral code and campaign terms |
| `/api/registered/referral/redeem` | POST | Redeem a friend's referral code |
| `/api/registered/promo/redeem` | POST | Redeem promo code for points or subscription activation |
| `/api/registered/categories` | GET | Category catalog + favorite flag |
| `/api/registered/favorite-categories` | GET | Favorite category slugs |
| `/api/registered/favorite-categories` | PUT | Replace favorites list |
| `/api/registered/dashboard` | GET | TWA dashboard read model from DB |
| `/api/registered/marketplace` | GET | Active subscription marketplace from DB |
| `/api/registered/companies` | GET | Partner companies with user points and level progress |
| `/api/registered/wallet` | GET | User wallet cards and total point balance |
| `/api/registered/qr` | GET | Current-user QR payload |
| `/api/registered/history` | GET | Loyalty operation history and archived subscriptions |
| `/api/registered/subscriptions/active` | GET | Active user subscriptions |
| `/api/registered/subscriptions/archive` | GET | Expired/canceled subscriptions |
| `/api/registered/subscriptions/:uuid/activate` | POST | Activate subscription in the current non-payment flow |

## Backend service responsibilities

- `AuthService`: registration/login/refresh/password changes/account freeze/reactivate, login security metadata, email-change token confirmation.
- `AdminService`: account creation, safe user CRUD, categories/company/subscription CRUD, promo/referral controls, analytics, audit stream, and DB snapshot management.
- `RegisteredService`: onboarding, profile preferences, category/favorites management, promo/referral redemption, plus TWA marketplace, wallet, company levels, history, and subscription activation read models.
- `MaintenanceStateService`: in-memory restore process state machine for live admin status.
- `MaintenanceGuard`: global API lock while restore is active.

## Data-rich admin profile payload

`GET /api/admin/users/:uuid` includes:

- base user fields (`uuid`, `email`, `role`, `accountStatus`, timestamps)
- `favoriteCategories`
- `companyLinks` (with balances)
- `subscriptions` (with linked subscription metadata)
- `refreshTokens` (latest 20)
- `oauthAccounts`
- `loginEvents` (latest login metadata)
- `loyaltyTransactions` (history of points balance events)
- `loginRisk` (`primaryCountry`, `latestCountry`, `unusualCountries`, `shouldReview`)

This powers `/admin/users/[uuid]` as a single profile workspace.

## Company client analytics payload

`GET /api/admin/company-users/:uuid/clients` returns:

- paginated `items` + `total/page/limit/totalPages`
- client identity fields (`userUuid`, `name`, `email`, status)
- loyalty stats (`balance`, `totalEarnedPoints`, `totalSpentPoints`)
- `currentLevel` calculated by **total spent points** against company level thresholds

Sorting options: `name`, `email`, `balance`, `earned`, `spent`, `level`, `updatedAt`.

## TWA database-backed payloads

The registered API now exposes database-backed read models for the mobile app:

- Marketplace combines active `Subscription` plans with `Company`, `Category`, and current ownership flags.
- Marketplace category filters only include categories that currently have active subscription plans.
- Companies include user point balance, earned/spent totals, expiring points, and level progress from `CompanyLevelRule`.
- Companies include active saved locations with coordinates and working-hour metadata for map rendering, search, open-now filtering, and route generation.
- Wallet is derived from company point balances and only includes companies where the user has activity.
- History combines recent `LoyaltyTransaction` rows with expired/canceled `UserSubscription` records.
- Activation creates `UserSubscription ACTIVE` and ensures a `UserCompany` link exists for company-bound subscriptions.
- QR returns a UUID-based payload; the TWA client renders the actual QR locally without server-side storage.

## Growth flows

### First-run onboarding

1. New registered CLIENT users are redirected to `/onboarding`.
2. The tutorial explains favorite categories, geolocation, QR, points, subscriptions, and map usage.
3. The user can open the existing favorite-category selector from the tutorial.
4. `POST /api/registered/onboarding/complete` stores completion and geolocation prompt timestamps.
5. `POST /api/registered/onboarding/skip` stores skip timestamp and lets the user continue immediately.

### Promo code redemption

1. Admin creates a code in `/admin/growth`.
2. User enters the code in `/settings`.
3. Backend validates active state, expiry, max redemption count, and per-user duplicate redemption.
4. `POINTS` codes create an earning `LoyaltyTransaction` and increment a user/company balance through the configured fallback ledger company.
5. `SUBSCRIPTION` codes create an active `UserSubscription` with auto-renew disabled.

### Referral campaign

1. Admin edits campaign title, inviter bonus, invited bonus, and active state in `/admin/growth`.
2. Each user profile lazily creates or reuses a stable referral code.
3. Redeeming a friend code rewards both users and records the invite as `REWARDED`.

## Email change flow (admin-assisted)

1. Admin opens `/admin/users/[uuid]` and enters a new verified email.
2. UI calls `POST /api/admin/users/:uuid/email-change-request`.
3. Backend creates one-time token (`EmailChangeRequest`) and sends confirmation link.
4. User opens `/email-change/confirm?token=...` and confirms.
5. Backend validates token and updates `User.email`.

## Login anomaly metadata flow

1. User signs in through `POST /api/auth/login`.
2. Backend stores `LoginEvent` (ip/country/city/userAgent/device/requestId).
3. Admin profile response aggregates latest events and computes `loginRisk`.
4. `/admin/users/[uuid]` shows anomalies to support manual account recovery decisions.

## Restore guard behavior

- While restore is active, API rejects regular operations with `503` and code `MAINTENANCE_RESTORE`.
- Allowed during maintenance:
- `GET /api/health`
- `POST /api/admin/backups/:backupId/restore`
- `GET /api/admin/backups/restore-status`
- Restore emits internal stages: `REQUESTED`, `READING_SNAPSHOT`, `VALIDATING_PAYLOAD`, `WAITING_DB_LOCK`, `CLEARING_TABLES`, `RESTORING_TABLES`, `RESETTING_SEQUENCES`, `FINALIZING`, `DONE`, `FAILED`.
