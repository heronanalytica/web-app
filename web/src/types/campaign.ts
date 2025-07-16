export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}
