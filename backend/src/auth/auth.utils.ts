import { ForbiddenException } from '@nestjs/common';
import { EAuthRole } from './auth.types';

export type AuthUser = { id: string; email: string; role: EAuthRole };

export const isAdmin = (user?: Partial<AuthUser>) =>
  user?.role === EAuthRole.ADMIN;

export const assertAdmin = (user?: Partial<AuthUser>) => {
  if (!isAdmin(user)) throw new ForbiddenException('Admin access only');
};
