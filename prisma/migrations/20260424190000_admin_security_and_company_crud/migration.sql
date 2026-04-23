CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'SPEND');
CREATE TYPE "LoyaltyTransactionStatus" AS ENUM ('ACTIVE', 'EXPIRED');

ALTER TABLE "Company" ADD COLUMN "ownerUserId" INTEGER;
CREATE UNIQUE INDEX "Company_ownerUserId_key" ON "Company"("ownerUserId");
ALTER TABLE "Company"
ADD CONSTRAINT "Company_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "LoginEvent" (
  "id" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "countryCode" TEXT,
  "city" TEXT,
  "userAgent" TEXT,
  "deviceLabel" TEXT,
  "requestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoginEvent_userId_createdAt_idx" ON "LoginEvent"("userId", "createdAt");
ALTER TABLE "LoginEvent"
ADD CONSTRAINT "LoginEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoyaltyTransaction" (
  "id" SERIAL NOT NULL,
  "uuid" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "companyId" INTEGER NOT NULL,
  "type" "LoyaltyTransactionType" NOT NULL,
  "status" "LoyaltyTransactionStatus" NOT NULL DEFAULT 'ACTIVE',
  "amount" INTEGER NOT NULL,
  "description" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LoyaltyTransaction_uuid_key" ON "LoyaltyTransaction"("uuid");
CREATE INDEX "LoyaltyTransaction_userId_occurredAt_idx" ON "LoyaltyTransaction"("userId", "occurredAt");
CREATE INDEX "LoyaltyTransaction_companyId_occurredAt_idx" ON "LoyaltyTransaction"("companyId", "occurredAt");
ALTER TABLE "LoyaltyTransaction"
ADD CONSTRAINT "LoyaltyTransaction_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyTransaction"
ADD CONSTRAINT "LoyaltyTransaction_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
