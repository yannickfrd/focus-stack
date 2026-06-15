import type { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import type { UserRegisterPort } from '@domain/Ports/User/UserRegisterPort';

export class RegisterUserUseCase {
  private readonly userRegisterPort: UserRegisterPort;
  constructor({ userRegisterPort }: { userRegisterPort: UserRegisterPort }) {
    this.userRegisterPort = userRegisterPort;
  }

  execute(command: RegisterUserRequest): Promise<void> {
    return this.userRegisterPort.register({
      email: command.email,
      password: command.password,
    });
  }
}
