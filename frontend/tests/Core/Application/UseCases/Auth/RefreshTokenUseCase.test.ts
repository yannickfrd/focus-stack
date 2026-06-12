import { describe, it, expect, vi } from 'vitest';
import { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';
import { RefreshTokenRequest } from '@application/Requests/Auth/RefreshTokenRequest';
import type { TokenRefreshPort, TokenRefreshResult } from '@domain/Ports/Auth/TokenRefreshPort';

const makeResult = (overrides: Partial<TokenRefreshResult> = {}): TokenRefreshResult => ({
  token: 'new.access.token',
  refresh_token: 'new.refresh.token',
  ...overrides,
});

describe('RefreshTokenUseCase', () => {
  it('délègue à tokenRefreshPort.refresh avec le refresh token', async () => {
    const mockRefresh = vi.fn().mockResolvedValue(makeResult());
    const port: TokenRefreshPort = { refresh: mockRefresh };
    const useCase = new RefreshTokenUseCase(port);

    await useCase.execute(new RefreshTokenRequest('old.refresh.token'));

    expect(mockRefresh).toHaveBeenCalledOnce();
    expect(mockRefresh).toHaveBeenCalledWith('old.refresh.token');
  });

  it('retourne le résultat renvoyé par le port', async () => {
    const result = makeResult({ token: 'abc.def', refresh_token: 'new.refresh' });
    const port: TokenRefreshPort = { refresh: vi.fn().mockResolvedValue(result) };
    const useCase = new RefreshTokenUseCase(port);

    const response = await useCase.execute(new RefreshTokenRequest('old.refresh'));

    expect(response).toEqual(result);
  });

  it('propage les erreurs levées par le port', async () => {
    const port: TokenRefreshPort = {
      refresh: vi.fn().mockRejectedValue(new Error('Refresh token invalide.')),
    };
    const useCase = new RefreshTokenUseCase(port);

    await expect(
      useCase.execute(new RefreshTokenRequest('bad.refresh'))
    ).rejects.toThrow('Refresh token invalide.');
  });
});
