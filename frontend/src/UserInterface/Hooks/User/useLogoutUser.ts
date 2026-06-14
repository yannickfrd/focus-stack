'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LogoutUserUseCase } from '@application/UseCases/User/LogoutUserUseCase';
import { container } from '@infrastructure/Di/container';
import { tokenStore } from '@infrastructure/Storage/InMemoryTokenStore';

const useCase = container.resolve<LogoutUserUseCase>('logoutUserUseCase');

export function useLogoutUser() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => useCase.execute(),
    onSuccess: () => {
      tokenStore.clear();
      router.push('/login');
    },
    onError: () => {
      tokenStore.clear();
      router.push('/login');
    },
  });

  return {
    logout: () => mutate(),
    isLoading: isPending,
  };
}
