CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "User"
ADD COLUMN "uuid" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

ALTER TABLE "Subscription"
ADD COLUMN "uuid" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX "Subscription_uuid_key" ON "Subscription"("uuid");
