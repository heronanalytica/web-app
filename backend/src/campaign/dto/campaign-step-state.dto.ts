import {
  IsUUID,
  IsString,
  IsBoolean,
  ValidateNested,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// Reusable regex: UUID optionally followed by an extension like ".csv" / ".png"
const UUID_WITH_EXT =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\.[a-zA-Z0-9]+)?$/;

export class CustomerFileDto {
  @Matches(UUID_WITH_EXT, {
    message: 'fileId must be a UUID optionally followed by an extension',
  })
  fileId: string;

  @IsString()
  fileName: string;
}

export class MailServiceDto {
  @IsString()
  provider: string;

  @IsBoolean()
  connected: boolean;

  @IsUUID()
  mailProviderId: string; // MailProviderToken.id
}

export class CompanyProfileDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsUUID()
  userId: string;

  @IsString()
  website: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  // businessInfo can be null; keep as any/unknown (no validation) or add specific DTO later
  @IsOptional()
  businessInfo?: any;

  @IsOptional()
  @Matches(UUID_WITH_EXT, {
    message:
      'designAssetFileId must be a UUID optionally followed by an extension',
  })
  designAssetFileId?: string | null;

  @IsOptional()
  @Matches(UUID_WITH_EXT, {
    message:
      'marketingContentFileId must be a UUID optionally followed by an extension',
  })
  marketingContentFileId?: string | null;
}

export class StepStateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerFileDto)
  customerFile?: CustomerFileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MailServiceDto)
  mailService?: MailServiceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyProfileDto)
  companyProfile?: CompanyProfileDto;

  @IsOptional()
  @IsBoolean()
  launched?: boolean;
}
