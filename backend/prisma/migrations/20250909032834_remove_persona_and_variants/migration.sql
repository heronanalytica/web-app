/*
  Warnings:

  - You are about to drop the column `personaId` on the `CampaignRecipient` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `CampaignRecipient` table. All the data in the column will be lost.
  - You are about to drop the `CampaignEmailVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Persona` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampaignEmailVariant" DROP CONSTRAINT "CampaignEmailVariant_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignEmailVariant" DROP CONSTRAINT "CampaignEmailVariant_personaId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignRecipient" DROP CONSTRAINT "CampaignRecipient_personaId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignRecipient" DROP CONSTRAINT "CampaignRecipient_variantId_fkey";

-- DropIndex
DROP INDEX "CampaignRecipient_campaignId_personaId_idx";

-- AlterTable
ALTER TABLE "CampaignRecipient" DROP COLUMN "personaId",
DROP COLUMN "variantId";

-- DropTable
DROP TABLE "CampaignEmailVariant";

-- DropTable
DROP TABLE "Persona";

-- DropEnum
DROP TYPE "VariantStatus";
