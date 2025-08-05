export enum EAuthRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: EAuthRole;
}
