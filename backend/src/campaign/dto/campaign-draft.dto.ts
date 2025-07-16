import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateDraftCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;
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
}

export class DeleteDraftCampaignDto {
  @IsUUID()
  id: string;
}

export class GetDraftCampaignDto {
  @IsUUID()
  id: string;
}
