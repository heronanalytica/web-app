import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyProfileDto, UpdateCompanyProfileDto } from './dto';
import { CompanyProfile, Prisma } from 'generated/prisma';

@Injectable()
export class CompanyProfileService {
  constructor(private readonly db: DatabaseService) {}

  async findAllByUser(userId: string) {
    return this.db.companyProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<CompanyProfile | null> {
    return this.db.companyProfile.findUnique({ where: { id } });
  }

  async create(
    userId: string,
    dto: CreateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const created = await this.db.companyProfile.create({
      data: {
        userId,
        name: dto.name,
        website: dto.website,
        marketingContentFileId: dto.marketingContentFileId,
        designAssetFileId: dto.designAssetFileId,
        businessInfo: dto.businessInfo,
      },
    });
    if (!created) throw new Error('Failed to create company profile');
    return created;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const profile = await this.db.companyProfile.findUnique({ where: { id } });
    if (!profile || profile.userId !== userId)
      throw new Error('Not found or forbidden');

    const updateData: Prisma.CompanyProfileUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.businessInfo !== undefined)
      updateData.businessInfo = dto.businessInfo;

    if (dto.marketingContentFileId !== undefined) {
      updateData.marketingContentFile = {
        connect: { id: dto.marketingContentFileId },
      };
    }

    if (dto.designAssetFileId !== undefined) {
      updateData.designAssetFile = {
        connect: { id: dto.designAssetFileId },
      };
    }

    // Only include AI fields if they are provided
    if (dto.generatedOverallProfile !== undefined) {
      updateData.generatedOverallProfile = dto.generatedOverallProfile;
    }

    if (dto.generatedMarketingTone !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updateData.generatedMarketingTone = dto.generatedMarketingTone;
    }

    const updated = await this.db.companyProfile.update({
      where: { id },
      data: updateData,
    });

    if (!updated) throw new Error('Failed to update company profile');
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const profile = await this.db.companyProfile.findUnique({ where: { id } });
    if (!profile || profile.userId !== userId) {
      throw new Error('Not found or forbidden');
    }
    const deleted = await this.db.companyProfile.delete({ where: { id } });
    return !!deleted;
  }
}
