import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserUploadFileDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  storageUrl: string;

  @IsString()
  @IsNotEmpty()
  type: string; // e.g. 'customer', 'other'

  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;
}
