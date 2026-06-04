import type { User } from '@domain/Entities/User/User';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface UserRepositoryInterface {
  register(input: RegisterInput): Promise<User>;
}
