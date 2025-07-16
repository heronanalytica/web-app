import { IsString, IsNotEmpty } from 'class-validator';

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
}
