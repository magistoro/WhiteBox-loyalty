# WhiteBox - Core Entities and Types

## Main database entities (Prisma)

- `User`
- `Category`
- `Company`
- `Subscription`
- `CompanyLocation`
- `UserFavoriteCategory`
- `UserProfilePreference`
- `UserCompany`
- `UserSubscription`
- `PromoCode`
- `PromoCodeRedemption`
- `ReferralCampaign`
- `ReferralInvite`
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
- `PromoCodeRewardType`: `POINTS | SUBSCRIPTION`
- `ReferralInviteStatus`: `CREATED | REDEEMED | REWARDED`

## Core relationships

- `Category 1:N Company`
- `Category 1:N Subscription` (optional link)
- `Company 1:N Subscription` (optional link)
- `User 1:N UserFavoriteCategory`
- `User 1:1 UserProfilePreference`
- `User 1:N UserCompany`
- `User 1:N UserSubscription`
- `User 1:N PromoCodeRedemption`
- `User 1:N ReferralInvite` as inviter
- `User 1:1 ReferralInvite` as invited user
- `User 1:N RefreshToken`
- `User 1:N OAuthAccount`
- `User 1:N LoginEvent`
- `User 1:N LoyaltyTransaction`
- `Company 1:N LoyaltyTransaction`
- `User 1:N EmailChangeRequest`
- `User 1:1 Company` via owner relation (`managedCompany`)
- `Company N:M Category` via `CompanyCategory`
- `Company 1:N CompanyLocation`
- `Company 1:N CompanyLevelRule`
- `Subscription 1:N PromoCode` for subscription activation promos
- `PromoCode 1:N PromoCodeRedemption`
- `User 1:N AuditEvent` as actor
- `User 1:N AuditEvent` as target

## Growth and onboarding model

- `UserProfilePreference` stores first-run onboarding completion/skip timestamps, geolocation prompt timestamp, profile visibility, marketing opt-in, and whether activity stats can be shown.
- `PromoCode` supports two reward modes: bonus points (`POINTS`) and subscription activation (`SUBSCRIPTION`).
- `PromoCodeRedemption` prevents a user from redeeming the same code more than once.
- `ReferralCampaign` stores mutable admin-controlled invite-a-friend terms: campaign title, inviter points, invited points, and active flag.
- `ReferralInvite` stores a stable user referral code and redemption/reward status.

## Location model

`CompanyLocation` represents a real company branch:

- belongs to one `Company`
- stores normalized/geocoded `address`, optional `city`, `latitude`, `longitude`, `precision`, and raw geocoder metadata
- stores `openTime`, `closeTime`, and `workingDays` for TWA open-now filters and selected-point cards
- uses `isMain` for primary branch ordering and `isActive` for hiding closed/inactive branches from the registered API
- powers TWA map markers, clustering, wallet address blocks, route links, and admin company location management

## Backup payload entities

DB snapshot backup (`/api/admin/backups`) serializes all operational tables:

- `User`
- `Category`
- `Company`
- `CompanyLocation`
- `Subscription`
- `CompanyCategory`
- `CompanyLevelRule`
- `UserFavoriteCategory`
- `UserProfilePreference`
- `UserCompany`
- `UserSubscription`
- `PromoCode`
- `PromoCodeRedemption`
- `ReferralCampaign`
- `ReferralInvite`
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

## TWA data source status

User-facing TWA surfaces now use registered API read models backed by PostgreSQL. Legacy mock helpers may still exist as static placeholders, but marketplace, companies, wallet, map, QR, history, profile, onboarding, promo codes, and referral flows are API-driven.
