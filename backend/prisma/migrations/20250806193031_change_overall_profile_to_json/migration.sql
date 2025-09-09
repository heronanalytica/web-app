/*
  Warnings:

  - The `generatedMarketingTone` column on the `CompanyProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `generatedOverallProfile` column on the `CompanyProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CompanyProfile" DROP COLUMN "generatedMarketingTone",
ADD COLUMN     "generatedMarketingTone" JSONB,
DROP COLUMN "generatedOverallProfile",
ADD COLUMN     "generatedOverallProfile" JSONB;
