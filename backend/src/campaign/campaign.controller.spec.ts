import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('CampaignController', () => {
  let controller: CampaignController;
  let service: jest.Mocked<CampaignService>;

  beforeEach(async () => {
    const mockService = {
      getUserCampaigns: jest.fn(),
      getAllCampaigns: jest.fn(),
      createDraftCampaign: jest.fn(),
      getUserDraftCampaigns: jest.fn(),
      getDraftCampaign: jest.fn(),
      getCampaignById: jest.fn(),
      updateDraftCampaign: jest.fn(),
      deleteDraftCampaign: jest.fn(),
      updateAnalysisSteps: jest.fn(),
      updateClassifiedPersona: jest.fn(),
      removeClassifiedPersona: jest.fn(),
      generateAndPersistCommonTemplate: jest.fn(),
      importRenderedEmailsFromJsonAdmin: jest.fn(),
      importRenderedEmailsFromFileAdmin: jest.fn(),
      listRenderedEmailsForCampaign: jest.fn(),
      launchCampaign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [{ provide: CampaignService, useValue: mockService }],
    }).compile();

    controller = module.get<CampaignController>(CampaignController);
    service = module.get(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCampaigns', () => {
    it('should throw if user not authenticated', async () => {
      const req = { user: undefined } as unknown as Request;
      await expect(controller.getUserCampaigns(req)).rejects.toThrow(UnauthorizedException);
    });

    it('should return campaigns', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      service.getUserCampaigns.mockResolvedValue([]);
      const result = await controller.getUserCampaigns(req);
      expect(service.getUserCampaigns).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ error: 0, data: [] });
    });
  });

  describe('createCampaign', () => {
    it('should create a campaign', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      service.createDraftCampaign.mockResolvedValue({ id: 'c-1' } as any);
      const result = await controller.createCampaign(req, { name: 'My Campaign' });
      expect(service.createDraftCampaign).toHaveBeenCalledWith('user-1', { name: 'My Campaign' });
      expect(result).toEqual({ error: 0, data: { id: 'c-1' } });
    });
  });

  describe('updateAnalysisSteps', () => {
    it('should update analysis steps', async () => {
      const req = { user: { id: 'admin-1', role: 'ADMIN' } } as unknown as Request;
      service.updateAnalysisSteps.mockResolvedValue({ id: 'c-1' } as any);
      const result = await controller.updateAnalysisSteps(req, 'c-1', { steps: [{ key: 'step1', status: 'done', label: 'Step 1' } as any] });
      expect(service.updateAnalysisSteps).toHaveBeenCalledWith('c-1', [{ key: 'step1', status: 'done' }]);
      expect(result).toEqual({ error: 0, data: { id: 'c-1' } });
    });
  });

  describe('launchCampaign', () => {
    it('should call launch on service', async () => {
      service.launchCampaign.mockResolvedValue({ status: 'ACTIVE' } as any);
      const result = await controller.launchCampaign('c-1');
      expect(service.launchCampaign).toHaveBeenCalledWith('c-1');
      expect(result).toEqual({ error: 0, data: { status: 'ACTIVE' } });
    });
  });
});
