export enum CampaignStepStateKey {
  CustomerFile = "customerFile",
  MailService = "mailService",
  Launched = "launched"
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

export interface CampaignStepState {
  customerFile?: CustomerFileDto;
  mailService?: MailServiceDto;
  launched?: boolean;
}
