-- CreateEnum
CREATE TYPE "AuditWorkspace" AS ENUM ('MANAGER', 'DEVELOPER');

-- CreateEnum
CREATE TYPE "AuditLevel" AS ENUM ('INFO', 'WARN', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('SECURITY', 'USER', 'SUBSCRIPTION', 'BILLING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('SUCCESS', 'BLOCKED');

-- CreateTable
CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "workspace" "AuditWorkspace" NOT NULL DEFAULT 'MANAGER',
  "level" "AuditLevel" NOT NULL DEFAULT 'INFO',
  "category" "AuditCategory" NOT NULL,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "actorUserId" INTEGER,
  "actorLabel" TEXT NOT NULL,
  "targetUserId" INTEGER,
  "targetLabel" TEXT,
  "targetEmail" TEXT,
  "targetUuid" TEXT,
  "result" "AuditResult" NOT NULL DEFAULT 'SUCCESS',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "ipAddress" TEXT,
  "countryCode" TEXT,
  "linkUrl" TEXT,
  "linkLabel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEvent_workspace_createdAt_idx" ON "AuditEvent"("workspace", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_category_createdAt_idx" ON "AuditEvent"("category", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_level_createdAt_idx" ON "AuditEvent"("level", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_targetUserId_createdAt_idx" ON "AuditEvent"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_targetEmail_idx" ON "AuditEvent"("targetEmail");

-- CreateIndex
CREATE INDEX "AuditEvent_targetUuid_idx" ON "AuditEvent"("targetUuid");

-- AddForeignKey
ALTER TABLE "AuditEvent"
  ADD CONSTRAINT "AuditEvent_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent"
  ADD CONSTRAINT "AuditEvent_targetUserId_fkey"
  FOREIGN KEY ("targetUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
