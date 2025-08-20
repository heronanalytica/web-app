import { IsUUID, IsOptional, IsBoolean, IsString } from 'class-validator';

export class ImportClassifiedDto {
  @IsUUID() fileId: string;
  @IsOptional() @IsBoolean() hasHeader?: boolean = true;

  // Optional overrides for column names
  @IsOptional() @IsString() firstNameCol?: string; // default: "First Name"
  @IsOptional() @IsString() lastNameCol?: string; // default: "Last Name"
  @IsOptional() @IsString() emailCol?: string; // default: "Email"
  @IsOptional() @IsString() personaCol?: string; // default: "Persona"
  @IsOptional() @IsString() accuracyCol?: string; // default: "Accuracy"
}
