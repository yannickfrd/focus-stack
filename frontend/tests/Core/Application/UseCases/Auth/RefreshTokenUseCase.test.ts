import { describe, it, expect, vi } from 'vitest';
import { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';
import type { TokenRefreshPort } from '@domain/Ports/Auth/TokenRefreshPort';

describe('RefreshTokenUseCase', () => {
  it('délègue à tokenRefreshPort.refresh', async () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined);
    const port: TokenRefreshPort = { refresh: mockRefresh };
    const useCase = new RefreshTokenUseCase(port);

    await useCase.execute();

    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it('propage les erreurs levées par le port', async () => {
    const port: TokenRefreshPort = {
      refresh: vi.fn().mockRejectedValue(new Error('Refresh token invalide.')),
    };
    const useCase = new RefreshTokenUseCase(port);

    await expect(useCase.execute()).rejects.toThrow('Refresh token invalide.');
  });
});
