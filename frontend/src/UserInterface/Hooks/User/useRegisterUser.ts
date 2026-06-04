'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RegisterUserCommand } from '@application/Commands/User/RegisterUserCommand';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { container } from '@infrastructure/Di/container';
import type { AuthTokenPort } from '@domain/Ports/Auth/AuthTokenPort';

const useCase = container.resolve<RegisterUserUseCase>('registerUserUseCase');
const authToken = container.resolve<AuthTokenPort>('authToken');

export function useRegisterUser() {
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      useCase.execute(new RegisterUserCommand(email, password)),
    onSuccess: (user) => {
      authToken.store(user.id);
      router.push('/');
    },
  });

  return {
    register: (email: string, password: string) => mutate({ email, password }),
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
  };
}
