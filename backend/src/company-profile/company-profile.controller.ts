import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCompanyProfileDto,
  UpdateCompanyProfileDto,
  AnalyzeCompanyProfileDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CompanyProfileService } from './company-profile.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AiMarketingService } from 'src/ai-marketing/ai-marketing.service';

@Controller('company-profiles')
@UseGuards(JwtAuthGuard)
export class CompanyProfileController {
  constructor(
    private readonly companyProfileService: CompanyProfileService,
    private readonly aiMarketingService: AiMarketingService,
  ) {}

  @Post('analyze')
  @UseGuards(AdminGuard)
  async analyzeCompanyProfile(
    @Body() analyzeDto: AnalyzeCompanyProfileDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    const profile = await this.companyProfileService.findById(
      analyzeDto.companyProfileId,
    );

    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }

    const { website, businessInfo } = profile;

    // Combine for analysis
    const contentToAnalyze = `${website ?? ''}\n${businessInfo ?? ''}`;

    const aiResult =
      await this.aiMarketingService.parseCompanyFromRawContent(
        contentToAnalyze,
      );

    const updated = await this.companyProfileService.update(
      profile.userId,
      profile.id,
      {
        generatedOverallProfile: aiResult,
      },
    );

    return {
      error: 0,
      message: 'Analysis complete',
      data: {
        generatedOverallProfile: updated,
      },
    };
  }

  @Get()
  async findAll(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.companyProfileService.findAllByUser(userId),
    };
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateCompanyProfileDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.companyProfileService.create(userId, dto),
    };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    try {
      await this.companyProfileService.delete(userId, id);
      return {
        error: 0,
        message: 'Company profile deleted successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete company profile';

      return {
        error: 1,
        message: errorMessage,
      };
    }
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return {
      error: 0,
      data: await this.companyProfileService.update(userId, id, dto),
    };
  }
}
