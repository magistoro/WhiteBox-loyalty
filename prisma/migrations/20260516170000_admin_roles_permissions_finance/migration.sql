ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPPORT';

CREATE TYPE "PermissionScope" AS ENUM (
  'USERS',
  'COMPANIES',
  'COMPANY_VERIFICATIONS',
  'FINANCE',
  'SUPPORT',
  'AUDIT',
  'DATABASE',
  'TELEGRAM',
  'SETTINGS'
);

CREATE TYPE "FinanceOperationType" AS ENUM (
  'PAYOUT_REQUEST',
  'PAYOUT_APPROVAL',
  'MANUAL_ADJUSTMENT',
  'REFUND'
);

CREATE TYPE "FinanceOperationStatus" AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PAID',
  'CANCELED'
);

CREATE TABLE "AdminUserPermission" (
  "id" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "scope" "PermissionScope" NOT NULL,
  "canView" BOOLEAN NOT NULL DEFAULT false,
  "canEdit" BOOLEAN NOT NULL DEFAULT false,
  "canApprove" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUserPermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUserPermission_userId_scope_key" ON "AdminUserPermission"("userId", "scope");
CREATE INDEX "AdminUserPermission_scope_idx" ON "AdminUserPermission"("scope");
ALTER TABLE "AdminUserPermission" ADD CONSTRAINT "AdminUserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FinanceOperation" (
  "id" TEXT NOT NULL,
  "uuid" TEXT NOT NULL,
  "type" "FinanceOperationType" NOT NULL,
  "status" "FinanceOperationStatus" NOT NULL DEFAULT 'DRAFT',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "companyId" INTEGER,
  "title" TEXT NOT NULL,
  "details" TEXT,
  "requestedById" INTEGER,
  "approvedById" INTEGER,
  "requestedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceOperation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinanceOperation_uuid_key" ON "FinanceOperation"("uuid");
CREATE INDEX "FinanceOperation_status_createdAt_idx" ON "FinanceOperation"("status", "createdAt");
CREATE INDEX "FinanceOperation_companyId_createdAt_idx" ON "FinanceOperation"("companyId", "createdAt");
CREATE INDEX "FinanceOperation_requestedById_createdAt_idx" ON "FinanceOperation"("requestedById", "createdAt");
ALTER TABLE "FinanceOperation" ADD CONSTRAINT "FinanceOperation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinanceOperation" ADD CONSTRAINT "FinanceOperation_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinanceOperation" ADD CONSTRAINT "FinanceOperation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
