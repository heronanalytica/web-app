import { Controller, Get, Req, UseGuards, UnauthorizedException, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignRenderedEmailsController {
  constructor(private readonly campaignService: CampaignService) {}

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

    const data = await this.campaignService.listRenderedEmailsForCampaign(userId, id, { q, page, limit });
    return { error: 0, data };
  }
}
