export interface RegisterInput {
  email: string;
  password: string;
}

export interface UserRegisterPort {
  register(input: RegisterInput): Promise<void>;
}
