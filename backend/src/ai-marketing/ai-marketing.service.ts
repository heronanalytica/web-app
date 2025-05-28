import { Injectable } from '@nestjs/common';
import { SegmentAnalysisDto } from './dto/segment-analysis.dto';
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
import { callOpenAiAndParse } from './helpers/openai.helper';

@Injectable()
export class AiMarketingService {
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
    return callOpenAiAndParse({
      user: `persona-segment`,
      prompt: buildPersonaPrompt(segment, index),
      schema: PersonaSegmentSchema,
      systemPrompt: SYSTEM_PROMPTS.persona,
      temperature: 0.3,
    });
  }

  private async parseCompany(companyUrl: string): Promise<CompanyProfile> {
    return callOpenAiAndParse({
      user: `company-profile`,
      prompt: buildCompanyPrompt(companyUrl),
      schema: CompanyProfileSchema,
      systemPrompt: SYSTEM_PROMPTS.company,
      temperature: 0.3,
    });
  }

  private async generateStrategy(
    segment: PersonaSegment,
    company: CompanyProfile,
  ): Promise<MarketingStrategy> {
    return callOpenAiAndParse({
      user: `strategy-${segment.segment_name}`,
      prompt: buildStrategyPrompt(segment, company),
      schema: MarketingStrategySchema,
      systemPrompt: SYSTEM_PROMPTS.strategy,
    });
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
    return callOpenAiAndParse({
      user: `email-${segment.segment_name}`,
      prompt: buildEmailTemplatePrompt(segment, company),
      schema: EmailTemplateSchema,
    });
  }

  private async generateAdTemplates(
    segment: PersonaSegment,
    company: CompanyProfile,
  ): Promise<AdsTemplate> {
    return callOpenAiAndParse({
      user: `ads-${segment.segment_name}`,
      prompt: buildAdTemplatesPrompt(segment, company),
      schema: AdsTemplateSchema,
    });
  }
}
