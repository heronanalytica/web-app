import { z } from 'zod';
import {
  AdsTemplateSchema,
  AdTemplateSchema,
  CompanyProfileSchema,
  EmailTemplateSchema,
  MarketingStrategySchema,
  PersonaSegmentSchema,
} from '../validation/ai-marketing.schema';

export type PersonaSegment = z.infer<typeof PersonaSegmentSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type MarketingStrategy = z.infer<typeof MarketingStrategySchema>;
export type GeneratedOverallProfile = z.infer<typeof CompanyProfileSchema>;

export interface MarketingAnalysisResult {
  personaSegments: PersonaSegment[];
  companyProfile: CompanyProfile;
  strategies: MarketingStrategy[];
}

export type AdTemplate = z.infer<typeof AdTemplateSchema>;
export type AdsTemplate = z.infer<typeof AdsTemplateSchema>;
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
