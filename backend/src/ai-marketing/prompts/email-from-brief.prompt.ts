export function buildEmailFromBriefPrompt(params: {
  persona: { name: string; code: string; description?: string | null };
  companyProfile?: any;
  brief: {
    objective: string;
    tone: string;
    keyMessages: string;
    businessResults?: string;
    cta?: string;
  };
}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { persona, companyProfile, brief } = params;
  return `
    Return ONLY valid JSON:
    { "subject": "string", "html": "<!doctype html>...single-CTA..." }

    Persona:
    ${JSON.stringify(persona, null, 2)}

    Company Profile:
    ${JSON.stringify(companyProfile ?? {}, null, 2)}

    Brief:
    ${JSON.stringify(brief, null, 2)}

    Rules:
    - Tone aligns with brief.tone and company profile.
    - Skimmable HTML, inline styles, accessible, exactly 1 CTA button.
    - No external CSS, no unsubscribe block.
    `.trim();
}
