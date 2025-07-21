export enum CampaignStepStateKey {
  CustomerFile = "customerFile",
  MailService = "mailService",
  CompanyProfile = "companyProfile",
  Launched = "launched",
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

export interface CompanyProfileDto {
  id: string;
  name: string;
  website: string;
  marketingContentFileId: string;
  designAssetFileId: string;
  businessInfo?: string;
  createdAt?: string;
}

export interface CampaignStepState {
  customerFile?: CustomerFileDto;
  mailService?: MailServiceDto;
  companyProfile?: CompanyProfileDto;
  launched?: boolean;
}
