import { Test, TestingModule } from '@nestjs/testing';
import { CampaignRenderedEmailsController } from './campaign-rendered-emails.controller';
import { CampaignService } from './campaign.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('CampaignRenderedEmailsController', () => {
  let controller: CampaignRenderedEmailsController;
  let service: jest.Mocked<CampaignService>;

  beforeEach(async () => {
    const mockService = {
      listRenderedEmailsForCampaign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignRenderedEmailsController],
      providers: [{ provide: CampaignService, useValue: mockService }],
    }).compile();

    controller = module.get<CampaignRenderedEmailsController>(CampaignRenderedEmailsController);
    service = module.get(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listRenderedEmailsForOwner', () => {
    it('should throw UnauthorizedException if no user', async () => {
      const req = { user: undefined } as unknown as Request;
      await expect(controller.listRenderedEmailsForOwner(req, 'c-1')).rejects.toThrow(UnauthorizedException);
    });

    it('should call service to list rendered emails', async () => {
      const req = { user: { id: 'u-1' } } as unknown as Request;
      service.listRenderedEmailsForCampaign.mockResolvedValue({ total: 0, emails: [] } as any);
      const result = await controller.listRenderedEmailsForOwner(req, 'c-1', 'query', 1, 10);
      expect(service.listRenderedEmailsForCampaign).toHaveBeenCalledWith('u-1', 'c-1', { q: 'query', page: 1, limit: 10 });
      expect(result).toEqual({ error: 0, data: { total: 0, emails: [] } });
    });
  });
});
