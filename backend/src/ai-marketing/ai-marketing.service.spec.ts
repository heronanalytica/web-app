import { Test, TestingModule } from '@nestjs/testing';
import { AiMarketingService } from './ai-marketing.service';
import { DatabaseService } from 'src/database/database.service';
import { AwsService } from 'src/aws/aws.service';
import * as openaiHelper from './helpers/openai.helper';

jest.mock('./helpers/openai.helper', () => ({
  callOpenAiAndParse: jest.fn(),
}));

describe('AiMarketingService', () => {
  let service: AiMarketingService;
  let dbService: jest.Mocked<DatabaseService>;
  let awsService: jest.Mocked<AwsService>;

  beforeEach(async () => {
    const mockDbService = {
      userUploadFile: { findUnique: jest.fn() },
      campaign: { findFirstOrThrow: jest.fn() },
    };

    const mockAwsService = {
      buildPublicHttpUrl: jest.fn().mockReturnValue('http://public-url'),
      getPresignedViewUrl: jest.fn().mockResolvedValue('http://presigned-url'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiMarketingService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: AwsService, useValue: mockAwsService },
      ],
    }).compile();

    service = module.get<AiMarketingService>(AiMarketingService);
    dbService = module.get(DatabaseService);
    awsService = module.get(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    it('should return analysis result correctly', async () => {
      (openaiHelper.callOpenAiAndParse as jest.Mock).mockResolvedValueOnce({ segment_name: 'Tech' }); // parseSegment
      (openaiHelper.callOpenAiAndParse as jest.Mock).mockResolvedValueOnce({ name: 'Company' }); // parseCompany
      (openaiHelper.callOpenAiAndParse as jest.Mock).mockResolvedValueOnce({ strategy: 'Strat' }); // generateStrategy

      const result = await service.analyze({ segments: ['Segment A'], companyUrl: 'http://test.com' } as any);

      expect(openaiHelper.callOpenAiAndParse).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        personaSegments: [{ segment_name: 'Tech' }],
        companyProfile: { name: 'Company' },
        strategies: [{ strategy: 'Strat' }],
      });
    });
  });

  describe('generateCampaignTemplates', () => {
    it('should retrieve emails and ads templates', async () => {
      (openaiHelper.callOpenAiAndParse as jest.Mock)
        .mockResolvedValueOnce({ segment_name: 'Tech' }) // segment
        .mockResolvedValueOnce({ name: 'Company' }) // company
        .mockResolvedValueOnce({ html: '<html>' }) // email
        .mockResolvedValueOnce({ ads: [] }); // ads

      const result = await service.generateCampaignTemplates({
        segments: ['A'], companyUrl: 'http',
      } as any);

      expect(result.templates).toHaveLength(1);
      expect(result.templates[0].email).toEqual({ html: '<html>' });
    });
  });

  describe('generateCommonTemplate', () => {
    it('should replace cid images correctly depending on isPublic', async () => {
      (dbService.campaign.findFirstOrThrow as jest.Mock).mockResolvedValue({
        stepState: {
          generator: { photoFileId: 'f1' },
          companyProfile: { name: 'Comp' }
        }
      } as any);

      (dbService.userUploadFile.findUnique as jest.Mock).mockResolvedValue({
        storageUrl: 's3://bucket/test/public/img.png'
      } as any);

      (openaiHelper.callOpenAiAndParse as jest.Mock).mockResolvedValue({
        html: '<img src="cid:abc">',
        subject: 'Sub',
        preheader: 'Pre'
      });

      const result = await service.generateCommonTemplate('uid', 'cid');
      
      expect(result.html).toContain('http://public-url');
      expect(awsService.buildPublicHttpUrl).toHaveBeenCalledWith('test/public/img.png');
    });
  });
});
