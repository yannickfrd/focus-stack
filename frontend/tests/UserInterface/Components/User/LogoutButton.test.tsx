import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@ui/Hooks/User/useLogoutUser');

import { LogoutButton } from '@ui/Components/User/LogoutButton';
import { useLogoutUser } from '@ui/Hooks/User/useLogoutUser';

const mockUseLogoutUser = vi.mocked(useLogoutUser);

const defaultHook = (overrides: Partial<ReturnType<typeof useLogoutUser>> = {}) => ({
  logout: vi.fn(),
  isLoading: false,
  ...overrides,
});

describe('LogoutButton', () => {
  beforeEach(() => {
    mockUseLogoutUser.mockReturnValue(defaultHook());
  });

  describe('rendu', () => {
    it('affiche le bouton de déconnexion', () => {
      render(<LogoutButton />);

      expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeInTheDocument();
    });
  });

  describe('état de chargement', () => {
    it('désactive le bouton pendant le chargement', () => {
      mockUseLogoutUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<LogoutButton />);

      expect(screen.getByRole('button', { name: /déconnexion/i })).toBeDisabled();
    });

    it('affiche "Déconnexion…" pendant le chargement', () => {
      mockUseLogoutUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<LogoutButton />);

      expect(screen.getByText('Déconnexion…')).toBeInTheDocument();
    });
  });

  describe('soumission', () => {
    it('appelle logout au clic', async () => {
      const mockLogout = vi.fn();
      mockUseLogoutUser.mockReturnValue(defaultHook({ logout: mockLogout }));
      const user = userEvent.setup();
      render(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /se déconnecter/i }));

      expect(mockLogout).toHaveBeenCalledOnce();
    });
  });
});
