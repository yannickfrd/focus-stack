import type { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import type { UserPort } from '@domain/Ports/User/UserPort';
import type { User } from '@domain/Entities/User/User';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserPort) {}

  execute(command: RegisterUserRequest): Promise<User> {
    return this.userRepository.register({
      email: command.email,
      password: command.password,
    });
  }
}
