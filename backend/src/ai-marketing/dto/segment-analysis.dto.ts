import { IsArray, IsString, IsUrl } from 'class-validator';

export class SegmentAnalysisDto {
  @IsArray()
  @IsString({ each: true })
  segments: string[];

  @IsUrl()
  companyUrl: string;
}
