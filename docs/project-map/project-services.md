# WhiteBox - Services and Data Access

## Current data strategy

- TWA screens still use `src/lib/mockData.ts` for part of the catalog and wallet UI.
- Persistent backend model is in Prisma (`prisma/schema.prisma`) on PostgreSQL.
- Auth, admin, and registered APIs run in NestJS (`apps/api`).

## Frontend API clients

- `src/lib/api/auth-client.ts` - auth session and account actions.
- `src/lib/api/categories-client.ts` - registered category/favorites endpoints.
- `src/lib/api/admin-client.ts` - admin directory, secure user management, categories CRUD, company/subscription CRUD.

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
| `/api/admin/company-users/:uuid/subscriptions` | POST | Create subscription for company (company required) |
| `/api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` | PATCH | Update company subscription |
| `/api/admin/company-users/:uuid/subscriptions/:subscriptionUuid` | DELETE | Delete company subscription |
| `/api/admin/subscriptions/stats` | GET | Subscription counters |
| `/api/admin/subscriptions/:uuid` | GET | Subscription lookup |

## Registered API surface (`/api/registered/*`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/registered/profile` | GET | Current client payload |
| `/api/registered/categories` | GET | Category catalog + favorite flag |
| `/api/registered/favorite-categories` | GET | Favorite category slugs |
| `/api/registered/favorite-categories` | PUT | Replace favorites list |

## Backend service responsibilities

- `AuthService`: registration/login/refresh/password changes/account freeze/reactivate, login security metadata, email-change token confirmation.
- `AdminService`: account creation, safe user CRUD, categories/company/subscription CRUD, analytics and lookups.
- `RegisteredService`: category and favorites management for CLIENT role.

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
