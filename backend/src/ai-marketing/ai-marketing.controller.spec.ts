import { Test, TestingModule } from '@nestjs/testing';
import { AiMarketingController } from './ai-marketing.controller';
import { AiMarketingService } from './ai-marketing.service';

describe('AiMarketingController', () => {
  let controller: AiMarketingController;
  let service: jest.Mocked<AiMarketingService>;

  beforeEach(async () => {
    const mockService = {
      analyze: jest.fn(),
      generateCampaignTemplates: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiMarketingController],
      providers: [{ provide: AiMarketingService, useValue: mockService }],
    }).compile();

    controller = module.get<AiMarketingController>(AiMarketingController);
    service = module.get(AiMarketingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeSegmentsAndCompany', () => {
    it('should call service analyze', async () => {
      service.analyze.mockResolvedValue({} as any);
      const dto = { segments: ['A'], companyUrl: 'http' } as any;
      const result = await controller.analyzeSegmentsAndCompany(dto);
      expect(service.analyze).toHaveBeenCalledWith(dto);
      expect(result).toBeDefined();
    });
  });

  describe('generateCampaignTemplates', () => {
    it('should call service generateCampaignTemplates', async () => {
      service.generateCampaignTemplates.mockResolvedValue({ templates: [] });
      const dto = { segments: ['A'], companyUrl: 'http' } as any;
      const result = await controller.generateCampaignTemplates(dto);
      expect(service.generateCampaignTemplates).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ templates: [] });
    });
  });
});
