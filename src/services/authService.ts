/**
 * Auth Service - API Communication Layer
 * Handles authentication operations via REST API
 */
import type { SafeUser, LoginResponse, ApiResponse } from '../types';

/**
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
 * Handle API response and throw error if unsuccessful
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    throw new Error(json.error || `HTTP error! status: ${response.status}`);
  }

  return json.data as T;
}

/**
 * Register a new user
 * @param email - User email
 * @param password - User password
 * @param name - User name
 * @returns Created user
 * @throws Error if registration fails
 */
export async function register(
  email: string,
  password: string,
  name: string
): Promise<SafeUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse<SafeUser>(response);
}

/**
 * Login with credentials
 * @param email - User email
 * @param password - User password
 * @returns User and JWT token
 * @throws Error if login fails
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<LoginResponse>(response);
}

/**
 * Logout current user
 * @param token - JWT token
 * @throws Error if logout fails
 */
export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  await handleResponse<{ message: string }>(response);
}

/**
 * Get current user profile
 * @param token - JWT token
 * @returns Current user
 * @throws Error if not authenticated or token invalid
 */
export async function getCurrentUser(token: string): Promise<SafeUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<SafeUser>(response);
}
