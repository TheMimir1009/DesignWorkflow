/**
 * Role-based Middleware Tests
 * TDD tests for user role and project permission validation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { requireRole, requireProjectRole } from '../../../server/middleware/roleMiddleware';
import { setProjectAccess } from '../../../server/utils/accessStorage';

// Test workspace path
const TEST_WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');
const TEST_PROJECT_ID = 'test-project-middleware';

describe('roleMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Setup mock response
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = vi.fn();

    // Setup test project directory
    await fs.mkdir(path.join(TEST_WORKSPACE_PATH, TEST_PROJECT_ID), { recursive: true });
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Cleanup test project
    try {
      await fs.rm(path.join(TEST_WORKSPACE_PATH, TEST_PROJECT_ID), { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
  });

  describe('requireRole', () => {
    it('should return 401 when user is not authenticated', () => {
      mockRequest = { user: undefined };

      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        data: null,
        error: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      mockRequest = {
        user: { userId: 'user-1', email: 'user@test.com', role: 'user' },
      };

      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        data: null,
        error: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next when user has required role', () => {
      mockRequest = {
        user: { userId: 'admin-1', email: 'admin@test.com', role: 'admin' },
      };

      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should allow any of multiple roles', () => {
      mockRequest = {
        user: { userId: 'user-1', email: 'user@test.com', role: 'user' },
      };

      const middleware = requireRole('admin', 'user');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should reject when user has none of multiple roles', () => {
      mockRequest = {
        user: { userId: 'user-1', email: 'user@test.com', role: 'user' },
      };

      const middleware = requireRole('admin', 'superadmin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireProjectRole', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('owner');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user has no project access', async () => {
      mockRequest = {
        user: { userId: 'user-no-access', email: 'user@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('owner');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        data: null,
        error: 'Insufficient project permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow owner when owner role is required', async () => {
      const userId = 'owner-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'owner', 'admin');

      mockRequest = {
        user: { userId, email: 'owner@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('owner');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should allow owner for editor required role', async () => {
      const userId = 'owner-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'owner', 'admin');

      mockRequest = {
        user: { userId, email: 'owner@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('editor');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow owner for viewer required role', async () => {
      const userId = 'owner-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'owner', 'admin');

      mockRequest = {
        user: { userId, email: 'owner@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('viewer');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow editor for editor required role', async () => {
      const userId = 'editor-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'editor', 'admin');

      mockRequest = {
        user: { userId, email: 'editor@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('editor');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject editor when owner role is required', async () => {
      const userId = 'editor-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'editor', 'admin');

      mockRequest = {
        user: { userId, email: 'editor@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('owner');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow viewer for viewer required role', async () => {
      const userId = 'viewer-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'viewer', 'admin');

      mockRequest = {
        user: { userId, email: 'viewer@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('viewer');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject viewer when editor role is required', async () => {
      const userId = 'viewer-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'viewer', 'admin');

      mockRequest = {
        user: { userId, email: 'viewer@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('editor');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow any of multiple roles', async () => {
      const userId = 'editor-user';
      await setProjectAccess(TEST_PROJECT_ID, userId, 'editor', 'admin');

      mockRequest = {
        user: { userId, email: 'editor@test.com', role: 'user' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('owner', 'editor');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should always allow system admin', async () => {
      mockRequest = {
        user: { userId: 'admin-1', email: 'admin@test.com', role: 'admin' },
        params: { projectId: TEST_PROJECT_ID },
      };

      const middleware = requireProjectRole('owner');
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
