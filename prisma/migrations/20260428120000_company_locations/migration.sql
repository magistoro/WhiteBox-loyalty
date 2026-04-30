CREATE TABLE "CompanyLocation" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "companyId" INTEGER NOT NULL,
    "title" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "precision" TEXT,
    "geocoderResponse" JSONB,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyLocation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyLocation_uuid_key" ON "CompanyLocation"("uuid");
CREATE INDEX "CompanyLocation_companyId_isActive_idx" ON "CompanyLocation"("companyId", "isActive");

ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
