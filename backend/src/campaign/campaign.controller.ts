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
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import {
  AdminUpdateDraftCampaignDto,
  CreateDraftCampaignDto,
  UpdateDraftCampaignDto,
} from './dto/campaign-draft.dto';
import { UpdateAnalysisStepsDto } from './dto/campaign-step-state.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request } from 'express';
import { EAuthRole } from '../auth/auth.types';
import { UpdateClassifiedPersonaDto } from './dto/update-classified-persona.dto';
import { AiMarketingService } from 'src/ai-marketing/ai-marketing.service';
import { RenderedEmailsImportDto } from './dto/rendered-emails.dto';
import { ImportRenderedFromFileDto } from './dto/import-rendered-from-file.dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly aiMarketingService: AiMarketingService,
  ) {}

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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
    @Body() dto: UpdateDraftCampaignDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    dto.id = id;
    const data = await this.campaignService.updateDraftCampaign(userId, dto);
    return { error: 0, data };
  }

  @Patch(':id/admin/draft')
  @UseGuards(AdminGuard)
  async updateDraftCampaignAdmin(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminUpdateDraftCampaignDto,
  ) {
    dto.id = id;
    const data = await this.campaignService.updateDraftCampaign(
      dto.userId,
      dto,
    );
    return { error: 0, data };
  }

  @Delete(':id/draft')
  async deleteDraftCampaign(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.deleteDraftCampaign(userId, id);
    return { error: 0, data };
  }

  @Patch(':id/analysis-steps')
  @UseGuards(AdminGuard)
  async updateAnalysisSteps(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAnalysisStepsDto,
  ) {
    if (!req.user?.id) throw new UnauthorizedException();

    const data = await this.campaignService.updateAnalysisSteps(
      id,
      dto.steps.map((step) => ({
        key: step.key,
        status: step.status,
      })),
    );
    return { error: 0, data };
  }

  /**
   * Attach classified persona file to a campaign
   */
  @Patch(':id/classified-persona')
  @UseGuards(AdminGuard)
  async updateClassifiedPersona(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateClassifiedPersonaDto,
  ): Promise<{ error: number; data: any }> {
    if (!req.user?.id) throw new UnauthorizedException();

    const data = await this.campaignService.updateClassifiedPersona(
      id,
      dto.fileId,
      dto.fileName,
    );
    return { error: 0, data };
  }

  /**
   * Remove classified persona file from a campaign
   */
  @Delete(':id/classified-persona')
  @UseGuards(AdminGuard)
  async removeClassifiedPersona(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<{ error: number; data: any }> {
    if (!req.user?.id) throw new UnauthorizedException();

    const data = await this.campaignService.removeClassifiedPersona(id);
    return { error: 0, data };
  }

  @Post(':id/common-template')
  async generateCommonTemplate(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const data = await this.campaignService.generateAndPersistCommonTemplate(
      userId,
      id,
    );
    return { error: 0, data };
  }

  @Post(':id/rendered-emails/import')
  @UseGuards(AdminGuard)
  async importRenderedEmailsForCampaign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RenderedEmailsImportDto,
  ) {
    const data = await this.campaignService.importRenderedEmailsFromJsonAdmin(
      id,
      dto,
    );
    return { error: 0, data };
  }

  @Post(':id/rendered-emails/import-file')
  @UseGuards(AdminGuard)
  async importRenderedEmailsFromFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ImportRenderedFromFileDto,
  ) {
    const data = await this.campaignService.importRenderedEmailsFromFileAdmin(
      id,
      dto.fileId,
    );
    return { error: 0, data };
  }

  /**
   * Client endpoint: list rendered emails for this campaign (owner only).
   * Supports q (search), page, limit.
   */
  @Get(':id/rendered-emails')
  async listRenderedEmailsForOwner(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('q') q?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    const data = await this.campaignService.listRenderedEmailsForCampaign(
      userId,
      id,
      { q, page, limit },
    );
    return { error: 0, data };
  }
}
