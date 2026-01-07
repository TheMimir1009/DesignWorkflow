/**
 * Auth Service Tests
 * TDD tests for authentication API service layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  register,
  login,
  logout,
  getCurrentUser,
  API_BASE_URL,
} from '../../src/services/authService';
import type { SafeUser, LoginResponse } from '../../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockUser: SafeUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockToken = 'mock-jwt-token';

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUser,
          error: null,
        }),
      });

      const result = await register('test@example.com', 'Password123', 'Test User');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User',
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error on registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          data: null,
          error: 'Email already exists',
        }),
      });

      await expect(register('test@example.com', 'Password123', 'Test User'))
        .rejects.toThrow('Email already exists');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(register('test@example.com', 'Password123', 'Test User'))
        .rejects.toThrow('Network error');
    });
  });

  describe('login', () => {
    it('should login successfully and return user with token', async () => {
      const loginResponse: LoginResponse = {
        user: mockUser,
        token: mockToken,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: loginResponse,
          error: null,
        }),
      });

      const result = await login('test@example.com', 'Password123');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
        }),
      });
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe(mockToken);
    });

    it('should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: 'Invalid email or password',
        }),
      });

      await expect(login('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { message: 'Logged out successfully' },
          error: null,
        }),
      });

      await expect(logout(mockToken)).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it('should throw error when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: 'No token provided',
        }),
      });

      await expect(logout('')).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUser,
          error: null,
        }),
      });

      const result = await getCurrentUser(mockToken);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when token is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: 'Invalid or expired token',
        }),
      });

      await expect(getCurrentUser('invalid-token'))
        .rejects.toThrow('Invalid or expired token');
    });
  });
});
