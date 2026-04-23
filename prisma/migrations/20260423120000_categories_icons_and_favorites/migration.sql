-- Add icon to categories
ALTER TABLE "Category"
ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'Circle';

-- User favorite categories
CREATE TABLE "UserFavoriteCategory" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserFavoriteCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserFavoriteCategory_userId_categoryId_key"
ON "UserFavoriteCategory"("userId", "categoryId");

CREATE INDEX "UserFavoriteCategory_categoryId_idx"
ON "UserFavoriteCategory"("categoryId");

ALTER TABLE "UserFavoriteCategory"
ADD CONSTRAINT "UserFavoriteCategory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserFavoriteCategory"
ADD CONSTRAINT "UserFavoriteCategory_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed/normalize categories (20+ items with icons)
INSERT INTO "Category" ("slug", "name", "description", "icon", "updatedAt")
VALUES
  ('coffee', 'Coffee', 'Coffee shops and roasteries', 'Coffee', CURRENT_TIMESTAMP),
  ('barber', 'Barber', 'Barber shops and grooming', 'Scissors', CURRENT_TIMESTAMP),
  ('food', 'Food', 'Restaurants and casual dining', 'UtensilsCrossed', CURRENT_TIMESTAMP),
  ('fitness', 'Fitness', 'Gyms and workout studios', 'Dumbbell', CURRENT_TIMESTAMP),
  ('beauty', 'Beauty', 'Beauty and personal care', 'Sparkles', CURRENT_TIMESTAMP),
  ('pharmacy', 'Pharmacy', 'Pharmacies and wellness', 'Pill', CURRENT_TIMESTAMP),
  ('retail', 'Retail', 'Retail stores and boutiques', 'ShoppingBag', CURRENT_TIMESTAMP),
  ('other', 'Other', 'Other partner categories', 'Grid2x2', CURRENT_TIMESTAMP),
  ('electronics', 'Electronics', 'Gadgets and electronics stores', 'Smartphone', CURRENT_TIMESTAMP),
  ('books', 'Books', 'Books and stationery', 'BookOpen', CURRENT_TIMESTAMP),
  ('travel', 'Travel', 'Travel and booking services', 'Plane', CURRENT_TIMESTAMP),
  ('pet-care', 'Pet Care', 'Pets and vet services', 'PawPrint', CURRENT_TIMESTAMP),
  ('kids', 'Kids', 'Kids products and activities', 'Baby', CURRENT_TIMESTAMP),
  ('home', 'Home', 'Home improvement and decor', 'Home', CURRENT_TIMESTAMP),
  ('auto', 'Auto', 'Auto services and products', 'Car', CURRENT_TIMESTAMP),
  ('health', 'Health', 'Clinics and health services', 'HeartPulse', CURRENT_TIMESTAMP),
  ('education', 'Education', 'Courses and education', 'GraduationCap', CURRENT_TIMESTAMP),
  ('entertainment', 'Entertainment', 'Events and entertainment', 'Film', CURRENT_TIMESTAMP),
  ('delivery', 'Delivery', 'Courier and delivery', 'Truck', CURRENT_TIMESTAMP),
  ('services', 'Services', 'Everyday services', 'Wrench', CURRENT_TIMESTAMP),
  ('fashion', 'Fashion', 'Fashion and apparel', 'Shirt', CURRENT_TIMESTAMP),
  ('sports', 'Sports', 'Sports clubs and shops', 'Trophy', CURRENT_TIMESTAMP)
ON CONFLICT ("slug")
DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "icon" = EXCLUDED."icon",
  "updatedAt" = CURRENT_TIMESTAMP;
