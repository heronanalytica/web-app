import { Module } from '@nestjs/common';
import { AiMarketingController } from './ai-marketing.controller';
import { AiMarketingService } from './ai-marketing.service';

@Module({
  controllers: [AiMarketingController],
  providers: [AiMarketingService],
})
export class AiMarketingModule {}
