// campaign-step-state.dto.ts

import {
  IsUUID,
  IsString,
  IsBoolean,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerFileDto {
  @IsUUID()
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
  @IsBoolean()
  launched?: boolean;
}
