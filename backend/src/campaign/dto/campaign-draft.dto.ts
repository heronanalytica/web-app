import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { StepStateDto } from './campaign-step-state.dto';

export class CreateDraftCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StepStateDto)
  stepState?: StepStateDto;
}

export class UpdateDraftCampaignDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StepStateDto)
  stepState?: StepStateDto;
}

export class DeleteDraftCampaignDto {
  @IsUUID()
  id: string;
}

export class GetDraftCampaignDto {
  @IsUUID()
  id: string;
}
