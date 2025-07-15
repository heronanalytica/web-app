import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

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
        status: 'DRAFT',
      },
    });
  }
}
