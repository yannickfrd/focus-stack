import { describe, it, expect, vi } from 'vitest';
import { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';
import type { TokenRefreshPort, RefreshTokenResult } from '@domain/Ports/Auth/TokenRefreshPort';

describe('RefreshTokenUseCase', () => {
  it('délègue à tokenRefreshPort.refresh et retourne le token', async () => {
    const expected: RefreshTokenResult = { token: 'new.jwt.token' };
    const mockRefresh = vi.fn().mockResolvedValue(expected);
    const port: TokenRefreshPort = { refresh: mockRefresh };
    const useCase = new RefreshTokenUseCase(port);

    const result = await useCase.execute();

    expect(mockRefresh).toHaveBeenCalledOnce();
    expect(result).toEqual(expected);
  });

  it('propage les erreurs levées par le port', async () => {
    const port: TokenRefreshPort = {
      refresh: vi.fn().mockRejectedValue(new Error('Refresh token invalide.')),
    };
    const useCase = new RefreshTokenUseCase(port);

    await expect(useCase.execute()).rejects.toThrow('Refresh token invalide.');
  });
});
