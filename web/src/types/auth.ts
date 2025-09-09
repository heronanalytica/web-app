export interface AuthUser {
  id: string;
  email: string;
  role: EAuthRole;
}

export enum EAuthRole {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
}

export interface AuthLoginResponse {
  accessToken: string;
  user: AuthUser;
}
