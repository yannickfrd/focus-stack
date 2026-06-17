import type { LoginUserRequest } from '@application/Requests/User/LoginUserRequest';
import type { UserLoginPort, LoginResult } from '@domain/Ports/User/UserLoginPort';

export class LoginUserUseCase {
  private readonly userLoginPort: UserLoginPort;
  constructor({ userLoginPort }: { userLoginPort: UserLoginPort }) {
    this.userLoginPort = userLoginPort;
  }

  execute(command: LoginUserRequest): Promise<LoginResult> {
    return this.userLoginPort.login({
      email: command.email,
      password: command.password,
    });
  }
}
