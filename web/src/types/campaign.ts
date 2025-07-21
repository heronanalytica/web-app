export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
}

import type { AnalysisStep } from "@/app/app/campaign/components/AnalysisWaitingStep/AnalysisWaitingStep";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  analysisSteps?: AnalysisStep[];
}
