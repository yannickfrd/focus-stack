import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@ui/Hooks/User/useRegisterUser');

import { RegisterForm } from '@ui/Components/User/RegisterForm';
import { useRegisterUser } from '@ui/Hooks/User/useRegisterUser';

const mockUseRegisterUser = vi.mocked(useRegisterUser);

const defaultHook = (overrides: Partial<ReturnType<typeof useRegisterUser>> = {}) => ({
  register: vi.fn(),
  isLoading: false,
  error: null,
  ...overrides,
});

describe('RegisterForm', () => {
  beforeEach(() => {
    mockUseRegisterUser.mockReturnValue(defaultHook());
  });

  describe('rendu', () => {
    it('affiche les champs email et mot de passe', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    });

    it('affiche le bouton de soumission', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: 'Créer un compte' })).toBeInTheDocument();
    });

    it("n'affiche pas de message d'erreur par défaut", () => {
      render(<RegisterForm />);

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });
  });

  describe("état d'erreur", () => {
    it("affiche le message d'erreur quand error est défini", () => {
      mockUseRegisterUser.mockReturnValue(
        defaultHook({ error: 'Cette adresse email est déjà utilisée.' })
      );
      render(<RegisterForm />);

      expect(screen.getByText('Cette adresse email est déjà utilisée.')).toBeInTheDocument();
    });
  });

  describe('état de chargement', () => {
    it('désactive le bouton pendant le chargement', () => {
      mockUseRegisterUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: 'Création du compte…' })).toBeDisabled();
    });

    it('affiche "Création du compte…" pendant le chargement', () => {
      mockUseRegisterUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<RegisterForm />);

      expect(screen.getByText('Création du compte…')).toBeInTheDocument();
    });
  });

  describe('visibilité du mot de passe', () => {
    it('le champ mot de passe est masqué par défaut', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
    });

    it('bascule la visibilité au clic sur le bouton œil', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

      expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'text');
    });

    it('remasque le mot de passe au second clic', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
      await user.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));

      expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
    });
  });

  describe('soumission', () => {
    it('appelle register avec email et mot de passe', async () => {
      const mockRegister = vi.fn();
      mockUseRegisterUser.mockReturnValue(defaultHook({ register: mockRegister }));
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText('Email'), 'nouveau@exemple.com');
      await user.type(screen.getByLabelText('Mot de passe'), 'motdepasse123');
      await user.click(screen.getByRole('button', { name: 'Créer un compte' }));

      expect(mockRegister).toHaveBeenCalledOnce();
      expect(mockRegister).toHaveBeenCalledWith('nouveau@exemple.com', 'motdepasse123');
    });
  });
});
