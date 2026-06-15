import type { UserLogoutPort } from '@domain/Ports/User/UserLogoutPort';

export class LogoutUserUseCase {
  private readonly userLogoutPort: UserLogoutPort;
  constructor({ userLogoutPort }: { userLogoutPort: UserLogoutPort }) {
    this.userLogoutPort = userLogoutPort;
  }

  execute(): Promise<void> {
    return this.userLogoutPort.logout();
  }
}
