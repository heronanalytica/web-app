-- CreateEnum
CREATE TYPE "IntakeQuestionType" AS ENUM ('SINGLE', 'TEXT', 'MULTIPLE');

-- CreateTable
CREATE TABLE "SurveyIntakeQuestions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "IntakeQuestionType" NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyIntakeQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyIntakeQuestionSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyIntakeQuestionSet_pkey" PRIMARY KEY ("id")
);
