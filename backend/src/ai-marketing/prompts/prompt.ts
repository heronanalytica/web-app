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
      "products": ["string"]
    }

    Guidelines:
    - "brand_positioning": Describe how the brand is perceived in the market.
    - "values": List core values or principles the company promotes.
    - "tone_of_voice": Describe the communication style used in branding or marketing.
    - "typical_customer_profile": Describe the main customer demographic in terms of age, interests, lifestyle, and income.
    - "products": Provide 3–6 representative products or services offered by the company. Use general categories or specific examples based on available information.

    Rules:
    - Respond with **only** valid JSON (no markdown, no code block).
    - If a field is uncertain, infer based on industry and website content — **do not leave any field empty**.
    - Keep the response concise and factual.`;
}
