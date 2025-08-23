export enum CampaignStepStateKey {
  CustomerFile = "customerFile",
  MailService = "mailService",
  ClassifiedPersonaFile = "classifiedPersonaFile",
  CompanyProfile = "companyProfile",
  Launched = "launched",
  Generator = "generator",
}

export interface CustomerFileDto {
  fileId: string;
  fileName: string;
}

export interface MailServiceDto {
  provider: string;
  connected: boolean;
  mailProviderId: string; // MailProviderToken.id
}

export interface ClassifiedPersonaFileDto {
  fileId: string;
  fileName: string;
}

export type GeneratedOverallProfile = {
  brand_positioning: string;
  values: string[];
  tone_of_voice: string;
  typical_customer_profile: {
    age_range: string;
    interests: string[];
    lifestyle: string;
    income_level: string;
  };
  products: string[];
  summary: string;
};

export interface GeneratedMarketingTone {
  summary: string;
}

export interface CompanyProfileDto {
  id: string;
  name: string;
  website: string;
  marketingContentFileId: string;
  designAssetFileId: string;
  businessInfo?: string;
  generatedOverallProfile?: GeneratedOverallProfile;
  generatedMarketingTone?: GeneratedMarketingTone;
  createdAt?: string;
}

export interface GeneratorBriefDto {
  objective: string;
  tone: string;
  businessResults: string;
  keyMessages: string;
  cta: string;
  photoFileId?: string;   // optional: if you later pipe the uploaded image to backend
  templateName?: string;  // optional: if user names the template in preview
}

export interface CampaignStepState {
  customerFile?: CustomerFileDto;
  mailService?: MailServiceDto;
  classifiedPersonaFile?: ClassifiedPersonaFileDto;
  companyProfile?: CompanyProfileDto;
  launched?: boolean;
  generator?: GeneratorBriefDto;
}
