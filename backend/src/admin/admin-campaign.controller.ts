import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
  Query,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CampaignService } from '../campaign/campaign.service';
import { AdminUpdateDraftCampaignDto } from '../campaign/dto/campaign-draft.dto';
import { UpdateAnalysisStepsDto } from '../campaign/dto/campaign-step-state.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateClassifiedPersonaDto } from '../campaign/dto/update-classified-persona.dto';
import { RenderedEmailsImportDto } from '../campaign/dto/rendered-emails.dto';
import { ImportRenderedFromFileDto } from '../campaign/dto/import-rendered-from-file.dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get('admin/all')
  async getAllCampaigns(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }
    const data = await this.campaignService.getAllCampaigns(pageNum, limitNum);
    return { error: 0, data };
  }

  @Patch(':id/admin/draft')
  async updateDraftCampaignAdmin(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminUpdateDraftCampaignDto,
  ) {
    dto.id = id;
    const data = await this.campaignService.updateDraftCampaign(dto.userId, dto);
    return { error: 0, data };
  }

  @Patch(':id/analysis-steps')
  async updateAnalysisSteps(
    @Param('id') id: string,
    @Body() dto: UpdateAnalysisStepsDto,
  ) {
    const data = await this.campaignService.updateAnalysisSteps(
      id,
      dto.steps.map((step) => ({
        key: step.key,
        status: step.status as any,
      })),
    );
    return { error: 0, data };
  }

  @Patch(':id/classified-persona')
  async updateClassifiedPersona(
    @Param('id') id: string,
    @Body() dto: UpdateClassifiedPersonaDto,
  ) {
    const data = await this.campaignService.updateClassifiedPersona(id, dto.fileId, dto.fileName);
    return { error: 0, data };
  }

  @Delete(':id/classified-persona')
  async removeClassifiedPersona(@Param('id') id: string) {
    const data = await this.campaignService.removeClassifiedPersona(id);
    return { error: 0, data };
  }

  @Post(':id/rendered-emails/import')
  async importRenderedEmailsForCampaign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RenderedEmailsImportDto,
  ) {
    const data = await this.campaignService.importRenderedEmailsFromJsonAdmin(id, dto);
    return { error: 0, data };
  }

  @Post(':id/rendered-emails/import-file')
  async importRenderedEmailsFromFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ImportRenderedFromFileDto,
  ) {
    const data = await this.campaignService.importRenderedEmailsFromFileAdmin(id, dto.fileId);
    return { error: 0, data };
  }
}
