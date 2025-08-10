import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CampaignStatus } from './campaign-status.enum';
import {
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
} from './dto/campaign-draft.dto';
import { Prisma } from 'generated/prisma';
import { instanceToPlain } from 'class-transformer';
import { isJsonObject, omit } from 'src/utils';
import { CompanyProfileDto } from './dto/campaign-step-state.dto';

const campaignInclude = {
  user: { select: { id: true, email: true } },
  companyProfile: true,
  classifiedPersonaFile: true,
} as const;

@Injectable()
export class CampaignService {
  constructor(private dbService: DatabaseService) {}

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

    // ensure the row belongs to the user (and keep update()'s where unique)
    await this.dbService.campaign.findFirstOrThrow({ where: { id, userId } });

    let companyProfileId: string | undefined;
    if (dto.stepState && typeof dto.stepState === 'object') {
      const rawState = instanceToPlain(dto.stepState);
      if ((rawState?.companyProfile as CompanyProfileDto)?.id) {
        companyProfileId = (rawState?.companyProfile as CompanyProfileDto).id;
      }
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
        ...(dto.stepState !== undefined
          ? {
              stepState: instanceToPlain(
                dto.stepState,
              ) as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.analysisSteps !== undefined
          ? {
              analysisSteps:
                dto.analysisSteps as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(companyProfileId
          ? { companyProfileId }
          : { companyProfileId: null }),
        lastSavedAt: new Date(),
      },
      include: campaignInclude,
    });
  }

  async deleteDraftCampaign(userId: string, id: string) {
    return this.dbService.campaign.delete({
      where: { id, userId },
    });
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
}
