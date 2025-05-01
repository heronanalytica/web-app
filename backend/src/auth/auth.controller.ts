import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const data = await this.authService.signup(dto);
    return {
      message: 'Signup successful',
      data,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(dto);
    res.cookie('login_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
      data,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('login_token', {
      path: '/',
    });
    return {
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return {
      message: 'Authenticated user',
      data: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/reset-password')
  async resetPassword(@Req() req: Request, @Body() dto: AdminResetPasswordDto) {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    return this.authService.adminResetPassword(currentUser, dto);
  }
}
