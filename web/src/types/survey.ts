import { SURVEY_INTAKE_QUESTION_TYPE } from "@/constants/survey";

export interface SurveyIntakeQuestion {
  id: string;
  code: string;
  question: string;
  type: SURVEY_INTAKE_QUESTION_TYPE;
  options: string[] | null;
  createdAt: string;
  updatedAt: string;
}
