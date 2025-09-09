import { Module } from '@nestjs/common';
import { CompanyProfileController } from './company-profile.controller';
import { CompanyProfileService } from './company-profile.service';
import { DatabaseModule } from '../database/database.module';
import { AiMarketingModule } from '../ai-marketing/ai-marketing.module';

@Module({
  imports: [DatabaseModule, AiMarketingModule],
  controllers: [CompanyProfileController],
  providers: [CompanyProfileService],
})
export class CompanyProfileModule {}
