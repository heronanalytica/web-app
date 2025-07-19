import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileService } from './company-profile.service';
import { DatabaseService } from '../database/database.service';

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;
  let dbMock: {
    companyProfile: {
      findMany: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    dbMock = {
      companyProfile: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyProfileService,
        { provide: DatabaseService, useValue: dbMock },
      ],
    }).compile();

    service = module.get<CompanyProfileService>(CompanyProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all profiles for a user', async () => {
    const fakeProfiles = [{ id: '1', userId: 'user1' }];
    dbMock.companyProfile.findMany.mockResolvedValueOnce(fakeProfiles);

    const result = await service.findAllByUser('user1');
    expect(result).toBe(fakeProfiles);
    expect(dbMock.companyProfile.findMany).toHaveBeenCalledWith({
      where: { userId: 'user1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should create a company profile', async () => {
    const dto = {
      name: 'Test Co',
      website: 'https://example.com',
    };
    const created = { id: 'new-id', userId: 'user1', ...dto };
    dbMock.companyProfile.create.mockResolvedValueOnce(created);

    const result = await service.create('user1', dto);
    expect(result).toBe(created);
    expect(dbMock.companyProfile.create).toHaveBeenCalledWith({
      data: { userId: 'user1', ...dto },
    });
  });

  it('should update a company profile if user is owner', async () => {
    const id = 'profile1';
    const userId = 'user1';
    const existingProfile = { id, userId };
    const dto = { name: 'Updated Co' };
    const updatedProfile = { ...existingProfile, ...dto };

    dbMock.companyProfile.findUnique.mockResolvedValueOnce(existingProfile);
    dbMock.companyProfile.update.mockResolvedValueOnce(updatedProfile);

    const result = await service.update(userId, id, dto);
    expect(result).toEqual(updatedProfile);
  });

  it('should throw if user is not owner', async () => {
    dbMock.companyProfile.findUnique.mockResolvedValueOnce({
      id: 'p1',
      userId: 'otherUser',
    });

    await expect(
      service.update('user1', 'p1', { name: 'Hacked' }),
    ).rejects.toThrow('Not found or forbidden');
  });
});
