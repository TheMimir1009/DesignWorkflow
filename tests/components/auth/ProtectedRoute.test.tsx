/**
 * ProtectedRoute Component Tests
 * TDD tests for authentication-guarded routes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../../../src/components/auth/ProtectedRoute';
import { useAuthStore } from '../../../src/store/authStore';
import type { SafeUser } from '../../../src/types';

// Mock useAuthStore
vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const mockUser: SafeUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const adminUser: SafeUser = {
    ...mockUser,
    id: 'admin-456',
    role: 'admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication check', () => {
    it('should render children when user is authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render redirect/login prompt when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    });

    it('should show loading state while checking auth', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('role check', () => {
    it('should render children when user has required role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: adminUser,
        isLoading: false,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should show unauthorized when user lacks required role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: mockUser, // role: 'user'
        isLoading: false,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    });

    it('should allow access without role requirement', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute>
          <div>Any User Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Any User Content')).toBeInTheDocument();
    });
  });

  describe('fallback rendering', () => {
    it('should render custom fallback when provided', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute fallback={<div>Custom Login Page</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
    });

    it('should render custom loading component when provided', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      } as ReturnType<typeof useAuthStore>);

      render(
        <ProtectedRoute loadingComponent={<div>Custom Spinner</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Custom Spinner')).toBeInTheDocument();
    });
  });
});
