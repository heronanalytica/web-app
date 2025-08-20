import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { DatabaseModule } from '../database/database.module';
import { AiMarketingModule } from 'src/ai-marketing/ai-marketing.module';

@Module({
  imports: [DatabaseModule, AiMarketingModule],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
