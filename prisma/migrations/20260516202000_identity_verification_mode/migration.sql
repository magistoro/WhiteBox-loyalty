CREATE TYPE "IdentityVerificationMode" AS ENUM ('FULL', 'DEFERRED');

ALTER TABLE "Company"
  ADD COLUMN "identityVerificationMode" "IdentityVerificationMode" NOT NULL DEFAULT 'FULL',
  ADD COLUMN "identityVerificationCompleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "legalFirstName" TEXT,
  ADD COLUMN "legalMiddleName" TEXT,
  ADD COLUMN "legalLastName" TEXT,
  ADD COLUMN "birthDate" TIMESTAMP(3);

ALTER TABLE "CompanyVerificationApplication"
  ADD COLUMN "identityVerificationMode" "IdentityVerificationMode" NOT NULL DEFAULT 'FULL',
  ADD COLUMN "legalFirstName" TEXT,
  ADD COLUMN "legalMiddleName" TEXT,
  ADD COLUMN "legalLastName" TEXT,
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "passportEncryptedPayload" TEXT,
  ADD COLUMN "passportEncryptionIv" TEXT,
  ADD COLUMN "passportEncryptionTag" TEXT,
  ADD COLUMN "verificationDeferralReason" TEXT;
