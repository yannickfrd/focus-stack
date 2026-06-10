'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LogoutUserUseCase } from '@application/UseCases/User/LogoutUserUseCase';
import { container } from '@infrastructure/Di/container';
import type { AuthTokenPort } from '@domain/Ports/Auth/AuthTokenPort';

const useCase = container.resolve<LogoutUserUseCase>('logoutUserUseCase');
const authToken = container.resolve<AuthTokenPort>('authToken');

export function useLogoutUser() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => useCase.execute(),
    onSuccess: () => {
      authToken.clear();
      router.push('/login');
    },
    onError: () => {
      authToken.clear();
      router.push('/login');
    },
  });

  return {
    logout: () => mutate(),
    isLoading: isPending,
  };
}
