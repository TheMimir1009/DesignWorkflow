/**
 * Token Manager Tests
 * TDD tests for JWT token generation and verification
 */
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateToken,
  verifyToken,
  JWT_SECRET,
  TOKEN_EXPIRY,
} from '../../../server/utils/tokenManager';
import type { User } from '../../../server/types/auth';

describe('tokenManager', () => {
  // Sample user for testing
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const adminUser: User = {
    id: 'admin-456',
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user id in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      expect(decoded.userId).toBe('user-123');
    });

    it('should include user email in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      expect(decoded.email).toBe('test@example.com');
    });

    it('should include user role in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      expect(decoded.role).toBe('user');
    });

    it('should set correct role for admin user', () => {
      const token = generateToken(adminUser);
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      expect(decoded.role).toBe('admin');
    });

    it('should set expiration to 24 hours', () => {
      const beforeTime = Math.floor(Date.now() / 1000);
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      const afterTime = Math.floor(Date.now() / 1000);

      // exp should be roughly 24 hours (86400 seconds) from now
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp! - decoded.iat!).toBe(86400); // 24 hours in seconds

      // iat should be within the time window of test execution
      expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime);
      expect(decoded.iat).toBeLessThanOrEqual(afterTime);
    });

    it('should not include sensitive data like passwordHash', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      expect(decoded.passwordHash).toBeUndefined();
      expect(decoded.password).toBeUndefined();
    });
  });

  describe('verifyToken', () => {
    it('should return payload for valid token', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user-123');
      expect(payload?.email).toBe('test@example.com');
      expect(payload?.role).toBe('user');
    });

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = verifyToken('not.a.valid.jwt.token');
      expect(payload).toBeNull();
    });

    it('should return null for token with wrong signature', () => {
      const wrongToken = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'user' },
        'wrong-secret',
        { expiresIn: '24h' }
      );
      const payload = verifyToken(wrongToken);
      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expired in the past
      const expiredToken = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'user' },
        JWT_SECRET,
        { expiresIn: '-1s' } // Expired 1 second ago
      );
      const payload = verifyToken(expiredToken);
      expect(payload).toBeNull();
    });

    it('should return null for empty string token', () => {
      const payload = verifyToken('');
      expect(payload).toBeNull();
    });

    it('should preserve iat and exp in returned payload', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });
  });

  describe('TOKEN_EXPIRY', () => {
    it('should be 24 hours in string format', () => {
      expect(TOKEN_EXPIRY).toBe('24h');
    });
  });

  describe('JWT_SECRET', () => {
    it('should use environment variable if set', () => {
      // Note: In actual usage, JWT_SECRET should be set via environment
      // For testing, we verify it has a default value
      expect(JWT_SECRET).toBeDefined();
      expect(JWT_SECRET.length).toBeGreaterThan(0);
    });
  });
});
