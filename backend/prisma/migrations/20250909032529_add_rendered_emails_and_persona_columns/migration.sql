-- AlterTable
ALTER TABLE "CampaignRecipient" ADD COLUMN     "personaCode" TEXT,
ADD COLUMN     "personaDisplayName" TEXT;

-- CreateTable
CREATE TABLE "CampaignRenderedEmail" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignRecipientId" TEXT NOT NULL,
    "emailId" TEXT,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preheader" TEXT NOT NULL,
    "templateId" TEXT,
    "rationaleId" TEXT,
    "html" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRenderedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRenderedEmail_campaignRecipientId_key" ON "CampaignRenderedEmail"("campaignRecipientId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRenderedEmail_campaignId_emailId_key" ON "CampaignRenderedEmail"("campaignId", "emailId");

-- AddForeignKey
ALTER TABLE "CampaignRenderedEmail" ADD CONSTRAINT "CampaignRenderedEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRenderedEmail" ADD CONSTRAINT "CampaignRenderedEmail_campaignRecipientId_fkey" FOREIGN KEY ("campaignRecipientId") REFERENCES "CampaignRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
