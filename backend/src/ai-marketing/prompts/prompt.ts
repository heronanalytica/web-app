import { CompanyProfile, PersonaSegment } from '../types/ai-marketing.types';

export function buildPersonaPrompt(segment: string, index: number): string {
  return `Parse and format the following customer persona (Segment ${index}) into this exact JSON structure:
    {
      "segment_name": "string",
      "behavior": {
        "engagement": "string",
        "loyalty_programs": "string",
        "price_sensitivity": "string"
      },
      "psychographics": {
        "lifestyles": "string",
        "interests": "string",
        "beliefs": "string"
      }
    }

    Rules:
    - Do NOT use placeholders or summarize behavior.
    - behavior must be an object with detailed string values for all 3 keys.
    - Return raw JSON only. No commentary.

    Persona Description:
    ${segment}`;
}

export function buildCompanyPrompt(companyUrl: string): string {
  return `You are a brand analyst. Analyze the company at the domain "${companyUrl}" and return only a valid JSON object in the following format:

    {
      "brand_positioning": "string",
      "values": ["string"],
      "tone_of_voice": "string",
      "typical_customer_profile": {
        "age_range": "string",
        "interests": ["string"],
        "lifestyle": "string",
        "income_level": "string"
      },
      "products": ["string"],
      "summary": "string"
    }

    Guidelines:
    - "brand_positioning": Describe how the brand is perceived in the market.
    - "values": List core values or principles the company promotes.
    - "tone_of_voice": Describe the communication style used in branding or marketing.
    - "typical_customer_profile": Describe the main customer demographic in terms of age, interests, lifestyle, and income.
    - "products": Provide 3–6 representative products or services offered by the company. Use general categories or specific examples based on available information.
    - "summary": Provide a concise summary of the company's brand, products, and target audience.

    Rules:
    - Respond with **only** valid JSON (no markdown, no code block).
    - If a field is uncertain, infer based on industry and website content — **do not leave any field empty**.
    - Keep the response concise and factual.`;
}

export function buildStrategyPrompt(
  segment: PersonaSegment,
  company: CompanyProfile,
): string {
  return `You are a marketing strategist.

    Given the following customer persona:
    ${JSON.stringify(segment, null, 2)}

    And the company profile:
    ${JSON.stringify(company, null, 2)}

    Create a detailed marketing strategy tailored to this persona. Your response must strictly follow this JSON structure:

    {
      "segment_name": "string",
      "campaign_objective": "string",
      "key_message": "string",
      "value_proposition": "string",
      "tone_alignment": "string",
      "call_to_action": "string",
      "recommended_channels": ["string"],
      "tactical_plan": [
        {
          "channel": "email" | "social_media" | "ads" | "sms" | "push",
          "platform": "string",
          "content_format": "image" | "video" | "text" | "carousel" | "email_template",
          "audience_targeting": {
            "interests": ["string"],
            "age_range": "string",
            "behaviors": ["string"],
            "demographics": "string"
          },
          "schedule": "string"
        }
      ],
      "tracking_and_kpis": ["string"],
      "content_calendar_notes": "string",
      "team_roles": ["string"],
      "crisis_plan_notes": "string"
    }

    Instructions:
    - Align "tone_alignment" with the company’s tone_of_voice.
    - Tailor the strategy to match both the persona’s psychographics and behaviors, and the company’s positioning and products.
    - Each "tactical_plan" item should be realistic, platform-specific, and actionable.
    - Use clear and concise business language. Avoid placeholders.
    - Return only valid JSON (no markdown, no code block, no explanations).`;
}

export function buildEmailTemplatePrompt(
  segment: PersonaSegment,
  company: CompanyProfile,
): string {
  return `You are an expert marketing copywriter.

    Using the following customer persona:
    ${JSON.stringify(segment, null, 2)}

    And company profile:
    ${JSON.stringify(company, null, 2)}

    Create a personalized email campaign using this format:

    Subject: string
    Body (HTML-ready): string with placeholders like {{firstname}}, {{lastname}}, {{product}}

    Rules:
    - Tone should align with company’s tone_of_voice
    - Content should appeal to persona’s behavior and psychographics
    - HTML body should be short, skimmable, and contain 1 clear CTA

    Respond with ONLY valid JSON.`;
}

export function buildAdTemplatesPrompt(
  segment: PersonaSegment,
  company: CompanyProfile,
): string {
  return `You are a performance ad specialist.

  Given this persona:
  ${JSON.stringify(segment, null, 2)}

  And this company:
  ${JSON.stringify(company, null, 2)}

  Create 1 ad creatives for Facebook and Instagram using this array format:

  [
    {
      "platform": "facebook",
      "headline": "string",
      "primary_text": "string",
      "call_to_action": "string",
      "media_suggestion": "string"
    },
    {
      "platform": "instagram",
      "headline": "string",
      "primary_text": "string",
      "call_to_action": "string",
      "media_suggestion": "string"
    }
  ]

  Guidelines:
  - Each ad must be distinct and testable
  - Platform should be "facebook_instagram"
  - Use concise and engaging marketing language
  - Use JSON array only, no markdown, no explanations`;
}

// ai-marketing/prompts/prompt.ts
export function buildCompanyPromptFromContent(content: string): string {
  return `You are a brand analyst. Given the following company information:

  ${content}

  Return only a valid JSON object in the following format:
  {
    "brand_positioning": "string",
    "values": ["string"],
    "tone_of_voice": "string",
    "typical_customer_profile": {
      "age_range": "string",
      "interests": ["string"],
      "lifestyle": "string",
      "income_level": "string"
    },
    "products": ["string"],
    "summary": "string"
  }

  Guidelines:
  - Fill in fields as best as possible based on content.
  - Add a 'summary' that is 3 concise sentences and easy to understand by customers.
  - Return valid JSON only. No explanations, no markdown.`;
}
