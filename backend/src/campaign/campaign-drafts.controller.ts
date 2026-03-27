import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException, Patch, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateDraftCampaignDto, UpdateDraftCampaignDto } from './dto/campaign-draft.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CampaignStepStateSchema } from './validation/campaign.schemas';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignDraftsController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  async createCampaign(@Req() req: Request, @Body() dto: CreateDraftCampaignDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    
    // Strict Zod JSON schema validation
    if (dto.stepState) {
       CampaignStepStateSchema.parse(dto.stepState);
    }
    
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

  @Patch(':id/draft')
  async updateDraftCampaign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
    @Body() dto: UpdateDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    
    // Strict Zod JSON schema validation
    if (dto.stepState) {
       CampaignStepStateSchema.parse(dto.stepState);
    }
    
    dto.id = id;
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

  @Post(':id/common-template')
  async generateCommonTemplate(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.generateAndPersistCommonTemplate(userId, id);
    return { error: 0, data };
  }
}
