
export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface LoginRequest {
  emailOrUserName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}