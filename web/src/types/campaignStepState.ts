export enum CampaignStepStateKey {
  CustomerFile = "customerFile",
  MailService = "mailService",
  ClassifiedPersonaFile = "classifiedPersonaFile",
  CompanyProfile = "companyProfile",
  Launched = "launched",
  Generator = "generator",
  CommonTemplate = "commonTemplate",
}

export interface CustomerFileDto {
  fileId: string;
  fileName: string;
}

export interface MailServiceDto {
  provider: string;
  connected: boolean;
  mailProviderId: string; // MailProviderToken.id
  listId?: string;
  fromName?: string;
  replyTo?: string;
  scheduleIso?: string;
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

export interface CommonTemplateDto {
  subject: string;
  html: string;
  preheader: string;
}

export interface CompanyProfileDto {
  id: string;
  name: string;
  userId?: string;
  website?: string | null;
  marketingContentFileId?: string | null;
  designAssetFileId?: string | null;
  businessInfo?: string | null;
  generatedOverallProfile?: GeneratedOverallProfile;
  generatedMarketingTone?: GeneratedMarketingTone;
  createdAt?: string;
  updatedAt?: string;
}

export interface StepSummaryDto {
  totalRecipients?: number;
  byPersona?: Record<string, number>;
}

export interface GeneratorBriefDto {
  objective?: string;
  tone?: string;
  businessResults?: string;
  keyMessages?: string;
  cta?: string;
  photoFileId?: string;
  uploadedHtml?: string;
}

export interface CampaignStepState {
  customerFile?: CustomerFileDto;
  mailService?: MailServiceDto;
  classifiedPersonaFile?: ClassifiedPersonaFileDto;
  companyProfile?: CompanyProfileDto;
  summary?: StepSummaryDto;
  launched?: boolean;
  generator?: GeneratorBriefDto;
  commonTemplate?: CommonTemplateDto;
}
