import type { TokenRefreshPort, RefreshTokenResult } from '@domain/Ports/Auth/TokenRefreshPort';

export class RefreshTokenUseCase {
  private readonly tokenRefreshPort: TokenRefreshPort;
  constructor({ tokenRefreshPort }: { tokenRefreshPort: TokenRefreshPort }) {
    this.tokenRefreshPort = tokenRefreshPort;
  }

  execute(): Promise<RefreshTokenResult> {
    return this.tokenRefreshPort.refresh();
  }
}
