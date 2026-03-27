import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { DatabaseService } from '../database/database.service';
import { AiMarketingService } from 'src/ai-marketing/ai-marketing.service';
import { AwsService } from 'src/aws/aws.service';
import { MailService } from '../mail/mail.service';
import { CampaignStatus } from './campaign-status.enum';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
}));

jest.mock('src/utils/sanitize', () => ({
  extractUploadedHtml: jest.fn().mockImplementation((html) => ({ html, subject: '', preheader: '' })),
  sanitizeStepStateForStorage: jest.fn().mockImplementation((state) => state),
}));

describe('CampaignService', () => {
  let service: CampaignService;
  let dbService: DatabaseService; // Cast to any to mock nested chained properties
  let aiMarketingService: jest.Mocked<AiMarketingService>;
  let awsService: jest.Mocked<AwsService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const mockDbService = {
      campaign: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      campaignRecipient: {
        upsert: jest.fn(),
        groupBy: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      campaignRenderedEmail: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      contact: {
        upsert: jest.fn(),
      },
      userUploadFile: {
        findFirstOrThrow: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((cb) => typeof cb === 'function' ? cb(mockDbService) : cb),
    };

    const mockAiMarketingService = {
      generateCommonTemplate: jest.fn(),
    };

    const mockAwsService = {
      getObjectStreamFromS3: jest.fn(),
    };

    const mockMailService = {
      sendCampaign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: AiMarketingService, useValue: mockAiMarketingService },
        { provide: AwsService, useValue: mockAwsService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    dbService = module.get(DatabaseService);
    aiMarketingService = module.get(AiMarketingService);
    awsService = module.get(AwsService);
    mailService = module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDraftCampaign', () => {
    it('should create a campaign in draft status with steps', async () => {
      (dbService.campaign.create as jest.Mock).mockResolvedValue({ id: 'c-1' });
      const result = await service.createDraftCampaign('user-1', { name: 'My Campaign' });
      expect(dbService.campaign.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          name: 'My Campaign',
          userId: 'user-1',
          status: CampaignStatus.DRAFT,
          currentStep: 0,
        }),
      }));
      expect(result).toEqual({ id: 'c-1' });
    });
  });

  describe('updateDraftCampaign', () => {
    it('should throw if campaign not found', async () => {
      (dbService.campaign.findFirstOrThrow as jest.Mock).mockRejectedValue(new Error('NotFound'));
      await expect(service.updateDraftCampaign('u-1', { id: 'c-1' })).rejects.toThrow('NotFound');
    });

    it('should merge step states and update correctly', async () => {
      (dbService.campaign.findFirstOrThrow as jest.Mock).mockResolvedValue({} as any);
      (dbService.campaign.findUnique as jest.Mock).mockResolvedValue({
        stepState: { oldKey: 'val' },
      });
      (dbService.campaign.update as jest.Mock).mockResolvedValue({ id: 'c-1' });

      await service.updateDraftCampaign('u-1', { id: 'c-1', name: 'New Name', stepState: { newKey: 'val2' } as any });

      expect(dbService.campaign.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'c-1' },
      }));
    });
  });

  describe('generateAndPersistCommonTemplate', () => {
    it('should call aiMarketing and persist result if not uploaded manually', async () => {
      (dbService.campaign.findFirstOrThrow as jest.Mock).mockResolvedValue({
        stepState: { existing: true }
      });
      aiMarketingService.generateCommonTemplate.mockResolvedValue({
        subject: 'Sub', html: '<p>Hi</p>', preheader: 'Pre'
      });
      (dbService.campaign.update as jest.Mock).mockResolvedValue({});

      const result = await service.generateAndPersistCommonTemplate('u-1', 'c-1');

      expect(aiMarketingService.generateCommonTemplate).toHaveBeenCalledWith('u-1', 'c-1');
      expect(dbService.campaign.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'c-1' },
      }));
      expect(result.html).toBe('<p>Hi</p>');
    });
  });

  describe('launchCampaign', () => {
    it('should throw if already active', async () => {
      (dbService.campaign.findUnique as jest.Mock).mockResolvedValue({ status: CampaignStatus.ACTIVE, companyProfile: { name: 'Comp' } });
      await expect(service.launchCampaign('c-1')).rejects.toThrow('Campaign is already active');
    });

    it('should mark active and call background method', async () => {
      (dbService.campaign.findUnique as jest.Mock).mockResolvedValue({ status: CampaignStatus.DRAFT, currentStep: 2, companyProfile: { name: 'Comp' } });
      (dbService.campaign.update as jest.Mock).mockResolvedValue({ status: CampaignStatus.ACTIVE });
      (dbService.campaignRecipient.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.launchCampaign('c-1');
      expect(dbService.campaign.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: CampaignStatus.ACTIVE })
      }));
      expect(result.status).toBe(CampaignStatus.ACTIVE);
    });
  });
});
