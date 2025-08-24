import {
  CommonTemplateDto,
  CompanyProfileDto,
} from 'src/campaign/dto/campaign-step-state.dto';

// backend/src/ai-marketing/prompts/email-from-brief.prompt.ts
export function buildEmailFromBriefPrompt(params: {
  persona: { name: string; code: string; description?: string | null };
  companyProfile?: CompanyProfileDto;
  brief: {
    objective: string;
    tone: string;
    keyMessages: string;
    businessResults?: string;
    cta?: string;
  };
  baseTemplate?: CommonTemplateDto;
}) {
  const { persona, companyProfile, brief, baseTemplate } = params;
  return `
    Return ONLY valid JSON: { "subject": "string", "html": "<!doctype html>..." }

    Persona:
    ${JSON.stringify(persona, null, 2)}

    Company Profile:
    ${JSON.stringify(companyProfile ?? {}, null, 2)}

    Brief:
    ${JSON.stringify(brief, null, 2)}

    BaseTemplate (optional):
    ${JSON.stringify(baseTemplate ?? null, null, 2)}

    Rules:
    - If BaseTemplate is provided, preserve its overall structure/sections and CTA style while adapting copy to the persona.
    - Tone must match brief.tone and brand voice. One clear CTA. Inline styles. No external CSS/unsubscribe.
    `.trim();
}
