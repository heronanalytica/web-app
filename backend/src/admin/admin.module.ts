import { Module } from '@nestjs/common';
import { AdminCampaignController } from './admin-campaign.controller';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [CampaignModule],
  controllers: [AdminCampaignController],
})
export class AdminModule {}
