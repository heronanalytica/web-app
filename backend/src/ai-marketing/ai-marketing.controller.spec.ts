import { Test, TestingModule } from '@nestjs/testing';
import { AiMarketingController } from './ai-marketing.controller';

describe('AiMarketingController', () => {
  let controller: AiMarketingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiMarketingController],
    }).compile();

    controller = module.get<AiMarketingController>(AiMarketingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
