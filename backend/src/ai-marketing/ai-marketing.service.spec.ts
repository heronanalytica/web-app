import { Test, TestingModule } from '@nestjs/testing';
import { AiMarketingService } from './ai-marketing.service';

describe('AiMarketingService', () => {
  let service: AiMarketingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiMarketingService],
    }).compile();

    service = module.get<AiMarketingService>(AiMarketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
