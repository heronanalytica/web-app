import { CampaignStepState } from "./campaignStepState";

export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
}

export interface AnalysisStep {
  key: string;
  label: string;
  status: "waiting" | "in_progress" | "done" | "error";
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  currentStep?: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
  stepState?: CampaignStepState;
  analysisSteps?: AnalysisStep[];
  [key: string]: any; // For any additional fields that might come from the API
}
