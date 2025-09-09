import { Module } from '@nestjs/common';
import { AiMarketingController } from './ai-marketing.controller';
import { AiMarketingService } from './ai-marketing.service';
import { DatabaseModule } from '../database/database.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [DatabaseModule, AwsModule],
  controllers: [AiMarketingController],
  providers: [AiMarketingService],
  exports: [AiMarketingService],
})
export class AiMarketingModule {}
