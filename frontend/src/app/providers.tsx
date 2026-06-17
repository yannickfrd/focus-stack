'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';
import { container } from '@infrastructure/Di/container';
import { tokenStore } from '@infrastructure/Storage/InMemoryTokenStore';
import { LoadingScreen } from '@ui/Screens/Common/LoadingScreen';

const refreshTokenUseCase = container.resolve<RefreshTokenUseCase>('refreshTokenUseCase');

const [queryClient] = [new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 60 * 1000 } },
})];

export function Providers({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    refreshTokenUseCase.execute()
      .then(({ token }) => { tokenStore.set(token); })
      .catch(() => {})
      .finally(() => { setAuthReady(true); });
  }, []);

  if (!authReady) return <LoadingScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
