export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponseData {
  accessToken: string;
  user: AuthUser;
}

export interface AuthApiResponse {
  message: string;
  data: AuthResponseData;
}
