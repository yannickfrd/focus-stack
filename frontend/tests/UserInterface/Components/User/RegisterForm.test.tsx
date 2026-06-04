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

  describe('rendering', () => {
    it('renders email and password inputs', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    });

    it('does not show an error message by default', () => {
      render(<RegisterForm />);

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays the error message when error is set', () => {
      mockUseRegisterUser.mockReturnValue(
        defaultHook({ error: 'This email is already registered.' })
      );
      render(<RegisterForm />);

      expect(screen.getByText('This email is already registered.')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('disables the submit button while loading', () => {
      mockUseRegisterUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled();
    });

    it('shows "Creating account…" text while loading', () => {
      mockUseRegisterUser.mockReturnValue(defaultHook({ isLoading: true }));
      render(<RegisterForm />);

      expect(screen.getByText('Creating account…')).toBeInTheDocument();
    });
  });

  describe('password visibility toggle', () => {
    it('password input is hidden by default', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('toggles password visibility when the eye button is clicked', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole('button', { name: 'Show password' }));

      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    });

    it('hides the password again on second click', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole('button', { name: 'Show password' }));
      await user.click(screen.getByRole('button', { name: 'Hide password' }));

      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });
  });

  describe('form submission', () => {
    it('calls register with email and password on submit', async () => {
      const mockRegister = vi.fn();
      mockUseRegisterUser.mockReturnValue(defaultHook({ register: mockRegister }));
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText('Email'), 'new@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(mockRegister).toHaveBeenCalledOnce();
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'password123');
    });
  });
});
