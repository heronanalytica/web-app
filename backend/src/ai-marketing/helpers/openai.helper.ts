// backend/src/ai-marketing/helpers/openai.helper.ts
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ZodSchema } from 'zod';

let _openai: OpenAI;

const getOpenAI = (): OpenAI => {
  if (_openai) return _openai;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set.');
  }
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
};

export async function callOpenAiAndParse<T>(options: {
  user: string;
  prompt: string;
  schema: ZodSchema<T>;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<T> {
  const {
    user,
    prompt,
    schema,
    systemPrompt,
    model = 'gpt-4o',
    temperature = 0.5,
    maxTokens = 800,
  } = options;
  const openai = getOpenAI();

  const messages: ChatCompletionMessageParam[] = systemPrompt
    ? [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ]
    : [{ role: 'user', content: prompt }];

  const res = await openai.chat.completions.create({
    model,
    messages,
    user,
    temperature,
    max_tokens: maxTokens,
  });

  const content = res.choices[0].message.content || '{}';
  const cleanJson = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    const parsed = schema.parse(JSON.parse(cleanJson));
    return parsed;
  } catch (err) {
    console.error(`[${user}] Validation failed:\n`, cleanJson);
    console.error(err);
    throw new Error(`Invalid AI JSON response for "${user}"`);
  }
}
