import { GeneratedOverallProfile } from 'src/ai-marketing/types/ai-marketing.types';

export class CreateCompanyProfileDto {
  name: string;
  website?: string;
  marketingContentFileId?: string;
  designAssetFileId?: string;
  businessInfo?: string;
}

export class UpdateCompanyProfileDto {
  name?: string;
  website?: string;
  marketingContentFileId?: string;
  designAssetFileId?: string;
  businessInfo?: string;
  generatedOverallProfile?: GeneratedOverallProfile;
  generatedMarketingTone?: any;
}

export class AnalyzeCompanyProfileDto {
  campaignId: string;
  companyProfileId: string;
}
