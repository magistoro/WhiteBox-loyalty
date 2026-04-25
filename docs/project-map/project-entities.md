# WhiteBox - Core Entities and Types

## Main database entities (Prisma)

- `User`
- `Category`
- `Company`
- `Subscription`
- `UserFavoriteCategory`
- `UserCompany`
- `UserSubscription`
- `RefreshToken`
- `OAuthAccount`
- `EmailChangeRequest`
- `LoginEvent`
- `LoyaltyTransaction`
- `AuditEvent`
- `CompanyCategory`
- `CompanyLevelRule`

## Enum highlights

- `UserRole`: `CLIENT | COMPANY | ADMIN`
- `AccountStatus`: `ACTIVE | FROZEN_PENDING_DELETION`
- `SubscriptionStatus`: `ACTIVE | EXPIRED | CANCELED`
- `LoyaltyTransactionType`: `EARN | SPEND`
- `LoyaltyTransactionStatus`: `ACTIVE | EXPIRED`
- `SubscriptionSpendPolicy`: `EXCLUDE | INCLUDE_NO_BONUS | INCLUDE_WITH_BONUS`
- `AuditWorkspace`: `MANAGER | DEVELOPER`
- `AuditLevel`: `INFO | WARN | CRITICAL`
- `AuditCategory`: `SECURITY | USER | SUBSCRIPTION | BILLING | SYSTEM`
- `AuditResult`: `SUCCESS | BLOCKED`

## Core relationships

- `Category 1:N Company`
- `Category 1:N Subscription` (optional link)
- `Company 1:N Subscription` (optional link)
- `User 1:N UserFavoriteCategory`
- `User 1:N UserCompany`
- `User 1:N UserSubscription`
- `User 1:N RefreshToken`
- `User 1:N OAuthAccount`
- `User 1:N LoginEvent`
- `User 1:N LoyaltyTransaction`
- `Company 1:N LoyaltyTransaction`
- `User 1:N EmailChangeRequest`
- `User 1:1 Company` via owner relation (`managedCompany`)
- `Company N:M Category` via `CompanyCategory`
- `Company 1:N CompanyLevelRule`
- `User 1:N AuditEvent` as actor
- `User 1:N AuditEvent` as target

## Backup payload entities

DB snapshot backup (`/api/admin/backups`) serializes all operational tables:

- `User`
- `Category`
- `Company`
- `Subscription`
- `CompanyCategory`
- `CompanyLevelRule`
- `UserFavoriteCategory`
- `UserCompany`
- `UserSubscription`
- `RefreshToken`
- `OAuthAccount`
- `LoginEvent`
- `EmailChangeRequest`
- `LoyaltyTransaction`
- `AuditEvent`

## Admin profile payload shape

`GET /api/admin/users/:uuid` returns a rich object:

- base user fields (`id`, `uuid`, `email`, `role`, `accountStatus`, timestamps)
- `hasPassword` (derived flag)
- `favoriteCategories[]`
- `companyLinks[]`
- `subscriptions[]`
- `refreshTokens[]` (latest 20)
- `oauthAccounts[]`
- `loginEvents[]` (latest 25)
- `loyaltyTransactions[]` (latest 50)
- `loginRisk` summary object

## Frontend admin types

Defined in `src/lib/api/admin-client.ts`:

- `AdminUserRow` - compact list row for `/admin/users`
- `AdminUserDetail` - full profile for `/admin/users/[uuid]`
- `AdminUpdateUserInput` - patch payload for full CRUD updates

## TWA mock entities

For current mobile surfaces, mock-driven domain helpers still exist in `src/lib/mockData.ts`:

- categories
- companies
- subscriptions
- activeSubscriptions
- transactions
