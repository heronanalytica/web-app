import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileController } from './company-profile.controller';
import { CompanyProfileService } from './company-profile.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AiMarketingService } from 'src/ai-marketing/ai-marketing.service';

describe('CompanyProfileController', () => {
  let controller: CompanyProfileController;
  let serviceMock: {
    findAllByUser: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    serviceMock = {
      findAllByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockAiMarketingService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyProfileController],
      providers: [
        { provide: CompanyProfileService, useValue: serviceMock },
        { provide: AiMarketingService, useValue: mockAiMarketingService }
      ],
    }).compile();

    controller = module.get<CompanyProfileController>(CompanyProfileController);
  });

  it('should throw UnauthorizedException if no userId (GET)', async () => {
    const req: any = { user: undefined };
    await expect(controller.findAll(req)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return company profiles for user', async () => {
    const req: any = { user: { id: 'user123' } };
    const data = [{ id: '1', name: 'ABC Inc.' }];
    serviceMock.findAllByUser.mockResolvedValueOnce(data);

    const result = await controller.findAll(req);
    expect(result).toEqual({ error: 0, data });
  });
});
