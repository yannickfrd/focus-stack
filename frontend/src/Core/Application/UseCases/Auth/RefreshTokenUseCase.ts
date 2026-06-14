import type { TokenRefreshPort, RefreshTokenResult } from '@domain/Ports/Auth/TokenRefreshPort';

export class RefreshTokenUseCase {
  constructor(private readonly tokenRefreshPort: TokenRefreshPort) {}

  execute(): Promise<RefreshTokenResult> {
    return this.tokenRefreshPort.refresh();
  }
}
