import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';
import { SurveyModule } from './survey/survey.module';
import { AiMarketingModule } from './ai-marketing/ai-marketing.module';
import { CampaignModule } from './campaign/campaign.module';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AuthModule,
    MailModule,
    DatabaseModule,
    FeatureFlagModule,
    SurveyModule,
    AiMarketingModule,
    CampaignModule,
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
