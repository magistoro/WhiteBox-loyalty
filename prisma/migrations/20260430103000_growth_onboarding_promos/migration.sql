CREATE TYPE "PromoCodeRewardType" AS ENUM ('POINTS', 'SUBSCRIPTION');
CREATE TYPE "ReferralInviteStatus" AS ENUM ('CREATED', 'REDEEMED', 'REWARDED');

CREATE TABLE "UserProfilePreference" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE,
  "onboardingCompletedAt" TIMESTAMP(3),
  "onboardingSkippedAt" TIMESTAMP(3),
  "geolocationPromptedAt" TIMESTAMP(3),
  "profileVisibility" TEXT NOT NULL DEFAULT 'PRIVATE',
  "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
  "showActivityStats" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserProfilePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PromoCode" (
  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "rewardType" "PromoCodeRewardType" NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "subscriptionId" INTEGER,
  "maxRedemptions" INTEGER,
  "expiresAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromoCode_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PromoCodeRedemption" (
  "id" SERIAL PRIMARY KEY,
  "promoCodeId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoCodeRedemption_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PromoCodeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PromoCodeRedemption_promoCodeId_userId_key" ON "PromoCodeRedemption"("promoCodeId", "userId");
CREATE INDEX "PromoCodeRedemption_userId_idx" ON "PromoCodeRedemption"("userId");

CREATE TABLE "ReferralCampaign" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL DEFAULT 'Invite a friend',
  "inviterBonusPoints" INTEGER NOT NULL DEFAULT 250,
  "invitedBonusPoints" INTEGER NOT NULL DEFAULT 250,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ReferralInvite" (
  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "inviterUserId" INTEGER NOT NULL,
  "invitedUserId" INTEGER UNIQUE,
  "status" "ReferralInviteStatus" NOT NULL DEFAULT 'CREATED',
  "rewardedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralInvite_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ReferralInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ReferralInvite_inviterUserId_idx" ON "ReferralInvite"("inviterUserId");

INSERT INTO "ReferralCampaign" ("title", "inviterBonusPoints", "invitedBonusPoints", "isActive", "updatedAt")
VALUES ('Invite a friend', 250, 250, true, CURRENT_TIMESTAMP);
