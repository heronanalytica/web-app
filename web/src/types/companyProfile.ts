import { GeneratedOverallProfile } from "./campaignStepState";

export interface CompanyProfile {
  id: string;
  name: string;
  website: string;
  marketingContentFileId: string;
  designAssetFileId: string;
  businessInfo?: string;
  generatedOverallProfile?: GeneratedOverallProfile;
  generatedMarketingTone?: string;
  createdAt?: string;
}
