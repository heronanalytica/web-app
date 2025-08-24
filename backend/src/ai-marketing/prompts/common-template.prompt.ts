import {
  CompanyProfileDto,
  GeneratorBriefDto,
} from 'src/campaign/dto/campaign-step-state.dto';

export function buildCommonTemplatePrompt(params: {
  companyProfile?: CompanyProfileDto;
  brief: GeneratorBriefDto;
}) {
  const { companyProfile, brief } = params;

  return `
Return ONLY valid JSON in this exact shape:
{ "subject": "string", "html": "<!doctype html>...single-CTA..." }

Company Profile:
${JSON.stringify(companyProfile ?? {}, null, 2)}

Brief:
${JSON.stringify(brief, null, 2)}

Requirements:
- Write a single “common” email suitable for ALL customers (no persona-specific lines).
- Keep tone aligned with brief.tone and the brand voice from the company profile.
- Skimmable HTML, inline styles, accessible, and include exactly ONE primary CTA button whose text reflects brief.cta.
- No external CSS, no unsubscribe block.
`.trim();
}
