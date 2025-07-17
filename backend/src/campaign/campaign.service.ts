import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CampaignStatus } from './campaign-status.enum';
import {
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
} from './dto/campaign-draft.dto';
import { Prisma } from 'generated/prisma';
import { instanceToPlain } from 'class-transformer';

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
    });
  }

  async createDraftCampaign(userId: string, dto: CreateDraftCampaignDto) {
    return this.dbService.campaign.create({
      data: {
        name: dto.name,
        userId,
        status: CampaignStatus.DRAFT,
        currentStep: dto.currentStep ?? 1,
        lastSavedAt: new Date(),
      },
    });
  }

  async updateDraftCampaign(userId: string, dto: UpdateDraftCampaignDto) {
    // Only allow updating allowed fields
    const { id, name, currentStep, status } = dto;
    return this.dbService.campaign.update({
      where: { id, userId },
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
        lastSavedAt: new Date(),
      },
    });
  }

  async deleteDraftCampaign(userId: string, id: string) {
    return this.dbService.campaign.delete({
      where: { id, userId },
    });
  }
}
