import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  GetObjectCommand: class {},
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-signed-url'),
}));

describe('AwsService', () => {
  let service: AwsService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'AWS_REGION') return 'us-east-1';
        if (key === 'AWS_ACCESS_KEY_ID') return 'mock-key';
        if (key === 'AWS_SECRET_ACCESS_KEY') return 'mock-secret';
        if (key === 'AWS_S3_BUCKET') return 'mock-bucket';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AwsService>(AwsService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should format public Http Url correctly', () => {
    const url = service.buildPublicHttpUrl('test/key.jpg');
    expect(url).toBe('https://mock-bucket.s3.us-east-1.amazonaws.com/test/key.jpg');
  });

  it('should throw error if config missing', () => {
    configService.get.mockReturnValue(null);
    expect(() => new AwsService(configService)).toThrow('Missing AWS configuration');
  });

  describe('getPresignedUploadUrl', () => {
    it('should generate command and url', async () => {
      const result = await service.getPresignedUploadUrl('user1', 'avatar', 'image/png');
      expect(result.url).toBe('https://mock-signed-url');
      expect(result.key).toContain('user1/avatar');
    });

    it('should append public segment if isPublic is true', async () => {
      const result = await service.getPresignedUploadUrl('user1', 'avatar', 'image/png', undefined, {
        isPublic: true,
      });
      expect(result.key).toContain('public/');
    });
  });
});
