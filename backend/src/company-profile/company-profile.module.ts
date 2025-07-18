import { Module } from '@nestjs/common';
import { CompanyProfileController } from './company-profile.controller';
import { CompanyProfileService } from './company-profile.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyProfileController],
  providers: [CompanyProfileService],
})
export class CompanyProfileModule {}
