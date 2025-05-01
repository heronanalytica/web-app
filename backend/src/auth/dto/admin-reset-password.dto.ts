import { IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @IsString()
  userId: string;

  @MinLength(6)
  @IsString()
  newPassword: string;
}
