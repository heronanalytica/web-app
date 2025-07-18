import {
  Controller,
  Get,
  Post,
  Put,
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
