import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@ui/Hooks/User/useLoginUser');

import { LoginForm } from '@ui/Components/User/LoginForm';
import { useLoginUser } from '@ui/Hooks/User/useLoginUser';

const mockUseLoginUser = vi.mocked(useLoginUser);

const defaultHook = (overrides: Partial<ReturnType<typeof useLoginUser>> = {}) => ({
  login: vi.fn(),
  isLoading: false,
  error: null,
  ...overrides,
});

describe('LoginForm', () => {
  beforeEach(() => {
    mockUseLoginUser.mockReturnValue(defaultHook());
  });

  describe('rendu', () => {
    it('affiche les champs email et mot de passe', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    });

    it('affiche le bouton de soumission', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    });

    it("n'affiche pas de message d'erreur par défaut", () => {
      render(<LoginForm />);

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });
  });

  describe("état d'erreur", () => {
    it("affiche le message d'erreur quand error est défini", () => {
      mockUseLoginUser.mockReturnValue(
        defaultHook({ error: 'Identifiants invalides.' })
      );
      render(<LoginForm />);

      expect(screen.getByText('Identifiants invalides.')).toBeInTheDocument();
    });
  });

  describe('état de chargement', () => {
    it('désactive le bouton pendant le chargement', () => {
      mockUseLoginUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: 'Connexion en cours…' })).toBeDisabled();
    });

    it('affiche "Connexion en cours…" pendant le chargement', () => {
      mockUseLoginUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<LoginForm />);

      expect(screen.getByText('Connexion en cours…')).toBeInTheDocument();
    });
  });

  describe('visibilité du mot de passe', () => {
    it('le champ mot de passe est masqué par défaut', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
    });

    it('bascule la visibilité au clic sur le bouton œil', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

      expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'text');
    });

    it('remasque le mot de passe au second clic', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
      await user.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));

      expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
    });
  });

  describe('soumission', () => {
    it('appelle login avec email et mot de passe', async () => {
      const mockLogin = vi.fn();
      mockUseLoginUser.mockReturnValue(defaultHook({ login: mockLogin }));
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText('Email'), 'utilisateur@exemple.com');
      await user.type(screen.getByLabelText('Mot de passe'), 'motdepasse123');
      await user.click(screen.getByRole('button', { name: 'Se connecter' }));

      expect(mockLogin).toHaveBeenCalledOnce();
      expect(mockLogin).toHaveBeenCalledWith('utilisateur@exemple.com', 'motdepasse123');
    });
  });
});
