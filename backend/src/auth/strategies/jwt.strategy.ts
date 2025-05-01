import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET || 'super_secret',
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: { cookies?: { login_token?: string } }) =>
          req?.cookies?.login_token ?? null,
      ]),
    });
  }

  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
