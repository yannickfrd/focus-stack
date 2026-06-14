import type { TokenRefreshPort } from '@domain/Ports/Auth/TokenRefreshPort';

export class RefreshTokenUseCase {
  constructor(private readonly tokenRefreshPort: TokenRefreshPort) {}

  execute(): Promise<void> {
    return this.tokenRefreshPort.refresh();
  }
}
