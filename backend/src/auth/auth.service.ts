import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
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

  private signToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }
}
