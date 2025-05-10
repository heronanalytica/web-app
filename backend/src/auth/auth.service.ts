import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { FeatureFlagService } from 'src/feature-flag/feature-flag.service';
import { EFeatureFlag } from 'src/feature-flag/feature-flag.constants';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwt: JwtService,
    private featureFlagService: FeatureFlagService,
  ) {}

  private signToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }

  private async checkFF() {
    const isAuthEnabled = await this.featureFlagService.isEnabled(
      EFeatureFlag.AUTHENTICATION_ENABLED,
    );
    if (!isAuthEnabled) {
      throw new ForbiddenException('Authentication is currently disabled.');
    }
  }

  async signup(dto: SignupDto) {
    await this.checkFF();

    const existingUser = await this.dbService.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new UnauthorizedException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.dbService.user.create({
      data: {
        email: dto.email,
        password: hashed,
      },
    });

    return {
      accessToken: this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    await this.checkFF();

    const user = await this.dbService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      accessToken: this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async adminResetPassword(
    currentUser: { id: string; email: string; role: string },
    dto: AdminResetPasswordDto,
  ) {
    if (currentUser?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can reset passwords');
    }

    const user = await this.dbService.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.dbService.user.update({
      where: { id: dto.userId },
      data: { password: hashed },
    });

    return { message: 'Password reset successfully' };
  }
}
