import { IsOptional, IsArray, IsUUID, IsBoolean } from 'class-validator';

export class GenerateVariantsDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  personaIds?: string[];

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean = false;
}
