/*
  Warnings:

  - A unique constraint covering the columns `[classifiedPersonaFileId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "classifiedPersonaFileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_classifiedPersonaFileId_key" ON "Campaign"("classifiedPersonaFileId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_classifiedPersonaFileId_fkey" FOREIGN KEY ("classifiedPersonaFileId") REFERENCES "UserUploadFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
