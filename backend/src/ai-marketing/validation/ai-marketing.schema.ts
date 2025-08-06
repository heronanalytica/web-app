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
  summary: z.string(),
});

export const MarketingStrategySchema = z.object({
  segment_name: z.string(),

  // 🎯 Strategy & Messaging
  campaign_objective: z.string(), // From "Clear Objectives"
  key_message: z.string(), // From "Key Messages"
  value_proposition: z.string(), // NEW - From "Value Proposition"
  tone_alignment: z.string(), // From "Brand Guidelines"
  call_to_action: z.string(),

  // 📡 Distribution
  recommended_channels: z.array(z.string()), // From "Channel Strategy"

  // 🧱 Tactical Execution
  tactical_plan: z.array(
    z.object({
      channel: z.enum(['email', 'social_media', 'ads', 'sms', 'push']),
      platform: z.string(), // e.g., "Facebook", "Mailchimp"
      content_format: z.enum([
        'image',
        'video',
        'text',
        'carousel',
        'email_template',
      ]),
      audience_targeting: z.object({
        interests: z.array(z.string()).optional(),
        age_range: z.string().optional(),
        behaviors: z.array(z.string()).optional(),
        demographics: z.string().optional(), // NEW - adds specificity from personas
      }),
      schedule: z.string(), // e.g., "weekly", "every Friday"
    }),
  ),

  // 🧩 Operational Details
  tracking_and_kpis: z.array(z.string()), // NEW - matches "Clear Objectives and KPIs"
  content_calendar_notes: z.string().optional(), // NEW - notes on timing/seasonality
  team_roles: z.array(z.string()).optional(), // NEW - from "Team Roles and Responsibilities"
  crisis_plan_notes: z.string().optional(), // NEW - optional crisis response handling
});

export const AdTemplateSchema = z.object({
  platform: z.string(),
  headline: z.string(),
  primary_text: z.string(),
  call_to_action: z.string(),
  media_suggestion: z.string(),
});
export const AdsTemplateSchema = z.array(AdTemplateSchema);

export const EmailTemplateSchema = z.object({
  Subject: z.string(),
  Body: z.string(),
});
