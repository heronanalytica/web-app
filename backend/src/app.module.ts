import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';
import { AiMarketingModule } from './ai-marketing/ai-marketing.module';
import { CampaignModule } from './campaign/campaign.module';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { CompanyProfileModule } from './company-profile/company-profile.module';

@Module({
  imports: [
    AuthModule,
    MailModule,
    DatabaseModule,
    FeatureFlagModule,
    AiMarketingModule,
    CampaignModule,
    FileModule,
    CompanyProfileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
