import {
  GeneratedOverallProfile,
  GeneratedMarketingTone,
} from "./campaignStepState";

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  website?: string | null;
  marketingContentFileId?: string | null;
  designAssetFileId?: string | null;
  businessInfo?: string | null;
  generatedOverallProfile?: GeneratedOverallProfile;
  generatedMarketingTone?: GeneratedMarketingTone;
  createdAt: string;
  updatedAt: string;
}
