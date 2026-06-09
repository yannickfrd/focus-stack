import type { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import type { UserRegisterPort } from '@domain/Ports/User/UserRegisterPort';
import type { User } from '@domain/Entities/User/User';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRegisterPort) {}

  execute(command: RegisterUserRequest): Promise<User> {
    return this.userRepository.register({
      email: command.email,
      password: command.password,
    });
  }
}
