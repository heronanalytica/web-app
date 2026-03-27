import { Test, TestingModule } from '@nestjs/testing';
import { AdminCampaignController } from './admin-campaign.controller';
import { CampaignService } from '../campaign/campaign.service';

describe('AdminCampaignController', () => {
  let controller: AdminCampaignController;
  let service: jest.Mocked<CampaignService>;

  beforeEach(async () => {
    const mockService = {
      getAllCampaigns: jest.fn(),
      updateDraftCampaign: jest.fn(),
      updateAnalysisSteps: jest.fn(),
      updateClassifiedPersona: jest.fn(),
      removeClassifiedPersona: jest.fn(),
      importRenderedEmailsFromJsonAdmin: jest.fn(),
      importRenderedEmailsFromFileAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCampaignController],
      providers: [{ provide: CampaignService, useValue: mockService }],
    }).compile();

    controller = module.get<AdminCampaignController>(AdminCampaignController);
    service = module.get(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAnalysisSteps', () => {
    it('should update analysis steps', async () => {
      service.updateAnalysisSteps.mockResolvedValue({ id: 'c-1' } as any);
      const result = await controller.updateAnalysisSteps('c-1', {
        steps: [{ key: 'step1', status: 'done', label: 'Step 1' } as any],
      });
      expect(service.updateAnalysisSteps).toHaveBeenCalledWith('c-1', [{ key: 'step1', status: 'done' }]);
      expect(result).toEqual({ error: 0, data: { id: 'c-1' } });
    });
  });

  describe('getAllCampaigns', () => {
    it('should fetch all campaigns admin endpoint', async () => {
      service.getAllCampaigns.mockResolvedValue({ campaigns: [] } as any);
      const result = await controller.getAllCampaigns('2', '20');
      expect(service.getAllCampaigns).toHaveBeenCalledWith(2, 20);
      expect(result).toEqual({ error: 0, data: { campaigns: [] } });
    });
  });
});
