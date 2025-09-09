import { CampaignStepState } from "./campaignStepState";
import { CompanyProfile } from "./companyProfile";

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
  companyProfile?: CompanyProfile;
  classifiedPersonaFileId?: string;
  classifiedPersonaFile: ClassifiedPersonaFile;
  [key: string]: any; // For any additional fields that might come from the API
}

export interface ClassifiedPersonaFile {
  id: string;
  fileName: string;
  storageUrl: string;
  type: string;
  uploadedAt: string;
}
