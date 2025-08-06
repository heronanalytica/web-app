-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "companyProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
