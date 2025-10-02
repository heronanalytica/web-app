/*
  Warnings:

  - You are about to drop the `SurveyIntakeQuestionAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyIntakeQuestionSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyIntakeQuestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SurveyIntakeQuestionAnswer" DROP CONSTRAINT "SurveyIntakeQuestionAnswer_userId_fkey";

-- DropTable
DROP TABLE "SurveyIntakeQuestionAnswer";

-- DropTable
DROP TABLE "SurveyIntakeQuestionSet";

-- DropTable
DROP TABLE "SurveyIntakeQuestions";

-- DropEnum
DROP TYPE "IntakeQuestionType";
