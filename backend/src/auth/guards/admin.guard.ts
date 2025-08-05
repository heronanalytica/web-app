import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EAuthRole } from '../auth.types';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role !== EAuthRole.ADMIN) {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
