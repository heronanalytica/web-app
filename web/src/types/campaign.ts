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

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  analysisSteps?: AnalysisStep[];
}
