'use client';

import { useEffect } from 'react';
import type { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';
import { container } from '@infrastructure/Di/container';
import { tokenStore } from '@infrastructure/Storage/InMemoryTokenStore';

const useCase = container.resolve<RefreshTokenUseCase>('refreshTokenUseCase');

export function AuthInitializer() {
  useEffect(() => {
    useCase.execute()
      .then(({ token }) => tokenStore.set(token))
      .catch(() => {});
  }, []);

  return null;
}
