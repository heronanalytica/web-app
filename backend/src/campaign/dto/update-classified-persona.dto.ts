import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateClassifiedPersonaDto {
  @IsUUID()
  fileId: string;

  @IsString()
  fileName: string;
}

export class RemoveClassifiedPersonaDto {
  @IsUUID()
  @IsOptional()
  fileId?: string;
}
