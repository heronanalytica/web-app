import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private dbService: DatabaseService) {
    super({
      secretOrKey: process.env.JWT_SECRET || 'super_secret',
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: { cookies?: { login_token?: string } }) =>
          req?.cookies?.login_token ?? null,
      ]),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.dbService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
