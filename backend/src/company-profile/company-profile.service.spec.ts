/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileService } from './company-profile.service';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyProfileDto, UpdateCompanyProfileDto } from './dto';
import { CompanyProfile } from 'generated/prisma';

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyProfileService,
        {
          provide: DatabaseService,
          useValue: {
            companyProfile: {
              findMany: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<CompanyProfileService>(CompanyProfileService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return company profiles for a user', async () => {
      const mockProfiles: CompanyProfile[] = [
        {
          id: '1',
          userId: 'u1',
          name: 'Test',
          website: null,
          marketingContentFileId: null,
          designAssetFileId: null,
          businessInfo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (db.companyProfile.findMany as jest.Mock).mockResolvedValue(mockProfiles);
      const result = await service.findAllByUser('u1');
      expect(db.companyProfile.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        include: { marketingContentFile: true, designAssetFile: true },
      });
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('create', () => {
    it('should create a company profile', async () => {
      const dto: CreateCompanyProfileDto = { name: 'Test' };
      const mockProfile: CompanyProfile = {
        id: '1',
        userId: 'u1',
        name: 'Test',
        website: null,
        marketingContentFileId: null,
        designAssetFileId: null,
        businessInfo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (db.companyProfile.create as jest.Mock).mockResolvedValue(mockProfile);
      const result = await service.create('u1', dto);
      expect(db.companyProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          name: 'Test',
          website: undefined,
          marketingContentFileId: undefined,
          designAssetFileId: undefined,
          businessInfo: undefined,
        },
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('update', () => {
    it('should update a company profile if user owns it', async () => {
      const dto: UpdateCompanyProfileDto = { name: 'Updated' };
      const mockProfile: CompanyProfile = {
        id: '1',
        userId: 'u1',
        name: 'Test',
        website: null,
        marketingContentFileId: null,
        designAssetFileId: null,
        businessInfo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedProfile: CompanyProfile = {
        ...mockProfile,
        name: 'Updated',
      };
      (db.companyProfile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile,
      );
      (db.companyProfile.update as jest.Mock).mockResolvedValue(updatedProfile);
      const result = await service.update('u1', '1', dto);
      expect(db.companyProfile.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(db.companyProfile.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated',
          website: undefined,
          marketingContentFileId: undefined,
          designAssetFileId: undefined,
          businessInfo: undefined,
        },
      });
      expect(result).toEqual(updatedProfile);
    });

    it('should throw if user does not own the profile', async () => {
      (db.companyProfile.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        userId: 'other',
        name: 'Test',
        website: null,
        marketingContentFileId: null,
        designAssetFileId: null,
        businessInfo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(
        service.update('u1', '1', { name: 'Updated' }),
      ).rejects.toThrow('Not found or forbidden');
    });
  });
});
