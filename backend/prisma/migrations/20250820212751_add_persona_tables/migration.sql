-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('PENDING', 'STAGED', 'QUEUED', 'SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'ERROR');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('DRAFT', 'GENERATED', 'APPROVED', 'SCHEDULED', 'SENT', 'ERROR');

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" VARCHAR(320),
    "firstName" TEXT,
    "lastName" TEXT,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "variantId" TEXT,
    "personaConfidence" INTEGER,
    "status" "RecipientStatus" NOT NULL DEFAULT 'PENDING',
    "mcMemberId" TEXT,
    "mcSendId" TEXT,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignEmailVariant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "subject" TEXT,
    "html" TEXT,
    "status" "VariantStatus" NOT NULL DEFAULT 'DRAFT',
    "templateExtId" TEXT,
    "campaignExtId" TEXT,
    "aiModel" TEXT,
    "prompt" JSONB,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignEmailVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceImport" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "sourceFileId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "imported" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "logUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Persona_code_key" ON "Persona"("code");

-- CreateIndex
CREATE INDEX "Contact_userId_email_idx" ON "Contact"("userId", "email");

-- CreateIndex
CREATE INDEX "CampaignRecipient_campaignId_personaId_idx" ON "CampaignRecipient"("campaignId", "personaId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_campaignId_status_idx" ON "CampaignRecipient"("campaignId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRecipient_campaignId_contactId_key" ON "CampaignRecipient"("campaignId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEmailVariant_campaignId_personaId_key" ON "CampaignEmailVariant"("campaignId", "personaId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CampaignEmailVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEmailVariant" ADD CONSTRAINT "CampaignEmailVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEmailVariant" ADD CONSTRAINT "CampaignEmailVariant_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceImport" ADD CONSTRAINT "AudienceImport_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceImport" ADD CONSTRAINT "AudienceImport_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "UserUploadFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
