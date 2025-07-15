import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';
import { SurveyModule } from './survey/survey.module';
import { AiMarketingModule } from './ai-marketing/ai-marketing.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    FeatureFlagModule,
    SurveyModule,
    AiMarketingModule,
    CampaignModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
