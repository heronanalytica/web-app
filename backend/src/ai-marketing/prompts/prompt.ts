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
  return `You are a brand analyst. Given the domain "${companyUrl}", infer and return this exact JSON structure:
        {
          "brand_positioning": "...",
          "values": ["..."],
          "tone_of_voice": "...",
          "typical_customer_profile": {
            "age_range": "...",
            "interests": ["..."],
            "lifestyle": "...",
            "income_level": "..."
          }
        }
        Respond with only valid JSON.`;
}
