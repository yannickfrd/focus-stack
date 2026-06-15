import type { LoginUserRequest } from '@application/Requests/User/LoginUserRequest';
import type { UserLoginPort, LoginResult } from '@domain/Ports/User/UserLoginPort';

export class LoginUserUseCase {
  constructor(private readonly userLoginPort: UserLoginPort) {}

  execute(command: LoginUserRequest): Promise<LoginResult> {
    return this.userLoginPort.login({
      email: command.email,
      password: command.password,
    });
  }
}
