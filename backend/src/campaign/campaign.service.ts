import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CampaignStatus } from './campaign-status.enum';
import { MailService } from '../mail/mail.service';
import { MailProviderType } from '../mail/mail-provider.factory';
import {
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
} from './dto/campaign-draft.dto';
import { Prisma } from 'generated/prisma';
import { isJsonObject, toJsonValue } from 'src/utils';
import { AiMarketingService } from 'src/ai-marketing/ai-marketing.service';
import { merge, omit } from 'lodash';
import {
  sanitizeEmailHtml,
  sanitizeStepStateForStorage,
} from 'src/utils/sanitize';
import { RenderedEmailsImportDto } from './dto/rendered-emails.dto';
import { AwsService } from 'src/aws/aws.service';
import { Readable } from 'stream';
import { ProcessedRecipient } from './campaign-types';
import { StepStateDto } from './dto/campaign-step-state.dto';
import { Recipient } from 'src/mail/mail-provider.interface';

const campaignInclude = {
  user: { select: { id: true, email: true } },
  companyProfile: true,
  classifiedPersonaFile: true,
} as const;

type AnyObj = Record<string, any>;
type ListOpts = { q?: string; page?: number; limit?: number };

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private dbService: DatabaseService,
    private aiMarketing: AiMarketingService,
    private aws: AwsService,
    private mailService: MailService,
  ) {}

  private async _getStepState(campaignId: string): Promise<StepStateDto> {
    const row = await this.dbService.campaign.findFirstOrThrow({
      where: { id: campaignId },
      select: { stepState: true },
    });
    return row.stepState as StepStateDto;
  }

  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    return await new Promise<string>((resolve, reject) => {
      stream.on('data', (c) =>
        chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)),
      );
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }

  async getUserCampaigns(userId: string) {
    return this.dbService.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaign(userId: string, name: string) {
    return this.dbService.campaign.create({
      data: {
        name,
        userId,
        status: CampaignStatus.DRAFT,
      },
    });
  }

  async getUserDraftCampaigns(userId: string) {
    return this.dbService.campaign.findMany({
      where: { userId, status: CampaignStatus.DRAFT },
      orderBy: { lastSavedAt: 'desc' },
      include: campaignInclude,
    });
  }

  async getDraftCampaign(userId: string, id: string) {
    return this.dbService.campaign.findFirst({
      where: { id, userId, status: CampaignStatus.DRAFT },
    });
  }

  async getCampaignById(userId: string, id: string) {
    return this.dbService.campaign.findFirst({
      where: { id, userId },
      include: campaignInclude,
    });
  }

  async getAllCampaigns(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.dbService.campaign.count(),
      this.dbService.campaign.findMany({
        include: campaignInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async createDraftCampaign(userId: string, dto: CreateDraftCampaignDto) {
    return this.dbService.campaign.create({
      data: {
        name: dto.name,
        userId,
        status: CampaignStatus.DRAFT,
        currentStep: 0,
        analysisSteps: [
          {
            key: 'analyzingCustomerDatabase',
            label: 'Analyzing customer database',
            status: 'waiting',
          },
          {
            key: 'analyzeBusinessData',
            label: 'Analyze business data',
            status: 'waiting',
          },
          {
            key: 'integrationsWithOtherPlatforms',
            label: 'Integrations with other platforms',
            status: 'waiting',
          },
          { key: 'wrappingUp', label: 'Wrapping up', status: 'waiting' },
        ],
        lastSavedAt: new Date(),
      },
    });
  }

  async updateDraftCampaign(userId: string, dto: UpdateDraftCampaignDto) {
    const { id, name, currentStep, status } = dto;
    await this.dbService.campaign.findFirstOrThrow({ where: { id, userId } });

    // read existing state
    const current = await this.dbService.campaign.findUnique({
      where: { id },
      select: { stepState: true },
    });

    // compute merged state if stepState present in dto
    let mergedSafe: Prisma.InputJsonValue | undefined;
    if (dto.stepState !== undefined) {
      const existing =
        current && isJsonObject(current.stepState)
          ? (current.stepState as Record<string, unknown>)
          : {};
      const incoming = isJsonObject(dto.stepState as any)
        ? (dto.stepState as Record<string, unknown>)
        : {};

      const merged = merge({}, existing, incoming);
      const sanitized = sanitizeStepStateForStorage(merged);
      mergedSafe = toJsonValue(sanitized);
    }

    const companyProfileId: string | undefined = (mergedSafe as StepStateDto)
      ?.companyProfile?.id;

    return this.dbService.campaign.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(currentStep !== undefined ? { currentStep } : {}),
        ...(status !== undefined &&
        Object.values(CampaignStatus).includes(status as CampaignStatus)
          ? { status: status as CampaignStatus }
          : {}),
        ...(mergedSafe !== undefined ? { stepState: mergedSafe } : {}),
        ...(dto.analysisSteps !== undefined
          ? {
              analysisSteps:
                dto.analysisSteps as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(companyProfileId !== undefined ? { companyProfileId } : {}),
        lastSavedAt: new Date(),
      },
      include: campaignInclude,
    });
  }

  async deleteDraftCampaign(userId: string, id: string) {
    await this.dbService.campaign.findFirstOrThrow({ where: { id, userId } });
    return this.dbService.campaign.delete({ where: { id } });
  }

  async updateAnalysisSteps(
    campaignId: string,
    steps: Array<{ key: string; status: string }>,
  ) {
    // First get the current campaign to preserve existing steps
    const campaign = await this.dbService.campaign.findUnique({
      where: { id: campaignId },
      select: { analysisSteps: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Create a map of the new steps for easy lookup
    const stepsMap = new Map(steps.map((step) => [step.key, step]));

    // Update existing steps with new statuses, preserving other properties
    const currentSteps = (campaign.analysisSteps || []) as Array<{
      key: string;
      label: string;
      status: string;
    }>;

    const updatedSteps = currentSteps.map((step) => {
      const updatedStep = stepsMap.get(step.key);
      if (updatedStep) {
        return { ...step, status: updatedStep.status };
      }
      return step;
    });

    // Update the campaign with the new steps
    return this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        analysisSteps: updatedSteps as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      include: campaignInclude,
    });
  }

  async updateClassifiedPersona(
    campaignId: string,
    fileId: string,
    fileName: string,
  ) {
    // Get existing stepState
    const campaign = await this.dbService.campaign.findUnique({
      where: { id: campaignId },
      select: { stepState: true },
    });

    if (!campaign) throw new Error('Campaign not found');

    const existingState =
      typeof campaign.stepState === 'object' && campaign.stepState !== null
        ? { ...campaign.stepState }
        : {};

    const updatedState = {
      ...existingState,
      classifiedPersonaFile: {
        fileId,
        fileName,
      },
    };

    return this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        classifiedPersonaFileId: fileId,
        stepState: updatedState as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      include: campaignInclude,
    });
  }

  async removeClassifiedPersona(campaignId: string) {
    const campaign = await this.dbService.campaign.findUnique({
      where: { id: campaignId },
      select: { stepState: true },
    });

    if (!campaign) throw new Error('Campaign not found');

    let updatedState: Prisma.JsonObject = {};

    if (isJsonObject(campaign.stepState)) {
      updatedState = omit(campaign.stepState, ['classifiedPersonaFile']);
    }

    return this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        classifiedPersonaFileId: null,
        stepState: updatedState,
        updatedAt: new Date(),
      },
      include: campaignInclude,
    });
  }

  private async setStep(
    campaignId: string,
    key: string,
    status: 'waiting' | 'in_progress' | 'done' | 'error',
  ) {
    const current = await this.dbService.campaign.findUnique({
      where: { id: campaignId },
      select: { analysisSteps: true },
    });
    const steps = (current?.analysisSteps as AnyObj[]) ?? [];
    const exists = steps.find((s) => s.key === key);
    const updated = exists
      ? steps.map((s) => (s.key === key ? { ...s, status } : s))
      : [...steps, { key, label: key, status }];
    await this.dbService.campaign.update({
      where: { id: campaignId },
      data: { analysisSteps: updated as Prisma.InputJsonValue },
    });
  }

  /**
   * Single call used by the UI:
   *  - ask AI for the common template (no writes)
   *  - deep-merge into existing stepState
   *  - persist
   */
  async generateAndPersistCommonTemplate(userId: string, campaignId: string) {
    // 1) Load current state
    const row = await this.dbService.campaign.findFirstOrThrow({
      where: { id: campaignId, userId },
      select: { stepState: true },
    });
    const stepState = isJsonObject(row.stepState)
      ? (row.stepState as StepStateDto)
      : {};

    // 2) generate (returns {subject, html})
    const tpl = stepState.generator?.uploadedHtml
      ? {
          subject: '',
          html: sanitizeEmailHtml(stepState.generator.uploadedHtml),
          preheader: '',
        }
      : await this.aiMarketing.generateCommonTemplate(userId, campaignId);

    // 3) merge (server is the source of truth; we preserve all prior keys)
    const merged = merge({}, stepState, {
      commonTemplate: {
        subject: tpl.subject,
        html: tpl.html,
        preheader: tpl.preheader,
      },
    });

    // 4) sanitize + coerce to JSON
    const sanitized = sanitizeStepStateForStorage(merged);
    const safe = toJsonValue(sanitized);

    // 5) persist
    await this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        stepState: safe,
        lastSavedAt: new Date(),
      },
    });

    return tpl; // return the template to the client if you want to preview it
  }

  /**
   * Admin imports pre-rendered emails JSON and upserts:
   * - Contact (scoped by campaign.userId)
   * - CampaignRecipient (personaCode/displayName, STAGED)
   * - CampaignRenderedEmail (1:1 with recipient, HTML stored)
   * Also refreshes stepState.summary (totals by personaCode).
   */
  async importRenderedEmailsFromJsonAdmin(
    campaignId: string,
    dto: RenderedEmailsImportDto,
  ) {
    // Fetch campaign + owner for contact scoping
    const campaign = await this.dbService.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, userId: true, stepState: true },
    });
    if (!campaign) throw new Error('Campaign not found');

    const userId = campaign.userId;

    let total = 0;
    let upsertedRecipients = 0;
    let upsertedEmails = 0;
    const errors: Array<{ index: number; message: string }> = [];

    for (let i = 0; i < dto.recipients.length; i++) {
      total++;
      const row = dto.recipients[i];
      try {
        const emailAddr = (row.customer.customer_email || '')
          .trim()
          .toLowerCase();
        if (!emailAddr) throw new Error('Missing customer_email');

        // Best-effort split name
        const dn = (row.customer.display_name || '').trim();
        const [firstName, ...rest] = dn ? dn.split(/\s+/) : [''];
        const lastName = rest.join(' ') || null;

        // Upsert Contact scoped by owner
        const contact = await this.dbService.contact.upsert({
          where: { userId_email: { userId, email: emailAddr } },
          create: {
            userId,
            email: emailAddr,
            firstName: firstName || null,
            lastName,
            attributes: { display_name: dn } as Prisma.InputJsonValue,
          },
          update: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          },
          select: { id: true },
        });

        // Persona bits (no Persona table)
        const personaCode = row.persona.persona_code?.trim() || null;
        const personaName = row.persona.persona_display_name?.trim() || null;
        const personaConfidence =
          typeof row.persona.match_confidence === 'number'
            ? Math.round(
                Math.max(0, Math.min(1, row.persona.match_confidence)) * 100,
              )
            : null;

        // Upsert CampaignRecipient (unique by campaignId+contactId)
        const recipient = await this.dbService.campaignRecipient.upsert({
          where: {
            campaignId_contactId: { campaignId, contactId: contact.id },
          },
          create: {
            campaignId,
            contactId: contact.id,
            personaCode: personaCode || undefined,
            personaDisplayName: personaName || undefined,
            personaConfidence,
            status: 'STAGED',
          },
          update: {
            personaCode: personaCode || undefined,
            personaDisplayName: personaName || undefined,
            personaConfidence,
            status: 'STAGED',
          },
          select: { id: true, personaCode: true },
        });
        upsertedRecipients++;

        // Upsert CampaignRenderedEmail by unique campaignRecipientId
        const m = row.email.meta;
        const rationaleObj: Prisma.InputJsonValue =
          row.personalization_rationale as unknown as Prisma.InputJsonValue;
        await this.dbService.campaignRenderedEmail.upsert({
          where: { campaignRecipientId: recipient.id },
          create: {
            campaignId,
            campaignRecipientId: recipient.id,
            emailId: row.email_id || null,
            fromAddress: m.from,
            toAddress: m.to,
            subject: m.subject,
            preheader: m.preheader || '',
            templateId: m.template_id || null,
            rationale: rationaleObj,
            html: row.email.html_body,
          },
          update: {
            emailId: row.email_id || null,
            fromAddress: m.from,
            toAddress: m.to,
            subject: m.subject,
            preheader: m.preheader || '',
            templateId: m.template_id || null,
            rationale: rationaleObj,
            html: row.email.html_body,
          },
        });
        upsertedEmails++;
      } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        errors.push({ index: i, message: String(e?.message || e) });
      }
    }

    // Update stepState.summary (totals by personaCode)
    const existingState =
      campaign.stepState && typeof campaign.stepState === 'object'
        ? (campaign.stepState as Record<string, unknown>)
        : {};

    // Compute actual totals from DB for correctness (optional)
    const grouped = await this.dbService.campaignRecipient.groupBy({
      by: ['personaCode'],
      where: { campaignId },
      _count: true,
    });
    const totalRecipients = grouped.reduce((a, r) => a + r._count, 0);
    const byPersona = Object.fromEntries(
      grouped.map((r) => [r.personaCode || 'unknown', r._count]),
    );

    const nextState: Prisma.JsonObject = {
      ...existingState,
      summary: {
        totalRecipients,
        byPersona,
      },
    };

    await this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        stepState: nextState,
        updatedAt: new Date(),
        lastSavedAt: new Date(),
      },
    });

    return {
      totalRows: total,
      upsertedRecipients,
      upsertedEmails,
      totalRecipients,
      byPersona,
      errors, // you can truncate this list in the controller if needed
    };
  }

  async importRenderedEmailsFromFileAdmin(campaignId: string, fileId: string) {
    // 1) locate file metadata
    const file = await this.dbService.userUploadFile.findFirstOrThrow({
      where: { id: fileId },
      select: { storageUrl: true, fileName: true },
    });

    // 2) download via AwsService (storageUrl is "s3://bucket/key")
    const s3Key = file.storageUrl.replace(/^s3:\/\/[^/]+\//, '');
    const stream = await this.aws.getObjectStreamFromS3(s3Key);
    const text = await this.streamToString(stream);

    // 3) parse safely into `unknown`, then normalize to recipients[]
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new Error('Invalid JSON file');
    }

    type URec = Record<string, unknown>;
    const isObj = (v: unknown): v is URec =>
      typeof v === 'object' && v !== null;

    let recipientsUnknown: unknown;
    if (Array.isArray(parsed)) {
      recipientsUnknown = parsed;
    } else if (isObj(parsed) && 'recipients' in parsed) {
      recipientsUnknown = (parsed as { recipients: unknown }).recipients;
    }
    if (!Array.isArray(recipientsUnknown)) {
      throw new Error(
        "JSON must include a top-level 'recipients' array (or be an array)",
      );
    }

    // 4) reuse existing importer
    const result = await this.importRenderedEmailsFromJsonAdmin(campaignId, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      recipients: recipientsUnknown as any, // DTO validated inside importer
    });

    // 5) remember which file was imported (nice-to-have for UI)
    const campaign = await this.dbService.campaign.findUnique({
      where: { id: campaignId },
      select: { stepState: true },
    });
    const existingState =
      campaign?.stepState && typeof campaign.stepState === 'object'
        ? (campaign.stepState as Record<string, unknown>)
        : {};

    await this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        stepState: {
          ...existingState,
          renderedEmailsFile: { fileId, fileName: file.fileName },
        } as Prisma.InputJsonValue,
        updatedAt: new Date(),
        lastSavedAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Owner-only read of rendered emails (with basic search + pagination).
   */
  async listRenderedEmailsForCampaign(
    userId: string,
    campaignId: string,
    { q, page = 1, limit = 50 }: ListOpts = {},
  ) {
    // Ensure the campaign belongs to the user
    await this.dbService.campaign.findFirstOrThrow({
      where: { id: campaignId, userId },
      select: { id: true },
    });

    const skip = Math.max(0, (page - 1) * limit);

    // Build the where clause with proper typing
    const where: Prisma.CampaignRecipientWhereInput = {
      campaignId,
      ...(q
        ? {
            OR: [
              {
                contact: {
                  email: { contains: q, mode: 'insensitive' as const },
                },
              },
              {
                contact: {
                  firstName: { contains: q, mode: 'insensitive' as const },
                },
              },
              {
                contact: {
                  lastName: { contains: q, mode: 'insensitive' as const },
                },
              },
              { personaCode: { contains: q, mode: 'insensitive' as const } },
              {
                personaDisplayName: {
                  contains: q,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.dbService.campaignRecipient.count({ where }),
      this.dbService.campaignRecipient.findMany({
        where,
        include: {
          contact: true,
          renderedEmail: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Process the rows to include related data
    const processedRows: ProcessedRecipient[] = rows
      .filter((row) => row.contact?.email !== null)
      .map((row) => {
        const contactData = row.contact
          ? {
              id: row.contact.id,
              email: row.contact.email,
              firstName: row.contact.firstName,
              lastName: row.contact.lastName,
              // Compute displayName from firstName and lastName if not null
              displayName:
                [row.contact.firstName, row.contact.lastName]
                  .filter(Boolean)
                  .join(' ') || row.contact.email,
            }
          : null;

        const renderedEmailData = row.renderedEmail
          ? {
              id: row.renderedEmail.id,
              subject: row.renderedEmail.subject,
              preheader: row.renderedEmail.preheader,
              html: row.renderedEmail.html,
              from: row.renderedEmail.fromAddress,
              to: row.renderedEmail.toAddress,
              rationale: row.renderedEmail.rationale,
            }
          : null;

        return {
          id: row.id,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          campaignId: row.campaignId,
          contact: contactData,
          personaCode: row.personaCode,
          personaDisplayName: row.personaDisplayName,
          personaConfidence: row.personaConfidence,
          renderedEmail: renderedEmailData,
        };
      });

    return {
      total,
      rows: processedRows,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async launchCampaign(id: string) {
    return this.dbService.$transaction(async (prisma) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: { companyProfile: true },
      });

      if (!campaign) throw new Error('Campaign not found');
      if (campaign.status === CampaignStatus.ACTIVE)
        throw new Error('Campaign is already active');
      if (!campaign.currentStep)
        throw new Error('Something went wrong, please try again');

      // ✅ Immediately mark campaign ACTIVE
      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          status: CampaignStatus.ACTIVE,
          launchedAt: new Date(),
          currentStep: campaign.currentStep + 1,
        },
      });

      // ✅ Kick off async send (fire-and-forget)
      this.sendInBackground(campaign.id, campaign.companyProfile!.name);

      return updatedCampaign;
    });
  }

  private sendInBackground(campaignId: string, fromName: string) {
    setImmediate(() => {
      void (async () => {
        try {
          const recipients = await this.dbService.campaignRecipient.findMany({
            where: { campaignId, status: 'STAGED' },
            include: { contact: true, renderedEmail: true },
          });

          const mappedRecipients: Recipient[] = recipients
            .filter((r) => r.contact?.email && r.renderedEmail)
            .map((r) => ({
              email: r.contact.email!,
              name:
                [r.contact.firstName, r.contact.lastName]
                  .filter(Boolean)
                  .join(' ') || undefined,
              subject: r.renderedEmail?.subject as string,
              html: r.renderedEmail?.html as string,
              preheader: r.renderedEmail?.preheader,
              fromEmail: process.env.SENDER_EMAIL!,
              fromName,
            }));

          const campaign = await this.dbService.campaign.findUnique({
            where: { id: campaignId },
          });
          if (!campaign) throw new Error('Campaign not found');

          const mailProvider = this.determineMailProvider(
            campaign.stepState as StepStateDto,
          );

          await this.mailService.sendCampaign(
            campaign,
            mappedRecipients,
            mailProvider,
          );

          this.logger.log(
            `Background send complete for campaign ${campaign.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Background send failed: ${error instanceof Error ? error.message : error}`,
            error instanceof Error ? error.stack : undefined,
          );

          await this.dbService.campaign.update({
            where: { id: campaignId },
            data: { status: CampaignStatus.PAUSED },
          });
        }
      })();
    });
  }

  private determineMailProvider(stepState: StepStateDto): MailProviderType {
    // Default to SENDER_NET if no specific provider is set
    if (!stepState?.mailService?.provider) {
      return MailProviderType.SENDER_NET;
    }

    // Map the provider from stepState to MailProviderType
    switch (stepState.mailService.provider) {
      case 'mailchimp':
        return MailProviderType.MAILCHIMP;
      case 'hubspot':
        return MailProviderType.HUBSPOT;
      case 'sender_net':
      default:
        return MailProviderType.SENDER_NET;
    }
  }
}
