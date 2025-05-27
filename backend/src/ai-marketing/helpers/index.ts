export function extractJsonFromMarkdown(content: string): string {
  return content
    .replace(/^```(?:json)?\s*/i, '') // Remove opening ```
    .replace(/```$/, '') // Remove closing ```
    .trim();
}
