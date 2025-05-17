/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `SurveyIntakeQuestions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `SurveyIntakeQuestions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SurveyIntakeQuestions" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SurveyIntakeQuestions_code_key" ON "SurveyIntakeQuestions"("code");
