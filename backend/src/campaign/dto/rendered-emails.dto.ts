import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CustomerDto {
  @IsString() customer_email!: string;
  @IsOptional() @IsString() display_name?: string;
}

class PersonaDto {
  @IsString() persona_code?: string;
  @IsOptional() @IsString() persona_display_name?: string;
  @IsOptional() @IsNumber() match_confidence?: number; // 0..1
}

class EmailMetaDto {
  @IsString() from!: string;
  @IsString() to!: string;
  @IsString() subject!: string;
  @IsOptional() @IsString() preheader?: string;
  @IsOptional() @IsString() template_id?: string;
}

class EmailContentDto {
  @ValidateNested() @Type(() => EmailMetaDto) meta!: EmailMetaDto;
  @IsString() html_body!: string;
}

class UiLinksDto {
  @IsOptional() @IsString() view_full_persona?: string;
  @IsOptional() @IsString() why_this_email?: string;
}

export class RenderedEmailRowDto {
  @IsOptional() @IsString() email_id?: string;

  @ValidateNested() @Type(() => CustomerDto) customer!: CustomerDto;
  @ValidateNested() @Type(() => PersonaDto) persona!: PersonaDto;
  @ValidateNested() @Type(() => EmailContentDto) email!: EmailContentDto;

  @IsOptional() @IsString() rationale_id?: string;
  @IsOptional() @ValidateNested() @Type(() => UiLinksDto) ui_links?: UiLinksDto;
}

export class RenderedEmailsImportDto {
  @IsOptional() @IsString() campaign_id?: string; // ignored; we trust URL param
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RenderedEmailRowDto)
  recipients!: RenderedEmailRowDto[];
}
