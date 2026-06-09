import { describe, it, expect, vi } from 'vitest';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import type { UserPort } from '@domain/Ports/User/UserPort';
import type { User } from '@domain/Entities/User/User';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'uuid-1',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('RegisterUserUseCase', () => {
  it('délègue à userPort.register avec email et mot de passe', async () => {
    const mockRegister = vi.fn().mockResolvedValue(makeUser());
    const port: UserPort = { register: mockRegister };
    const useCase = new RegisterUserUseCase(port);

    await useCase.execute(new RegisterUserRequest('test@example.com', 'password123'));

    expect(mockRegister).toHaveBeenCalledOnce();
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it("retourne l'utilisateur renvoyé par le port", async () => {
    const user = makeUser({ id: 'uuid-42', email: 'jane@example.com' });
    const port: UserPort = { register: vi.fn().mockResolvedValue(user) };
    const useCase = new RegisterUserUseCase(port);

    const result = await useCase.execute(new RegisterUserRequest('jane@example.com', 'pass'));

    expect(result).toEqual(user);
  });

  it('propage les erreurs levées par le port', async () => {
    const port: UserPort = {
      register: vi.fn().mockRejectedValue(new Error('Cette adresse email est déjà utilisée.')),
    };
    const useCase = new RegisterUserUseCase(port);

    await expect(
      useCase.execute(new RegisterUserRequest('taken@example.com', 'pass'))
    ).rejects.toThrow('Cette adresse email est déjà utilisée.');
  });
});
