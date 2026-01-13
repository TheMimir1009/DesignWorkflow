/**
 * RegisterForm Component Tests
 * TDD tests for user registration form
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../../../src/components/auth/RegisterForm';
import { useAuthStore } from '../../../src/store/authStore';

// Mock useAuthStore
vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      register: mockRegister,
      clearError: mockClearError,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  describe('rendering', () => {
    it('should render name input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should render email input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('should render confirm password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should render register button', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<RegisterForm />);
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call register with name, email and password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123', 'Test User');
      });
    });

    it('should disable button while loading', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        register: mockRegister,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useAuthStore>);

      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: /registering/i })).toBeDisabled();
    });

    it('should show loading text while loading', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        register: mockRegister,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useAuthStore>);

      render(<RegisterForm />);

      expect(screen.getByText(/registering/i)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error message from store', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        register: mockRegister,
        clearError: mockClearError,
        isLoading: false,
        error: 'Email already exists',
      } as unknown as ReturnType<typeof useAuthStore>);

      render(<RegisterForm />);

      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    it('should clear error when user starts typing', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        register: mockRegister,
        clearError: mockClearError,
        isLoading: false,
        error: 'Some error',
      } as unknown as ReturnType<typeof useAuthStore>);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'a');

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should not submit with empty name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should not submit with empty email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should not submit with empty password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should not submit when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should show error for password less than 8 characters', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Pass1');
      await user.type(screen.getByLabelText(/confirm password/i), 'Pass1');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('should show error for password without numbers', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(screen.getByText(/letters and numbers/i)).toBeInTheDocument();
    });

    it('should show error for password without letters', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), '12345678');
      await user.type(screen.getByLabelText(/confirm password/i), '12345678');
      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(screen.getByText(/letters and numbers/i)).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onSuccess after successful registration', async () => {
      const onSuccess = vi.fn();
      mockRegister.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      render(<RegisterForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should call onLoginClick when login link is clicked', async () => {
      const onLoginClick = vi.fn();
      const user = userEvent.setup();

      render(<RegisterForm onLoginClick={onLoginClick} />);

      await user.click(screen.getByText(/login/i));

      expect(onLoginClick).toHaveBeenCalled();
    });
  });
});
