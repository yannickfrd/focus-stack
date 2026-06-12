'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LoginUserRequest } from '@application/Requests/User/LoginUserRequest';
import { LoginUserUseCase } from '@application/UseCases/User/LoginUserUseCase';
import { container } from '@infrastructure/Di/container';
import type { AuthTokenPort } from '@domain/Ports/Auth/AuthTokenPort';

const useCase = container.resolve<LoginUserUseCase>('loginUserUseCase');
const authToken = container.resolve<AuthTokenPort>('authToken');

export function useLoginUser() {
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      useCase.execute(new LoginUserRequest(email, password)),
    onSuccess: (result) => {
      authToken.store(result.token);
      authToken.storeRefreshToken(result.refresh_token);
      router.push('/');
    },
  });

  return {
    login: (email: string, password: string) => mutate({ email, password }),
    isLoading: isPending,
    error: error instanceof Error
      ? (error.message === 'Invalid credentials.' ? 'Email ou mot de passe incorrect.' : error.message)
      : null,
  };
}
