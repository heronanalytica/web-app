import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { CampaignDraftsController } from './campaign-drafts.controller';
import { CampaignRenderedEmailsController } from './campaign-rendered-emails.controller';
import { DatabaseModule } from '../database/database.module';
import { AiMarketingModule } from 'src/ai-marketing/ai-marketing.module';
import { AwsModule } from 'src/aws/aws.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [DatabaseModule, AiMarketingModule, AwsModule, MailModule],
  controllers: [
    CampaignController, 
    CampaignDraftsController, 
    CampaignRenderedEmailsController
  ],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
