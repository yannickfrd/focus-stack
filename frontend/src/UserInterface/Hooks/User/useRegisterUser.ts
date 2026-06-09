'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RegisterUserRequest } from '@application/Requests/User/RegisterUserRequest';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { container } from '@infrastructure/Di/container';

const useCase = container.resolve<RegisterUserUseCase>('registerUserUseCase');

export function useRegisterUser() {
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      useCase.execute(new RegisterUserRequest(email, password)),
    onSuccess: () => {
      router.push('/login');
    },
  });

  return {
    register: (email: string, password: string) => mutate({ email, password }),
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
  };
}
