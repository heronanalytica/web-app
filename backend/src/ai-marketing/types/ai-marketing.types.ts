import { z } from 'zod';
import {
  CompanyProfileSchema,
  PersonaSegmentSchema,
} from '../validation/ai-marketing.schema';

export type PersonaSegment = z.infer<typeof PersonaSegmentSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

export interface MarketingAnalysisResult {
  parsedSegments: PersonaSegment[];
  parsedCompany: CompanyProfile;
}
