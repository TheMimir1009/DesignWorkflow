/**
 * LoginForm Component
 * User login form with email and password
 */
import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

/**
 * Login form component with validation and error handling
 */
export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, clearError, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email, password);
      onSuccess?.();
    } catch {
      // Error is handled by store
    }
  };

  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleInputChange();
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Register
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}
