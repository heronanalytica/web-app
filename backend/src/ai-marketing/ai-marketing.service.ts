import { Injectable } from '@nestjs/common';
import { SegmentAnalysisDto } from './dto/segment-analysis.dto';
import { OpenAI } from 'openai';
import {
  PersonaSegment,
  CompanyProfile,
  MarketingAnalysisResult,
  MarketingStrategy,
  EmailTemplate,
  AdsTemplate,
} from './types/ai-marketing.types';
import {
  buildAdTemplatesPrompt,
  buildCompanyPrompt,
  buildEmailTemplatePrompt,
  buildPersonaPrompt,
  buildStrategyPrompt,
} from './prompts/prompt';
import {
  AdsTemplateSchema,
  CompanyProfileSchema,
  EmailTemplateSchema,
  MarketingStrategySchema,
  PersonaSegmentSchema,
} from './validation/ai-marketing.schema';
import { SYSTEM_PROMPTS } from './prompts/system-prompts';

let openai: OpenAI;

@Injectable()
export class AiMarketingService {
  constructor() {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private extractJsonFromMarkdown(content: string): string {
    return content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/, '')
      .trim();
  }

  async analyze(dto: SegmentAnalysisDto): Promise<MarketingAnalysisResult> {
    const personaSegments = await Promise.all(
      dto.segments.map((segment, idx) => this.parseSegment(segment, idx + 1)),
    );

    const companyProfile = await this.parseCompany(dto.companyUrl);

    const strategies = await Promise.all(
      personaSegments.map((segment) =>
        this.generateStrategy(segment, companyProfile),
      ),
    );

    return {
      personaSegments,
      companyProfile,
      strategies,
    };
  }

  private async parseSegment(
    segment: string,
    index: number,
  ): Promise<PersonaSegment> {
    const prompt = buildPersonaPrompt(segment, index);
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.persona },
        { role: 'user', content: prompt },
      ],
      user: `persona-segment`,
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = res.choices[0].message.content || '{}';

    try {
      const json = this.extractJsonFromMarkdown(content);
      const parsed = PersonaSegmentSchema.parse(JSON.parse(json));
      return parsed;
    } catch (err) {
      console.error(`[parseSegment:${index}] Invalid AI output:\n`, content);
      console.error(err);
      throw new Error('Failed to validate persona segment schema');
    }
  }
  private async parseCompany(companyUrl: string): Promise<CompanyProfile> {
    const prompt = buildCompanyPrompt(companyUrl);
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.company },
        { role: 'user', content: prompt },
      ],
      user: `company-segment`,
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = res.choices[0].message.content || '{}';

    try {
      const json = this.extractJsonFromMarkdown(content);
      const parsed = CompanyProfileSchema.parse(JSON.parse(json));
      return parsed;
    } catch (err) {
      console.error('[parseCompany] Failed to parse AI output:', content);
      console.error(err);
      throw new Error('AI response was not valid JSON');
    }
  }

  private async generateStrategy(
    segment: PersonaSegment,
    company: CompanyProfile,
  ): Promise<MarketingStrategy> {
    const prompt = buildStrategyPrompt(segment, company);
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.strategy },
        { role: 'user', content: prompt },
      ],
      user: `strategy-segment`,
      temperature: 0.5,
      max_tokens: 800,
    });
    const content = res.choices[0].message.content || '{}';

    try {
      const json = this.extractJsonFromMarkdown(content);
      const parsed = MarketingStrategySchema.parse(JSON.parse(json));
      return parsed;
    } catch (err) {
      console.error(
        `[generateStrategy:${segment.segment_name}] Failed to parse AI output:\n`,
        content,
      );
      console.error(err);
      throw new Error('AI response was not valid JSON');
    }
  }

  async generateCampaignTemplates(dto: SegmentAnalysisDto) {
    const personaSegments = await Promise.all(
      dto.segments.map((segment, idx) => this.parseSegment(segment, idx + 1)),
    );

    const companyProfile = await this.parseCompany(dto.companyUrl);

    const templates = await Promise.all(
      personaSegments.map(async (segment) => {
        const email = await this.generateEmailTemplate(segment, companyProfile);
        const ads = await this.generateAdTemplates(segment, companyProfile);
        return { segment: segment.segment_name, email, ads };
      }),
    );

    return { templates };
  }

  private async generateEmailTemplate(
    segment: PersonaSegment,
    company: CompanyProfile,
  ): Promise<EmailTemplate> {
    const prompt = buildEmailTemplatePrompt(segment, company);
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      user: 'email-template',
      temperature: 0.5,
      max_tokens: 800,
    });
    const content = res.choices[0].message.content || '{}';

    try {
      const json = this.extractJsonFromMarkdown(content);
      const parsed = EmailTemplateSchema.parse(JSON.parse(json));
      return parsed;
    } catch (err) {
      console.error('Email template validation failed:', err);
      throw new Error('Invalid email template JSON returned from AI');
    }
  }

  private async generateAdTemplates(
    segment: PersonaSegment,
    company: CompanyProfile,
  ): Promise<AdsTemplate> {
    const prompt = buildAdTemplatesPrompt(segment, company);
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      user: 'ad-templates',
      temperature: 0.5,
      max_tokens: 800,
    });
    const content = res.choices[0].message.content || '{}';

    try {
      const json = this.extractJsonFromMarkdown(content);
      const parsed = AdsTemplateSchema.parse(JSON.parse(json));
      return parsed;
    } catch (err) {
      console.error('Ad template validation failed:', err);
      throw new Error('Invalid Ad template JSON returned from AI');
    }
  }
}
