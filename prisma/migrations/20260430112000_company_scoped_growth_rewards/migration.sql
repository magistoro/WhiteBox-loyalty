ALTER TABLE "PromoCode" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "ReferralCampaign" ADD COLUMN "bonusCompanyId" INTEGER;

ALTER TABLE "PromoCode"
  ADD CONSTRAINT "PromoCode_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReferralCampaign"
  ADD CONSTRAINT "ReferralCampaign_bonusCompanyId_fkey"
  FOREIGN KEY ("bonusCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "PromoCode_companyId_idx" ON "PromoCode"("companyId");
CREATE INDEX "ReferralCampaign_bonusCompanyId_idx" ON "ReferralCampaign"("bonusCompanyId");