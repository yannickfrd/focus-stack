import type { UserLogoutPort } from '@domain/Ports/User/UserLogoutPort';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class UserLogoutHttpGateway extends AbstractHttpGateway implements UserLogoutPort {
  logout(): Promise<void> {
    return this.post<void>('/logout', {});
  }
}
