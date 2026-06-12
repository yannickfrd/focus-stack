import type { User } from '@domain/Entities/User/User';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refresh_token: string;
  user: User;
}

export interface UserLoginPort {
  login(input: LoginInput): Promise<LoginResult>;
}
