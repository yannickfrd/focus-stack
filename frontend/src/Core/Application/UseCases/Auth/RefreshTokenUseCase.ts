import type { TokenRefreshPort, TokenRefreshResult } from '@domain/Ports/Auth/TokenRefreshPort';
import type { RefreshTokenRequest } from '@application/Requests/Auth/RefreshTokenRequest';

export class RefreshTokenUseCase {
  constructor(private readonly tokenRefreshPort: TokenRefreshPort) {}

  execute(command: RefreshTokenRequest): Promise<TokenRefreshResult> {
    return this.tokenRefreshPort.refresh(command.refreshToken);
  }
}
