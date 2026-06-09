import type { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import type { UserRegisterPort } from '@domain/Ports/User/UserRegisterPort';

export class RegisterUserUseCase {
  constructor(private readonly userRegisterPort: UserRegisterPort) {}

  execute(command: RegisterUserRequest): Promise<void> {
    return this.userRegisterPort.register({
      email: command.email,
      password: command.password,
    });
  }
}
