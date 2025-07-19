import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagService } from './feature-flag.service';
import { DatabaseService } from '../database/database.service';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let dbMock: { featureFlag: { findUnique: jest.Mock } };

  beforeEach(async () => {
    dbMock = {
      featureFlag: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        { provide: DatabaseService, useValue: dbMock },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return false when the feature flag is not found', async () => {
    dbMock.featureFlag.findUnique.mockResolvedValueOnce(null);

    const result = await service.isEnabled('NON_EXISTENT_FLAG');
    expect(result).toBe(false);
  });

  it('should return true when the feature flag is enabled', async () => {
    dbMock.featureFlag.findUnique.mockResolvedValueOnce({ enabled: true });

    const result = await service.isEnabled('ENABLED_FLAG');
    expect(result).toBe(true);
  });

  it('should return false when the feature flag is disabled', async () => {
    dbMock.featureFlag.findUnique.mockResolvedValueOnce({ enabled: false });

    const result = await service.isEnabled('DISABLED_FLAG');
    expect(result).toBe(false);
  });
});
