import type { TokenRefreshPort } from '@domain/Ports/Auth/TokenRefreshPort';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class TokenRefreshHttpGateway extends AbstractHttpGateway implements TokenRefreshPort {
  refresh(): Promise<void> {
    return this.post<void>('/token/refresh', {});
  }
}
