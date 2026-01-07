/**
 * Auth Store - Zustand State Management
 * Centralized state management for authentication
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthState } from '../types';
import * as authService from '../services/authService';

// localStorage key for token persistence
export const TOKEN_STORAGE_KEY = 'auth_token';

/**
 * Auth store with authentication actions
 */
export interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Create auth store with Zustand
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null }, false, 'login/start');
        try {
          const response = await authService.login(email, password);

          // Store token in localStorage
          localStorage.setItem(TOKEN_STORAGE_KEY, response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }, false, 'login/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          }, false, 'login/error');
        }
      },

      // Register action
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null }, false, 'register/start');
        try {
          await authService.register(email, password, name);
          set({ isLoading: false, error: null }, false, 'register/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          }, false, 'register/error');
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true }, false, 'logout/start');
        const token = get().token;

        try {
          if (token) {
            await authService.logout(token);
          }
        } catch {
          // Ignore logout API errors - still clear local state
        }

        // Clear localStorage
        localStorage.removeItem(TOKEN_STORAGE_KEY);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }, false, 'logout/success');
      },

      // Check authentication from stored token
      checkAuth: async () => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!storedToken) {
          set({ isAuthenticated: false }, false, 'checkAuth/noToken');
          return;
        }

        set({ isLoading: true }, false, 'checkAuth/start');
        try {
          const user = await authService.getCurrentUser(storedToken);
          set({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }, false, 'checkAuth/success');
        } catch {
          // Clear invalid token
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          }, false, 'checkAuth/invalid');
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null }, false, 'clearError');
      },
    }),
    { name: 'AuthStore' }
  )
);
