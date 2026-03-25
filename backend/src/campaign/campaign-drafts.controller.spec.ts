import { Test, TestingModule } from '@nestjs/testing';
import { CampaignDraftsController } from './campaign-drafts.controller';
import { CampaignService } from './campaign.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('CampaignDraftsController', () => {
  let controller: CampaignDraftsController;
  let service: jest.Mocked<CampaignService>;

  beforeEach(async () => {
    const mockService = {
      createDraftCampaign: jest.fn(),
      getUserDraftCampaigns: jest.fn(),
      getDraftCampaign: jest.fn(),
      updateDraftCampaign: jest.fn(),
      deleteDraftCampaign: jest.fn(),
      generateAndPersistCommonTemplate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignDraftsController],
      providers: [{ provide: CampaignService, useValue: mockService }],
    }).compile();

    controller = module.get<CampaignDraftsController>(CampaignDraftsController);
    service = module.get(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('should throw if user not authenticated', async () => {
      const req = { user: undefined } as unknown as Request;
      await expect(controller.createCampaign(req, { name: 'My Campaign' })).rejects.toThrow(UnauthorizedException);
    });

    it('should create a draft campaign', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      service.createDraftCampaign.mockResolvedValue({ id: 'c-1' } as any);
      const result = await controller.createCampaign(req, { name: 'My Campaign' });
      expect(service.createDraftCampaign).toHaveBeenCalledWith('user-1', { name: 'My Campaign' });
      expect(result).toEqual({ error: 0, data: { id: 'c-1' } });
    });
  });

  describe('updateDraftCampaign', () => {
    it('should update a draft campaign', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      service.updateDraftCampaign.mockResolvedValue({ id: 'c-1' } as any);
      const result = await controller.updateDraftCampaign('c-1', req, { name: 'New Name' } as any);
      expect(service.updateDraftCampaign).toHaveBeenCalledWith('user-1', { id: 'c-1', name: 'New Name' });
      expect(result).toEqual({ error: 0, data: { id: 'c-1' } });
    });
  });

  describe('deleteDraftCampaign', () => {
    it('should delete a draft campaign', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      service.deleteDraftCampaign.mockResolvedValue({ success: true } as any);
      const result = await controller.deleteDraftCampaign(req, 'c-1');
      expect(service.deleteDraftCampaign).toHaveBeenCalledWith('user-1', 'c-1');
      expect(result).toEqual({ error: 0, data: { success: true } });
    });
  });
});
