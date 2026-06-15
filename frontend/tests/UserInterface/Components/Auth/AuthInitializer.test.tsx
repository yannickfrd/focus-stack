import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock('@infrastructure/Di/container', () => ({
  container: {
    resolve: vi.fn().mockReturnValue({ execute: mockExecute }),
  },
}));

vi.mock('@infrastructure/Storage/InMemoryTokenStore', () => ({
  tokenStore: { set: vi.fn(), get: vi.fn(), clear: vi.fn() },
}));

import { AuthInitializer } from '@ui/Components/Auth/AuthInitializer';
import { tokenStore } from '@infrastructure/Storage/InMemoryTokenStore';

describe('AuthInitializer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne rend rien (null)', () => {
    mockExecute.mockResolvedValue({ token: 'jwt.test.token' });
    const { container } = render(<AuthInitializer />);

    expect(container.firstChild).toBeNull();
  });

  it('appelle le use case au montage et stocke le token', async () => {
    mockExecute.mockResolvedValue({ token: 'jwt.test.token' });

    await act(async () => {
      render(<AuthInitializer />);
    });

    expect(mockExecute).toHaveBeenCalledOnce();
    expect(tokenStore.set).toHaveBeenCalledWith('jwt.test.token');
  });

  it("ignore silencieusement les erreurs (cookie absent ou expiré)", async () => {
    mockExecute.mockRejectedValue(new Error('Refresh token invalide.'));

    await expect(
      act(async () => { render(<AuthInitializer />); })
    ).resolves.not.toThrow();

    expect(tokenStore.set).not.toHaveBeenCalled();
  });
});
