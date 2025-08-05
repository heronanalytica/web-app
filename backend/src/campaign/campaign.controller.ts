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
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import {
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
} from './dto/campaign-draft.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { EAuthRole } from '../auth/auth.types';

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
    const data = await this.campaignService.getUserCampaigns(userId);
    return { error: 0, data };
  }

  @Get('admin/all')
  async getAllCampaigns(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    // Check if user is admin
    if (req.user?.role !== EAuthRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const data = await this.campaignService.getAllCampaigns(pageNum, limitNum);
    return { error: 0, data };
  }

  @Post()
  async createCampaign(
    @Req() req: Request,
    @Body() dto: CreateDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.createDraftCampaign(userId, dto);
    return { error: 0, data };
  }

  @Get('draft')
  async getUserDraftCampaigns(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.getUserDraftCampaigns(userId);
    return { error: 0, data };
  }

  @Get(':id/draft')
  async getDraftCampaign(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.getDraftCampaign(userId, id);
    return { error: 0, data };
  }

  @Get(':id')
  async getCampaignById(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.getCampaignById(userId, id);
    return { error: 0, data };
  }

  @Patch(':id/draft')
  async updateDraftCampaign(
    @Req() req: Request,
    @Body() dto: UpdateDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.updateDraftCampaign(userId, dto);
    return { error: 0, data };
  }

  @Delete(':id/draft')
  async deleteDraftCampaign(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.deleteDraftCampaign(userId, id);
    return { error: 0, data };
  }
}
