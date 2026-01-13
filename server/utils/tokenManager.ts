/**
 * Token Manager Utilities
 * JWT token generation and verification
 */
import jwt from 'jsonwebtoken';
import type { User, JWTPayload } from '../types/auth';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
export const TOKEN_EXPIRY = '24h';

/**
 * Generate JWT token for a user
 * Token contains userId, email, and role
 * Expires in 24 hours
 *
 * @param user - User to generate token for
 * @returns JWT token string
 */
export function generateToken(user: User): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode JWT token
 *
 * @param token - JWT token string
 * @returns Decoded payload if valid, null if invalid or expired
 */
export function verifyToken(token: string): JWTPayload | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
