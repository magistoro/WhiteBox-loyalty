ALTER TABLE "Subscription"
ADD COLUMN "renewalValue" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "renewalUnit" TEXT NOT NULL DEFAULT 'month',
ADD COLUMN "promoBonusDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "promoEndsAt" TIMESTAMP(3);

CREATE TABLE "CompanyCategory" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyCategory_companyId_categoryId_key" ON "CompanyCategory"("companyId", "categoryId");
CREATE INDEX "CompanyCategory_categoryId_idx" ON "CompanyCategory"("categoryId");

ALTER TABLE "CompanyCategory"
ADD CONSTRAINT "CompanyCategory_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyCategory"
ADD CONSTRAINT "CompanyCategory_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "CompanyCategory" ("companyId", "categoryId")
SELECT "id", "categoryId" FROM "Company"
ON CONFLICT ("companyId", "categoryId") DO NOTHING;
