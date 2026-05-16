CREATE TYPE "PassportFileStatus" AS ENUM ('ACTIVE', 'DELETED', 'MISSING');

CREATE TABLE "PassportVerificationFile" (
  "id" SERIAL NOT NULL,
  "uuid" TEXT NOT NULL,
  "applicationId" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "originalName" TEXT,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "sha256" TEXT NOT NULL,
  "encryptionIv" TEXT NOT NULL,
  "encryptionTag" TEXT NOT NULL,
  "status" "PassportFileStatus" NOT NULL DEFAULT 'ACTIVE',
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "missingAt" TIMESTAMP(3),

  CONSTRAINT "PassportVerificationFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PassportVerificationFile_uuid_key" ON "PassportVerificationFile"("uuid");
CREATE UNIQUE INDEX "PassportVerificationFile_storageKey_key" ON "PassportVerificationFile"("storageKey");
CREATE INDEX "PassportVerificationFile_applicationId_status_idx" ON "PassportVerificationFile"("applicationId", "status");
CREATE INDEX "PassportVerificationFile_status_uploadedAt_idx" ON "PassportVerificationFile"("status", "uploadedAt");

ALTER TABLE "PassportVerificationFile"
  ADD CONSTRAINT "PassportVerificationFile_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "CompanyVerificationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
