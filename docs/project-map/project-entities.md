# WhiteBox - Core Entities and Types

## Prisma models

Current source of truth: `prisma/schema.prisma`.

Identity and access:

- `User`
- `RefreshToken`
- `OAuthAccount`
- `LoginEvent`
- `EmailChangeRequest`
- `AuditEvent`

Catalog and partners:

- `Category`
- `Company`
- `CompanyCategory`
- `CompanyLocation`
- `CompanyLevelRule`
- `Subscription`

Client state and ledger:

- `UserFavoriteCategory`
- `UserProfilePreference`
- `UserCompany`
- `UserSubscription`
- `LoyaltyTransaction`

Growth:

- `PromoCode`
- `PromoCodeRedemption`
- `ReferralCampaign`
- `ReferralInvite`

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

## Relationship map

- `User 1:N RefreshToken`, `OAuthAccount`, `LoginEvent`, `LoyaltyTransaction`, `PromoCodeRedemption`.
- `User 1:1 UserProfilePreference`.
- `User N:M Category` through `UserFavoriteCategory`.
- `User N:M Company` through `UserCompany`.
- `User N:M Subscription` through `UserSubscription`.
- `User 1:1 Company` through `Company.ownerUserId`.
- `User 1:N ReferralInvite` as inviter; `User 1:1 ReferralInvite` as invited user.
- `User 1:N AuditEvent` as actor and as target.
- `Category 1:N Company` as primary category.
- `Company N:M Category` through `CompanyCategory`.
- `Company 1:N CompanyLocation`, `CompanyLevelRule`, `Subscription`, `LoyaltyTransaction`.
- `Company 1:N PromoCode` for points rewards.
- `Company 1:N ReferralCampaign` for referral bonus company.
- `Subscription 1:N PromoCode` for activation promos.
- `PromoCode 1:N PromoCodeRedemption`.

## Company-specific points

Points are not universal. They belong to a company:

- `UserCompany.balance` is the current company balance.
- `LoyaltyTransaction.companyId` records the company for every earn/spend event.
- Promo/referral point rewards must resolve to a company and then update the same ledger/balance system.

## Location model

`CompanyLocation` stores real branches:

- `address`, `city`, coordinates and geocoder precision/metadata.
- `openTime`, `closeTime`, `workingDays` for open-now filtering.
- `isMain` for primary branch display.
- `isActive` for hiding branches from the TWA map and partner cards.

Duplicate addresses are rejected server-side per company after normalization/geocoder resolution.

## Backup payload

DB backups serialize operational tables including users, catalog, locations, subscriptions, growth models, sessions, audit, loyalty and history. Restore is destructive and protected by maintenance mode.
