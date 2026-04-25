CREATE TYPE "SubscriptionSpendPolicy" AS ENUM ('EXCLUDE', 'INCLUDE_NO_BONUS', 'INCLUDE_WITH_BONUS');

ALTER TABLE "Company"
ADD COLUMN "subscriptionSpendPolicy" "SubscriptionSpendPolicy" NOT NULL DEFAULT 'EXCLUDE';

CREATE TABLE "CompanyLevelRule" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "levelName" TEXT NOT NULL,
  "minTotalSpend" DECIMAL(12,2) NOT NULL,
  "cashbackPercent" DECIMAL(5,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyLevelRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompanyLevelRule_companyId_sortOrder_idx" ON "CompanyLevelRule"("companyId", "sortOrder");
CREATE UNIQUE INDEX "CompanyLevelRule_companyId_sortOrder_key" ON "CompanyLevelRule"("companyId", "sortOrder");

ALTER TABLE "CompanyLevelRule"
ADD CONSTRAINT "CompanyLevelRule_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "CompanyLevelRule" ("companyId", "levelName", "minTotalSpend", "cashbackPercent", "sortOrder", "updatedAt")
SELECT c."id", 'Bronze', 0, 0, 1, CURRENT_TIMESTAMP
FROM "Company" c
WHERE NOT EXISTS (
  SELECT 1 FROM "CompanyLevelRule" r WHERE r."companyId" = c."id"
);
