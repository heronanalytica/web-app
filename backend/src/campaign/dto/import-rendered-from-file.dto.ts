// backend/src/campaign/dto/import-rendered-from-file.dto.ts
import { IsUUID } from 'class-validator';

export class ImportRenderedFromFileDto {
  @IsUUID()
  fileId!: string;
}
