import { Module } from '@nestjs/common';
import { CompanyProfileController } from './company-profile.controller';
import { CompanyProfileService } from './company-profile.service';
import { DatabaseModule } from '../database/database.module';
import { AiMarketingService } from '../ai-marketing/ai-marketing.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyProfileController],
  providers: [CompanyProfileService, AiMarketingService],
})
export class CompanyProfileModule {}
