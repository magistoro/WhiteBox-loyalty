CREATE TYPE "CompanyEmploymentType" AS ENUM ('SELF_EMPLOYED', 'INDIVIDUAL_ENTREPRENEUR');
CREATE TYPE "CompanyVerificationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED');

ALTER TABLE "Company"
  ADD COLUMN "employmentType" "CompanyEmploymentType",
  ADD COLUMN "verificationStatus" "CompanyVerificationStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "legalFullName" TEXT,
  ADD COLUMN "legalInn" TEXT,
  ADD COLUMN "legalOgrnip" TEXT,
  ADD COLUMN "legalRegistrationRegion" TEXT,
  ADD COLUMN "payoutBankName" TEXT,
  ADD COLUMN "payoutBik" TEXT,
  ADD COLUMN "payoutAccount" TEXT,
  ADD COLUMN "payoutCorrespondentAccount" TEXT,
  ADD COLUMN "payoutCardLast4" TEXT,
  ADD COLUMN "passportVerificationStatus" "CompanyVerificationStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "passportLast4" TEXT,
  ADD COLUMN "passportDataDeletedAt" TIMESTAMP(3),
  ADD COLUMN "verificationSubmittedAt" TIMESTAMP(3),
  ADD COLUMN "verificationReviewedAt" TIMESTAMP(3);

CREATE INDEX "Company_verificationStatus_verificationSubmittedAt_idx" ON "Company"("verificationStatus", "verificationSubmittedAt");

CREATE TABLE "CompanyVerificationApplication" (
  "id" SERIAL NOT NULL,
  "uuid" TEXT NOT NULL,
  "companyId" INTEGER,
  "employmentType" "CompanyEmploymentType" NOT NULL,
  "status" "CompanyVerificationStatus" NOT NULL DEFAULT 'SUBMITTED',
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactTelegram" TEXT,
  "companyName" TEXT NOT NULL,
  "businessCategory" TEXT NOT NULL,
  "legalFullName" TEXT NOT NULL,
  "legalInn" TEXT NOT NULL,
  "legalOgrnip" TEXT,
  "legalRegistrationRegion" TEXT,
  "payoutBankName" TEXT,
  "payoutBik" TEXT,
  "payoutAccount" TEXT,
  "payoutCorrespondentAccount" TEXT,
  "payoutCardLast4" TEXT,
  "passportLast4" TEXT,
  "passportDataDeletedAt" TIMESTAMP(3),
  "consentAcceptedAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "adminNotifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyVerificationApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyVerificationApplication_uuid_key" ON "CompanyVerificationApplication"("uuid");
CREATE INDEX "CompanyVerificationApplication_status_createdAt_idx" ON "CompanyVerificationApplication"("status", "createdAt");
CREATE INDEX "CompanyVerificationApplication_contactEmail_idx" ON "CompanyVerificationApplication"("contactEmail");
CREATE INDEX "CompanyVerificationApplication_legalInn_idx" ON "CompanyVerificationApplication"("legalInn");
ALTER TABLE "CompanyVerificationApplication" ADD CONSTRAINT "CompanyVerificationApplication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "TelegramLinkToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TelegramLinkToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TelegramLinkToken_token_key" ON "TelegramLinkToken"("token");
CREATE INDEX "TelegramLinkToken_userId_expiresAt_idx" ON "TelegramLinkToken"("userId", "expiresAt");
ALTER TABLE "TelegramLinkToken" ADD CONSTRAINT "TelegramLinkToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;