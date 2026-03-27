import { EAuthRole } from "./auth";
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
  role?: EAuthRole;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  status: CampaignStatus;
  currentStep?: number | null;
  user?: User | null;
  createdAt: string;
  updatedAt: string;
  stepState?: CampaignStepState | null;
  analysisSteps?: AnalysisStep[] | null;
  companyProfile?: CompanyProfile | null;
  classifiedPersonaFileId?: string | null;
  classifiedPersonaFile?: ClassifiedPersonaFile | null;
  launchedAt?: string | null;
  lastSavedAt?: string | null;
}

export interface ClassifiedPersonaFile {
  id: string;
  fileName: string;
  storageUrl: string;
  type: string;
  uploadedAt: string;
}
