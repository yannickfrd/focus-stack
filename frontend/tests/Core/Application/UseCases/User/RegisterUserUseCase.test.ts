import { describe, it, expect, vi } from 'vitest';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import type { UserRegisterPort } from '@domain/Ports/User/UserRegisterPort';

describe('RegisterUserUseCase', () => {
  it('délègue à userRegisterPort.register avec email et mot de passe', async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    const port: UserRegisterPort = { register: mockRegister };
    const useCase = new RegisterUserUseCase(port);

    await useCase.execute(new RegisterUserRequest('test@example.com', 'password123'));

    expect(mockRegister).toHaveBeenCalledOnce();
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('propage les erreurs levées par le port', async () => {
    const port: UserRegisterPort = {
      register: vi.fn().mockRejectedValue(new Error('Cette adresse email est déjà utilisée.')),
    };
    const useCase = new RegisterUserUseCase(port);

    await expect(
      useCase.execute(new RegisterUserRequest('taken@example.com', 'pass'))
    ).rejects.toThrow('Cette adresse email est déjà utilisée.');
  });
});
