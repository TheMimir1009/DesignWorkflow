/**
 * Auth Middleware Tests
 * TDD tests for JWT authentication middleware
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../../server/middleware/authMiddleware';
import { generateToken } from '../../../server/utils/tokenManager';
import type { User } from '../../../server/types/auth';

describe('authMiddleware', () => {
  // Mock user for generating tokens
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  // Mock Express objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = vi.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 when no authorization header is present', () => {
      mockRequest.headers = {};

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        data: null,
        error: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', () => {
      mockRequest.headers = {
        authorization: '',
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic some-token',
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        data: null,
        error: 'Invalid token format',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        data: null,
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token has wrong signature', async () => {
      // Generate token with different secret
      const jwt = await import('jsonwebtoken');
      const wrongToken = jwt.default.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'user' },
        'wrong-secret'
      );

      mockRequest.headers = {
        authorization: `Bearer ${wrongToken}`,
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() with valid token', () => {
      const validToken = generateToken(mockUser);
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should attach user payload to request with valid token', () => {
      const validToken = generateToken(mockUser);
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('user-123');
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(mockRequest.user?.role).toBe('user');
    });

    it('should preserve admin role in request user', () => {
      const adminUser: User = {
        ...mockUser,
        id: 'admin-456',
        role: 'admin',
      };
      const adminToken = generateToken(adminUser);
      mockRequest.headers = {
        authorization: `Bearer ${adminToken}`,
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user?.role).toBe('admin');
    });

    it('should handle Bearer with extra spaces', () => {
      const validToken = generateToken(mockUser);
      mockRequest.headers = {
        authorization: `Bearer  ${validToken}`,
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Should still work, trimming extra space
      expect(mockNext).toHaveBeenCalled();
    });

    it('should be case-insensitive for Bearer prefix', () => {
      const validToken = generateToken(mockUser);
      mockRequest.headers = {
        authorization: `bearer ${validToken}`,
      };

      authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
