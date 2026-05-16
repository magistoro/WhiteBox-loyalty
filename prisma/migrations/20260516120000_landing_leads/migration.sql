CREATE TYPE "LandingLeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED', 'SPAM');
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "LandingLead" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "contact" TEXT NOT NULL,
    "business" TEXT,
    "message" TEXT NOT NULL,
    "status" "LandingLeadStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'landing',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fingerprint" TEXT NOT NULL,
    "spamScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "LandingLead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "leadId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'telegram',
    "recipientRole" TEXT NOT NULL,
    "recipientChatId" TEXT NOT NULL,
    "recipientLabel" TEXT,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "telegramMessageId" INTEGER,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LandingLead_uuid_key" ON "LandingLead"("uuid");
CREATE INDEX "LandingLead_status_createdAt_idx" ON "LandingLead"("status", "createdAt");
CREATE INDEX "LandingLead_contact_idx" ON "LandingLead"("contact");
CREATE INDEX "LandingLead_fingerprint_createdAt_idx" ON "LandingLead"("fingerprint", "createdAt");
CREATE INDEX "NotificationDelivery_leadId_idx" ON "NotificationDelivery"("leadId");
CREATE INDEX "NotificationDelivery_status_nextRetryAt_idx" ON "NotificationDelivery"("status", "nextRetryAt");
CREATE INDEX "NotificationDelivery_recipientRole_createdAt_idx" ON "NotificationDelivery"("recipientRole", "createdAt");

ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "LandingLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
