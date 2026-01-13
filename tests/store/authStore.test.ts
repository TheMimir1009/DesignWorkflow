/**
 * Auth Store Tests
 * TDD tests for authentication state management with Zustand
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore, TOKEN_STORAGE_KEY } from '../../src/store/authStore';
import * as authService from '../../src/services/authService';
import type { SafeUser, LoginResponse } from '../../src/types';

// Mock the auth service
vi.mock('../../src/services/authService');

describe('authStore', () => {
  const mockUser: SafeUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have null token initially', () => {
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not be loading initially', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginResponse: LoginResponse = { user: mockUser, token: mockToken };
      vi.mocked(authService.login).mockResolvedValueOnce(loginResponse);

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'Password123');
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should store token in localStorage on login', async () => {
      const loginResponse: LoginResponse = { user: mockUser, token: mockToken };
      vi.mocked(authService.login).mockResolvedValueOnce(loginResponse);

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'Password123');
      });

      expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(mockToken);
    });

    it('should set loading state during login', async () => {
      let capturedLoadingState = false;
      const loginResponse: LoginResponse = { user: mockUser, token: mockToken };

      vi.mocked(authService.login).mockImplementationOnce(async () => {
        capturedLoadingState = useAuthStore.getState().isLoading;
        return loginResponse;
      });

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'Password123');
      });

      expect(capturedLoadingState).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set error on login failure', async () => {
      vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid credentials'));

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'wrong-password');
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      vi.mocked(authService.register).mockResolvedValueOnce(mockUser);

      await act(async () => {
        await useAuthStore.getState().register('test@example.com', 'Password123', 'Test User');
      });

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
      // Note: Registration doesn't auto-login
    });

    it('should set error on registration failure', async () => {
      vi.mocked(authService.register).mockRejectedValueOnce(new Error('Email already exists'));

      await act(async () => {
        await useAuthStore.getState().register('test@example.com', 'Password123', 'Test User');
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      // First login
      useAuthStore.setState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      });
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);

      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear localStorage on logout', async () => {
      useAuthStore.setState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      });
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);

      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('should clear state even if logout API fails', async () => {
      useAuthStore.setState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      });

      vi.mocked(authService.logout).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should restore auth from localStorage token', async () => {
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear auth if token is invalid', async () => {
      localStorage.setItem(TOKEN_STORAGE_KEY, 'invalid-token');
      vi.mocked(authService.getCurrentUser).mockRejectedValueOnce(new Error('Invalid token'));

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('should do nothing if no token in localStorage', async () => {
      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(authService.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      act(() => {
        useAuthStore.getState().clearError();
      });

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
