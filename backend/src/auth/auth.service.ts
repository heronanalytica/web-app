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
    const secret = process.env.JWT_SECRET || 'super_secret';
    return this.jwt.sign({ sub: userId, email }, { secret });
  }

  private async checkFF() {
    const isAuthEnabled = await this.featureFlagService.isEnabled(
      EFeatureFlag.AUTHENTICATION_ENABLED,
    );
    if (!isAuthEnabled) {
      throw new ForbiddenException('Authentication is currently disabled.');
    }
  }

  private async getUserByEmail(email: string) {
    const formattedEmail = email.toLocaleLowerCase();
    const existingUser = await this.dbService.user.findUnique({
      where: { email: formattedEmail },
    });
    return existingUser;
  }

  async signup(dto: SignupDto) {
    await this.checkFF();
    const formattedEmail = dto.email.toLocaleLowerCase();
    const existingUser = await this.getUserByEmail(formattedEmail);
    if (existingUser) throw new UnauthorizedException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.dbService.user.create({
      data: {
        email: formattedEmail,
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
    const formattedEmail = dto.email.toLocaleLowerCase();
    const user = await this.getUserByEmail(formattedEmail);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      accessToken: this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
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
