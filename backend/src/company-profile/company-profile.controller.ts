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
} from '@nestjs/common';
import { CreateCompanyProfileDto, UpdateCompanyProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CompanyProfileService } from './company-profile.service';

@Controller('company-profiles')
@UseGuards(JwtAuthGuard)
export class CompanyProfileController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

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
