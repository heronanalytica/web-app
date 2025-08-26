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
  buildCompanyPromptFromContent,
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
import { DatabaseService } from 'src/database/database.service';
import { GenerateVariantsDto } from './dto/generate-variants.dto';
import {
  CommonTemplateDto,
  CompanyProfileDto,
  GeneratorBriefDto,
  StepStateDto,
} from 'src/campaign/dto/campaign-step-state.dto';
import { buildEmailFromBriefPrompt } from './prompts/email-from-brief.prompt';
import { EmailVariantSchema } from './validation/email-variant.schema';
import { Prisma } from 'generated/prisma';
import { instanceToPlain } from 'class-transformer';
import { buildCommonTemplatePrompt } from './prompts/common-template.prompt';
import { sanitizeEmailHtml, sanitizePlainText } from 'src/utils/sanitize';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class AiMarketingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly awsService: AwsService,
  ) {}

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

  async parseCompanyFromRawContent(content: string): Promise<CompanyProfile> {
    return callOpenAiAndParse({
      user: `company-profile-custom-input`,
      prompt: buildCompanyPromptFromContent(content),
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

  private async rewriteCidImagesToPublicOrSigned(
    html: string,
    ss: StepStateDto,
  ): Promise<string> {
    if (!html) return html;

    const photoId = ss?.generator?.photoFileId;
    if (!photoId) {
      // no photo – remove any broken cid images
      return html.replace(/<img\b[^>]*\bsrc=["']cid:[^"']+["'][^>]*>/gi, '');
    }

    // find the uploaded file
    const file = await this.db.userUploadFile.findUnique({
      where: { id: photoId },
      select: { storageUrl: true /* isPublic: true */ }, // include isPublic if you added it
    });
    if (!file?.storageUrl) return html;

    const key = file.storageUrl.replace(/^s3:\/\/[^/]+\//, '');
    const isPublic = key.includes('/public/'); // or use file.isPublic if column exists
    const url = isPublic
      ? this.awsService.buildPublicHttpUrl(key)
      : await this.awsService.getPresignedViewUrl(key, 3600);

    // replace any cid:* in <img src="...">
    return html.replace(
      /(<img\b[^>]*\bsrc=["'])cid:[^"']+(["'][^>]*>)/gi,
      `$1${url}$2`,
    );
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

  /**
   * Generate a "common" (non-persona) email template from the stored brief (+companyProfile),
   * save it into campaign.stepState.commonTemplate, and return it.
   */
  async generateCommonTemplate(userId: string, campaignId: string) {
    const campaign = await this.db.campaign.findFirstOrThrow({
      where: { id: campaignId, userId },
      select: { stepState: true },
    });

    const ss = (campaign.stepState ?? {}) as Record<string, unknown>;
    const brief = (ss?.generator ?? null) as GeneratorBriefDto;
    if (!brief)
      throw new Error('Missing generator brief in stepState.generator');

    const prompt = buildCommonTemplatePrompt({
      companyProfile: ss.companyProfile as CompanyProfileDto,
      brief,
    });

    const ai = await callOpenAiAndParse({
      user: `common-template-${campaignId}`,
      prompt,
      schema: EmailVariantSchema, // { subject, html }
      systemPrompt:
        'You are a world-class email copywriter and HTML email coder.',
      model: 'gpt-4o',
      temperature: 0.4,
      maxTokens: 1200,
    });

    let cleanHtml = sanitizeEmailHtml(ai.html);
    cleanHtml = await this.rewriteCidImagesToPublicOrSigned(cleanHtml, ss);
    const cleanPreheader = sanitizePlainText(ai.preheader);

    return {
      subject: ai.subject ?? '',
      html: cleanHtml,
      preheader: cleanPreheader,
    };
  }

  /**
   * Generate subject/html for a persona from the stored brief+companyProfile.
   * Persists CampaignEmailVariant and links CampaignRecipient.variantId.
   */
  async generateCampaignEmailVariants(
    userId: string,
    campaignId: string,
    dto: GenerateVariantsDto,
  ) {
    // 1) ownership + brief
    const campaign = await this.db.campaign.findFirstOrThrow({
      where: { id: campaignId, userId },
      select: { stepState: true },
    });
    const ss = (campaign.stepState ?? {}) as StepStateDto;
    const brief = ss.generator;
    if (!brief)
      throw new Error('Missing generator brief in stepState.generator');
    const companyProfile = ss.companyProfile;

    // 2) pick personas
    let personaIds: string[] = dto.personaIds ?? [];
    if (!personaIds.length) {
      const distinct = await this.db.campaignRecipient.findMany({
        where: { campaignId },
        select: { personaId: true },
        distinct: ['personaId'],
      });
      personaIds = distinct.map((d) => d.personaId);
    }
    if (!personaIds.length) {
      return {
        summary: { totalTargets: 0, generated: 0, skipped: 0, errors: 0 },
        variants: [],
      };
    }

    const personas = await this.db.persona.findMany({
      where: { id: { in: personaIds } },
      select: { id: true, code: true, name: true, description: true },
    });
    const existing = await this.db.campaignEmailVariant.findMany({
      where: { campaignId, personaId: { in: personaIds } },
      select: { id: true, personaId: true, status: true },
    });
    const existingByPersona = new Map(existing.map((v) => [v.personaId, v]));
    const pById = new Map(personas.map((p) => [p.id, p]));
    const results: {
      personaId: string;
      variantId?: string;
      status: 'generated' | 'skipped' | 'error';
      subject?: string | null;
      error?: string;
    }[] = [];

    // 3) loop personas
    for (const personaId of personaIds) {
      const persona = pById.get(personaId);
      if (!persona) {
        results.push({
          personaId,
          status: 'error',
          error: 'Persona not found',
        });
        continue;
      }

      const prev = existingByPersona.get(personaId);
      if (prev && dto.overwrite !== true && prev.status !== 'ERROR') {
        results.push({ personaId, variantId: prev.id, status: 'skipped' });
        continue;
      }

      try {
        const baseTemplate = ss.commonTemplate
          ? ({
              subject: ss.commonTemplate.subject,
              preheader: ss.commonTemplate.preheader,
              html: ss.commonTemplate.html,
            } as CommonTemplateDto)
          : undefined;

        const prompt = buildEmailFromBriefPrompt({
          persona,
          companyProfile,
          brief,
          baseTemplate, // use the common template
        });

        const ai = await callOpenAiAndParse({
          user: `email-variant-${campaignId}-${persona.code}`,
          prompt,
          schema: EmailVariantSchema,
          systemPrompt:
            'You are a world-class email copywriter and HTML email coder.',
          model: 'gpt-4o',
          temperature: 0.4,
          maxTokens: 1200,
        });

        const briefPlain = instanceToPlain(brief) as Record<string, unknown>;
        const promptPayload = {
          persona: { id: personaId, code: persona.code },
          brief: briefPlain,
        };

        const variant = await this.db.campaignEmailVariant.upsert({
          where: { campaignId_personaId: { campaignId, personaId } },
          create: {
            campaignId,
            personaId,
            subject: ai.subject,
            html: ai.html,
            status: 'GENERATED',
            aiModel: 'gpt-4o',
            prompt: promptPayload as Prisma.InputJsonValue,
          },
          update: {
            subject: ai.subject,
            html: ai.html,
            status: 'GENERATED',
            aiModel: 'gpt-4o',
            lastError: null,
            prompt: promptPayload as Prisma.InputJsonValue,
          },
        });

        await this.db.campaignRecipient.updateMany({
          where: { campaignId, personaId },
          data: { variantId: variant.id },
        });

        results.push({
          personaId,
          variantId: variant.id,
          status: 'generated',
          subject: variant.subject,
        });
      } catch (e: any) {
        const v = await this.db.campaignEmailVariant.upsert({
          where: { campaignId_personaId: { campaignId, personaId } },
          create: {
            campaignId,
            personaId,
            status: 'ERROR',
            lastError: String(e),
          },
          update: { status: 'ERROR', lastError: String(e) },
        });
        results.push({
          personaId,
          variantId: v.id,
          status: 'error',
          error: String(e),
        });
      }
    }

    const summary = {
      totalTargets: personaIds.length,
      generated: results.filter((r) => r.status === 'generated').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      errors: results.filter((r) => r.status === 'error').length,
    };

    return { summary, variants: results };
  }
}
