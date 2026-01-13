/**
 * ProtectedRoute Component
 * Protects routes requiring authentication and/or specific roles
 */
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * Default login prompt component
 */
function DefaultLoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please login to access this page.</p>
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Unauthorized component
 */
function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Unauthorized</h2>
        <p className="text-gray-600 mb-4">
          You do not have permission to access this page.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute wraps children and checks authentication status.
 * Optionally checks for specific user role.
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
  loadingComponent,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent || <DefaultLoading />}</>;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <>{fallback || <DefaultLoginPrompt />}</>;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return <Unauthorized />;
  }

  // Render protected content
  return <>{children}</>;
}
