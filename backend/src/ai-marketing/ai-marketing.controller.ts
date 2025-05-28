import { Body, Controller, Post } from '@nestjs/common';
import { SegmentAnalysisDto } from './dto/segment-analysis.dto';
import { AiMarketingService } from './ai-marketing.service';

@Controller('ai-marketing')
export class AiMarketingController {
  constructor(private readonly aiMarketingService: AiMarketingService) {}

  @Post('analyze')
  async analyzeSegmentsAndCompany(@Body() dto: SegmentAnalysisDto) {
    return this.aiMarketingService.analyze(dto);
  }

  @Post('generate-campaign-templates')
  async generateCampaignTemplates(@Body() dto: SegmentAnalysisDto) {
    return this.aiMarketingService.generateCampaignTemplates(dto);
  }
}
