/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SurveyIntakeQuestionSet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SurveyIntakeQuestionSet_name_key" ON "SurveyIntakeQuestionSet"("name");
