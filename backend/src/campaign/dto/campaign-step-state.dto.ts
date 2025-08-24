import {
  IsUUID,
  IsString,
  IsBoolean,
  ValidateNested,
  IsOptional,
  IsDateString,
  Matches,
  IsArray,
  IsIn,
  IsEmail,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// UUID optionally followed by an extension like ".csv" / ".png"
const UUID_WITH_EXT =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\.[a-zA-Z0-9]+)?$/;

export class AnalysisStepDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsString()
  @IsIn(['waiting', 'in_progress', 'done', 'error'])
  status: 'waiting' | 'in_progress' | 'done' | 'error';
}

export class UpdateAnalysisStepsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalysisStepDto)
  steps: AnalysisStepDto[];
}

export class CustomerFileDto {
  @Matches(UUID_WITH_EXT, {
    message: 'fileId must be a UUID optionally followed by an extension',
  })
  fileId: string;

  @IsString()
  fileName: string;
}

export class GeneratorBriefDto {
  @IsString()
  objective: string; // e.g. "Sales generation"

  @IsString()
  tone: string; // e.g. "Professional" | "Friendly" ...

  @IsString()
  businessResults: string;

  @IsString()
  keyMessages: string;

  @IsString()
  cta: string;

  @IsOptional()
  @Matches(UUID_WITH_EXT, {
    message: 'photoFileId must be a UUID optionally followed by an extension',
  })
  photoFileId?: string;
}

export class StepSummaryDto {
  @IsOptional()
  @IsNumber()
  totalRecipients?: number;

  @IsOptional()
  @IsObject()
  byPersona?: Record<string, number>; // personaId -> count
}

export class MailServiceDto {
  @IsString()
  provider: string; // "mailchimp"

  @IsBoolean()
  connected: boolean;

  @IsUUID()
  mailProviderId: string; // MailProviderToken.id

  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @IsOptional()
  @IsDateString()
  scheduleIso?: string; // ISO datetime if scheduling
}

export class ClassifiedPersonaFileDto {
  @Matches(UUID_WITH_EXT, {
    message: 'fileId must be a UUID optionally followed by an extension',
  })
  fileId: string;

  @IsString()
  fileName: string;
}

export class CompanyProfileDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsUUID()
  userId: string;

  @IsString()
  website: string; // keep string; many inputs come as "www..." without scheme

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

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

export class CommonTemplateDto {
  @IsString() subject: string;
  @IsString() html: string;
}

export class StepStateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneratorBriefDto)
  generator?: GeneratorBriefDto;

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
  @Type(() => ClassifiedPersonaFileDto)
  classifiedPersonaFile?: ClassifiedPersonaFileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyProfileDto)
  companyProfile?: CompanyProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CommonTemplateDto)
  commonTemplate?: CommonTemplateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StepSummaryDto)
  summary?: StepSummaryDto;

  @IsOptional()
  @IsBoolean()
  launched?: boolean;
}
