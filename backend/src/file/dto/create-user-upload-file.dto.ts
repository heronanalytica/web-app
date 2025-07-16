import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateUserUploadFileDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  storageUrl: string;

  @IsArray()
  @IsString({ each: true })
  columns: string[];

  @IsString()
  @IsNotEmpty()
  type: string; // e.g. 'customer', 'other'
}
