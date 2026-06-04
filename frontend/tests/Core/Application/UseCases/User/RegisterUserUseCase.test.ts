import { describe, it, expect, vi } from 'vitest';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { RegisterUserCommand } from '@application/Commands/User/RegisterUserCommand';
import type { UserRepositoryInterface } from '@domain/Repositories/User/UserRepositoryInterface';
import type { User } from '@domain/Entities/User/User';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'uuid-1',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('RegisterUserUseCase', () => {
  it('delegates to repository.register with email and password', async () => {
    const mockRegister = vi.fn().mockResolvedValue(makeUser());
    const repo: UserRepositoryInterface = { register: mockRegister };
    const useCase = new RegisterUserUseCase(repo);

    await useCase.execute(new RegisterUserCommand('test@example.com', 'password123'));

    expect(mockRegister).toHaveBeenCalledOnce();
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('returns the user from the repository', async () => {
    const user = makeUser({ id: 'uuid-42', email: 'jane@example.com' });
    const repo: UserRepositoryInterface = { register: vi.fn().mockResolvedValue(user) };
    const useCase = new RegisterUserUseCase(repo);

    const result = await useCase.execute(new RegisterUserCommand('jane@example.com', 'pass'));

    expect(result).toEqual(user);
  });

  it('propagates errors thrown by the repository', async () => {
    const repo: UserRepositoryInterface = {
      register: vi.fn().mockRejectedValue(new Error('This email is already registered.')),
    };
    const useCase = new RegisterUserUseCase(repo);

    await expect(
      useCase.execute(new RegisterUserCommand('taken@example.com', 'pass'))
    ).rejects.toThrow('This email is already registered.');
  });
});
