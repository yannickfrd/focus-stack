import type { TokenRefreshPort, TokenRefreshResult } from '@domain/Ports/Auth/TokenRefreshPort';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class TokenRefreshHttpGateway extends AbstractHttpGateway implements TokenRefreshPort {
  refresh(refreshToken: string): Promise<TokenRefreshResult> {
    return this.post<TokenRefreshResult>('/token/refresh', { refresh_token: refreshToken });
  }
}
