import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async getUserCampaigns(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      error: 0,
      data: await this.campaignService.getUserCampaigns(userId),
    };
  }

  @Post()
  async createCampaign(@Req() req: Request, @Body() dto: { name: string }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      error: 0,
      data: await this.campaignService.createCampaign(userId, dto.name),
    };
  }
}
