import type { User } from '@domain/Entities/User/User';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface UserPort {
  register(input: RegisterInput): Promise<User>;
}
