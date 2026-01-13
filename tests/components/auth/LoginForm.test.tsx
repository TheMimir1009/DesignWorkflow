/**
 * LoginForm Component Tests
 * TDD tests for user login form
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../../src/components/auth/LoginForm';
import { useAuthStore } from '../../../src/store/authStore';

// Mock useAuthStore
vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  describe('rendering', () => {
    it('should render email input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render password input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render login button', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render register link', () => {
      render(<LoginForm />);
      expect(screen.getByText(/register/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call login with email and password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
      });
    });

    it('should disable button while loading', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useAuthStore>);

      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });

    it('should show loading text while loading', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useAuthStore>);

      render(<LoginForm />);

      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: false,
        error: 'Invalid email or password',
      } as unknown as ReturnType<typeof useAuthStore>);

      render(<LoginForm />);

      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    it('should clear error when user starts typing', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: false,
        error: 'Some error',
      } as unknown as ReturnType<typeof useAuthStore>);

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'a');

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should not submit with empty email', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should not submit with empty password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should call onSuccess after successful login', async () => {
      const onSuccess = vi.fn();
      mockLogin.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      render(<LoginForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should call onRegisterClick when register link is clicked', async () => {
      const onRegisterClick = vi.fn();
      const user = userEvent.setup();

      render(<LoginForm onRegisterClick={onRegisterClick} />);

      await user.click(screen.getByText(/register/i));

      expect(onRegisterClick).toHaveBeenCalled();
    });
  });
});
