import type { RegisterUserCommand } from '@application/Commands/User/RegisterUserCommand';
import type { UserRepositoryInterface } from '@domain/Repositories/User/UserRepositoryInterface';
import type { User } from '@domain/Entities/User/User';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  execute(command: RegisterUserCommand): Promise<User> {
    return this.userRepository.register({
      email: command.email,
      password: command.password,
    });
  }
}
