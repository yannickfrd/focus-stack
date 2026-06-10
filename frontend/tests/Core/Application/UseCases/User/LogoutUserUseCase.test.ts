import { describe, it, expect, vi } from 'vitest';
import { LogoutUserUseCase } from '@application/UseCases/User/LogoutUserUseCase';
import type { UserLogoutPort } from '@domain/Ports/User/UserLogoutPort';

describe('LogoutUserUseCase', () => {
  it('délègue à userLogoutPort.logout', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    const port: UserLogoutPort = { logout: mockLogout };
    const useCase = new LogoutUserUseCase(port);

    await useCase.execute();

    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('propage les erreurs levées par le port', async () => {
    const port: UserLogoutPort = {
      logout: vi.fn().mockRejectedValue(new Error('Erreur réseau.')),
    };
    const useCase = new LogoutUserUseCase(port);

    await expect(useCase.execute()).rejects.toThrow('Erreur réseau.');
  });
});
