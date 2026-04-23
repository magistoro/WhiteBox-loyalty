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

## Enum highlights

- `UserRole`: `CLIENT | COMPANY | ADMIN`
- `AccountStatus`: `ACTIVE | FROZEN_PENDING_DELETION`
- `SubscriptionStatus`: `ACTIVE | EXPIRED | CANCELED`
- `LoyaltyTransactionType`: `PURCHASE | REFUND | MANUAL_CREDIT | MANUAL_DEBIT | ADJUSTMENT`
- `LoyaltyTransactionStatus`: `PENDING | COMPLETED | CANCELED`

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
