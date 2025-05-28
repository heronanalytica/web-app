import { z } from 'zod';
import {
  CompanyProfileSchema,
  MarketingStrategySchema,
  PersonaSegmentSchema,
} from '../validation/ai-marketing.schema';

export type PersonaSegment = z.infer<typeof PersonaSegmentSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type MarketingStrategy = z.infer<typeof MarketingStrategySchema>;

export interface MarketingAnalysisResult {
  parsedSegments: PersonaSegment[];
  parsedCompany: CompanyProfile;
  strategies: MarketingStrategy[];
}
