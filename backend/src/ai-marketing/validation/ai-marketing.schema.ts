import { z } from 'zod';

export const PersonaSegmentSchema = z.object({
  segment_name: z.string(),
  behavior: z.object({
    engagement: z.string(),
    loyalty_programs: z.string(),
    price_sensitivity: z.string(),
  }),
  psychographics: z.object({
    lifestyles: z.string(),
    interests: z.string(),
    beliefs: z.string(),
  }),
});

export const CompanyProfileSchema = z.object({
  brand_positioning: z.string(),
  values: z.array(z.string()),
  tone_of_voice: z.string(),
  typical_customer_profile: z.object({
    age_range: z.string(),
    interests: z.array(z.string()),
    lifestyle: z.string(),
    income_level: z.string(),
  }),
  products: z.array(z.string()),
});
