import type { UserLogoutPort } from '@domain/Ports/User/UserLogoutPort';

export class LogoutUserUseCase {
  constructor(private readonly userLogoutPort: UserLogoutPort) {}

  execute(): Promise<void> {
    return this.userLogoutPort.logout();
  }
}
