import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  Patch,
  Delete,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import {
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
  DeleteDraftCampaignDto,
  GetDraftCampaignDto,
} from './dto/campaign-draft.dto';
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

  @Get('draft')
  async getUserDraftCampaigns(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.campaignService.getUserDraftCampaigns(userId),
    };
  }

  @Get(':id/draft')
  async getDraftCampaign(
    @Req() req: Request,
    @Body() dto: GetDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.campaignService.getDraftCampaign(userId, dto),
    };
  }

  @Post('draft')
  async createDraftCampaign(
    @Req() req: Request,
    @Body() dto: CreateDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.campaignService.createDraftCampaign(userId, dto),
    };
  }

  @Patch(':id/draft')
  async updateDraftCampaign(
    @Req() req: Request,
    @Body() dto: UpdateDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.campaignService.updateDraftCampaign(userId, dto),
    };
  }

  @Delete(':id/draft')
  async deleteDraftCampaign(
    @Req() req: Request,
    @Body() dto: DeleteDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.campaignService.deleteDraftCampaign(userId, dto),
    };
  }
}
