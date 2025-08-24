import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CampaignStatus } from './campaign-status.enum';
import {
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
} from './dto/campaign-draft.dto';
import { Prisma } from 'generated/prisma';
import { getCol, isJsonObject, omit, slug, toJsonValue } from 'src/utils';
import { StepStateDto } from './dto/campaign-step-state.dto';
import { ImportClassifiedDto } from './dto/import-classified.dto';
import * as Papa from 'papaparse';
import { AiMarketingService } from 'src/ai-marketing/ai-marketing.service';
import { merge } from 'lodash';
import { sanitizeStepStateForStorage } from 'src/utils/sanitize';

const campaignInclude = {
  user: { select: { id: true, email: true } },
  companyProfile: true,
  classifiedPersonaFile: true,
} as const;

type AnyObj = Record<string, any>;
type ClassifiedRow = Record<string, string>;

@Injectable()
export class CampaignService {
  constructor(
    private dbService: DatabaseService,
    private aiMarketing: AiMarketingService,
  ) {}

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
    // 1) generate (returns {subject, html})
    const tpl = await this.aiMarketing.generateCommonTemplate(
      userId,
      campaignId,
    );

    // 2) load current state
    const row = await this.dbService.campaign.findFirstOrThrow({
      where: { id: campaignId, userId },
      select: { stepState: true },
    });

    const existing = isJsonObject(row.stepState)
      ? (row.stepState as Record<string, unknown>)
      : {};

    // 3) merge (server is the source of truth; we preserve all prior keys)
    const merged = merge({}, existing, {
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

  async prepareCampaign(userId: string, campaignId: string) {
    // ensure ownership & get stepState
    const campaign = await this.dbService.campaign.findFirstOrThrow({
      where: { id: campaignId, userId },
      select: { id: true, stepState: true },
    });
    const ss = (campaign.stepState ?? {}) as StepStateDto;
    const fileRef = ss.classifiedPersonaFile ?? null;
    if (!fileRef?.fileId)
      throw new Error('Classified persona file is not attached.');

    await this.setStep(campaignId, 'importingRecipients', 'in_progress');
    const importSummary = await this.importClassifiedRecipients(
      userId,
      campaignId,
      { fileId: fileRef.fileId },
    );
    await this.setStep(campaignId, 'importingRecipients', 'done');

    await this.setStep(campaignId, 'generatingVariants', 'in_progress');
    const genResult = await this.aiMarketing.generateCampaignEmailVariants(
      userId,
      campaignId,
      { overwrite: false },
    );
    await this.setStep(campaignId, 'generatingVariants', 'done');

    // recompute + persist step-level audience summary for UI
    const grouped = await this.dbService.campaignRecipient.groupBy({
      by: ['personaId'],
      where: { campaignId },
      _count: true,
    });
    const stepSummary = {
      totalRecipients: grouped.reduce((a, r) => a + r._count, 0),
      byPersona: Object.fromEntries(
        grouped.map((r) => [r.personaId, r._count]),
      ),
    };

    const currentState: Prisma.JsonObject = isJsonObject(ss as Prisma.JsonValue)
      ? (ss as Prisma.JsonObject)
      : {};

    const stepSummaryJson: Prisma.JsonObject = {
      totalRecipients: stepSummary.totalRecipients ?? 0,
      byPersona: stepSummary.byPersona ?? {},
    };

    const nextState: Prisma.JsonObject = {
      ...currentState,
      summary: stepSummaryJson,
    };

    await this.dbService.campaign.update({
      where: { id: campaignId },
      data: {
        stepState: nextState, // <- no cast required
        lastSavedAt: new Date(),
      },
    });

    return { importSummary, genResult, stepSummary };
  }

  async importClassifiedRecipients(
    userId: string,
    campaignId: string,
    dto: ImportClassifiedDto,
  ) {
    // 1) find file URL
    const file = await this.dbService.userUploadFile.findFirstOrThrow({
      where: { id: dto.fileId },
      select: { storageUrl: true },
    });

    // 2) fetch CSV
    const res = await fetch(file.storageUrl);
    if (!res.ok) throw new Error(`Unable to download CSV (${res.status})`);
    const csvText = await res.text();

    // 3) parse
    const parsed = Papa.parse<ClassifiedRow>(csvText, {
      header: dto.hasHeader !== false,
      skipEmptyLines: true,
    });
    if (parsed.errors.length) {
      throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
    }
    const rows: ClassifiedRow[] = parsed.data;

    // default column names
    const FIRST = dto.firstNameCol ?? 'First Name';
    const LAST = dto.lastNameCol ?? 'Last Name';
    const EMAIL = dto.emailCol ?? 'Email';
    const PERS = dto.personaCol ?? 'Persona';
    const ACC = dto.accuracyCol ?? 'Accuracy';

    let total = 0,
      imported = 0,
      failed = 0;
    const personaCache = new Map<string, { id: string; code: string }>();

    // 4) iterate
    for (const row of rows) {
      total++;
      try {
        const email = getCol(row, EMAIL);
        const firstName = getCol(row, FIRST);
        const lastName = getCol(row, LAST);
        const personaName = getCol(row, PERS);
        const accStr = getCol(row, ACC);
        const personaConfidence = accStr ? Math.round(Number(accStr)) : null;

        if (!personaName) throw new Error('Missing Persona');
        // upsert persona
        let persona = personaCache.get(personaName);
        if (!persona) {
          const code = slug(personaName) || 'persona';
          const p = await this.dbService.persona.upsert({
            where: { code },
            create: { code, name: personaName },
            update: { name: personaName },
            select: { id: true, code: true },
          });
          persona = p;
          personaCache.set(personaName, p);
        }

        // upsert contact (scoped by owner)
        const contact = await this.dbService.contact.upsert({
          where: { userId_email: { userId, email } }, // add @@unique([userId, email]) if you prefer; otherwise use find+create
          create: {
            userId,
            email,
            firstName,
            lastName,
            attributes: row as Prisma.InputJsonValue,
          },
          update: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            attributes: row as Prisma.InputJsonValue,
          },
          select: { id: true },
        });

        // create CampaignRecipient if not exists
        await this.dbService.campaignRecipient.upsert({
          where: {
            campaignId_contactId: { campaignId, contactId: contact.id },
          },
          create: {
            campaignId,
            contactId: contact.id,
            personaId: persona.id,
            personaConfidence,
            status: 'PENDING',
          },
          update: {
            personaId: persona.id,
            personaConfidence,
          },
        });

        imported++;
      } catch {
        failed++;
        // optional: collect error rows
      }
    }

    // 5) audit row
    await this.dbService.audienceImport.create({
      data: {
        campaignId,
        sourceFileId: dto.fileId,
        total,
        imported,
        failed,
      },
    });

    return { total, imported, failed };
  }
}
