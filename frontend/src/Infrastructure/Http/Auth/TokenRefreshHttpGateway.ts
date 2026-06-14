import type { TokenRefreshPort, RefreshTokenResult } from '@domain/Ports/Auth/TokenRefreshPort';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class TokenRefreshHttpGateway extends AbstractHttpGateway implements TokenRefreshPort {
  refresh(): Promise<RefreshTokenResult> {
    return this.post<RefreshTokenResult>('/token/refresh', {});
  }
}
