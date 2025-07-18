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
}
