/**
 * Authentication Type Definitions
 * Types for user authentication and project access control
 */

/**
 * User role in the system
 * - admin: Full system access, can manage all users
 * - user: Standard user with project-specific access
 */
export type UserRole = 'admin' | 'user';

/**
 * Project access role
 * - owner: Full project control, can manage access
 * - editor: Can read and write to project
 * - viewer: Read-only access to project
 */
export type ProjectRole = 'owner' | 'editor' | 'viewer';

/**
 * User entity stored in the system
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * User data without sensitive information (for API responses)
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project access entry
 * Defines a user's access level to a specific project
 */
export interface ProjectAccess {
  userId: string;
  projectId: string;
  role: ProjectRole;
  grantedBy: string;
  grantedAt: string;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * DTOs for authentication operations
 */

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface SetProjectAccessDto {
  userId: string;
  role: ProjectRole;
}

/**
 * API response types for auth operations
 */

export interface LoginResponse {
  user: SafeUser;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

/**
 * Express request extension for authenticated requests
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: JWTPayload;
  }
}
