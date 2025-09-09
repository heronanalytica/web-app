import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { DatabaseModule } from '../database/database.module';
import { AiMarketingModule } from 'src/ai-marketing/ai-marketing.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [DatabaseModule, AiMarketingModule, AwsModule],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
