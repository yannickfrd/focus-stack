import { describe, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from '@application/UseCases/User/LoginUserUseCase';
import { LoginUserRequest } from '@application/Requests/User/LoginUserRequest';
import type { UserLoginPort, LoginResult } from '@domain/Ports/User/UserLoginPort';

const makeResult = (overrides: Partial<LoginResult> = {}): LoginResult => ({
  token: 'jwt.token.here',
  user: { id: 'uuid-1', email: 'test@example.com' },
  ...overrides,
});

describe('LoginUserUseCase', () => {
  it('délègue à userLoginPort.login avec email et mot de passe', async () => {
    const mockLogin = vi.fn().mockResolvedValue(makeResult());
    const port: UserLoginPort = { login: mockLogin };
    const useCase = new LoginUserUseCase(port);

    await useCase.execute(new LoginUserRequest('test@example.com', 'password123'));

    expect(mockLogin).toHaveBeenCalledOnce();
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('retourne le résultat renvoyé par le port', async () => {
    const result = makeResult({ token: 'abc.def.ghi', user: { id: 'uuid-2', email: 'jane@example.com' } });
    const port: UserLoginPort = { login: vi.fn().mockResolvedValue(result) };
    const useCase = new LoginUserUseCase(port);

    const response = await useCase.execute(new LoginUserRequest('jane@example.com', 'pass'));

    expect(response).toEqual(result);
  });

  it('propage les erreurs levées par le port', async () => {
    const port: UserLoginPort = {
      login: vi.fn().mockRejectedValue(new Error('Identifiants invalides.')),
    };
    const useCase = new LoginUserUseCase(port);

    await expect(
      useCase.execute(new LoginUserRequest('bad@example.com', 'wrong'))
    ).rejects.toThrow('Identifiants invalides.');
  });
});
