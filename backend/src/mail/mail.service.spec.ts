import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';
import { MailProviderFactory, MailProviderType } from './mail-provider.factory';
import { IMailProvider } from './mail-provider.interface';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';

jest.mock('./mailProviders', () => ({
  getMailProviders: () => ({
    mockProvider: {
      redirectUri: 'http://localhost/callback',
      authUrl: 'http://mock-auth',
      clientId: 'client-id',
      clientSecret: 'secret',
      tokenUrl: 'http://mock-token',
    },
  }),
}));

describe('MailService', () => {
  let service: MailService;
  let dbService: jest.Mocked<DatabaseService>;
  let configService: jest.Mocked<ConfigService>;
  let providerFactory: jest.Mocked<MailProviderFactory>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const mockDbService = {
      mailProviderToken: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'APP_SECRET') return 'test-secret';
        return null;
      }),
    };

    const mockProviderFactory = {
      getProvider: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailProviderFactory, useValue: mockProviderFactory },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    dbService = module.get(DatabaseService);
    configService = module.get(ConfigService);
    providerFactory = module.get(MailProviderFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendCampaign', () => {
    it('should successfully send a campaign through provider', async () => {
      const mockProvider: jest.Mocked<IMailProvider> = {
        sendCampaign: jest.fn().mockResolvedValue({ success: true, message: 'Sent' }),
        testConnection: jest.fn(),
      } as any;

      providerFactory.getProvider.mockReturnValue(mockProvider);

      const result = await service.sendCampaign(
        { id: '1' } as any,
        [{ email: 'test@example.com' }] as any,
        MailProviderType.DEFAULT,
      );

      expect(mockProvider.sendCampaign).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Sent' });
    });

    it('should catch and return error on failure', async () => {
      const mockProvider: jest.Mocked<IMailProvider> = {
        sendCampaign: jest.fn().mockRejectedValue(new Error('Provider Error')),
        testConnection: jest.fn(),
      } as any;

      providerFactory.getProvider.mockReturnValue(mockProvider);

      const result = await service.sendCampaign(
        { id: '1' } as any,
        [{ email: 'test@example.com' }] as any,
        MailProviderType.DEFAULT,
      );

      expect(result).toEqual({
        success: false,
        message: 'Provider Error',
        data: { campaignId: '1', recipientsCount: 1 },
      });
    });
  });

  describe('testConnection', () => {
    it('should return true if provider connection works', async () => {
      const mockProvider: jest.Mocked<IMailProvider> = {
        testConnection: jest.fn().mockResolvedValue(true),
      } as any;

      providerFactory.getProvider.mockReturnValue(mockProvider);
      const result = await service.testConnection();
      expect(result).toBe(true);
    });

    it('should return false if provider connection fails', async () => {
      const mockProvider: jest.Mocked<IMailProvider> = {
        testConnection: jest.fn().mockRejectedValue(new Error()),
      } as any;

      providerFactory.getProvider.mockReturnValue(mockProvider);
      const result = await service.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('getOAuthUrl', () => {
    it('should throw UnauthorizedException if user missing', () => {
      const req = {} as Request;
      expect(() => service.getOAuthUrl('mockProvider', req)).toThrow(UnauthorizedException);
    });

    it('should generate valid oauth URL', () => {
      const req = { user: { id: 'user-id' } } as unknown as Request;
      const url = service.getOAuthUrl('mockProvider', req);
      expect(url).toContain('http://mock-auth');
      expect(url).toContain('client_id=client-id');
      expect(url).toContain('state=');
    });
  });

  describe('disconnectProvider', () => {
    it('should delete keys from DB', async () => {
      (dbService.mailProviderToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      const result = await service.disconnectProvider('mockProvider', 'user-id');
      expect(dbService.mailProviderToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id', provider: 'mockProvider' },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
