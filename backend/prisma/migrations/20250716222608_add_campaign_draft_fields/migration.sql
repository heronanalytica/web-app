-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "currentStep" INTEGER,
ADD COLUMN     "lastSavedAt" TIMESTAMP(3);
