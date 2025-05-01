export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponseData {
  accessToken: string;
  user: AuthUser;
}

export interface AuthApiResponse {
  message: string;
  data: AuthResponseData;
}
