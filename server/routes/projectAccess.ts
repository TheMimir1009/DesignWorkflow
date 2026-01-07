/**
 * Project Access Routes
 * API endpoints for managing project access control
 */
import { Router, type Request, type Response } from 'express';
import {
  getProjectAccess,
  getUserProjectAccess,
  setProjectAccess,
  removeProjectAccess,
} from '../utils/accessStorage';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireProjectRole } from '../middleware/roleMiddleware';
import { sendSuccess, sendError } from '../utils/response';
import type { SetProjectAccessDto, ProjectRole } from '../types/auth';

export const projectAccessRouter = Router({ mergeParams: true });

// Valid project roles
const VALID_ROLES: ProjectRole[] = ['owner', 'editor', 'viewer'];

/**
 * GET /api/projects/:projectId/access - Get all project access entries
 * Requires owner or editor role
 *
 * Response:
 * - 200: List of access entries
 * - 401: Not authenticated
 * - 403: Insufficient permissions
 * - 500: Server error
 */
projectAccessRouter.get(
  '/',
  authenticateToken,
  requireProjectRole('editor'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const accessList = await getProjectAccess(projectId);
      sendSuccess(res, accessList);
    } catch (error) {
      console.error('Error getting project access:', error);
      sendError(res, 500, 'Failed to get project access');
    }
  }
);

/**
 * PUT /api/projects/:projectId/access - Set/update project access for a user
 * Requires owner role
 *
 * Request Body:
 * - userId: string (required)
 * - role: ProjectRole (required: owner, editor, viewer)
 *
 * Response:
 * - 200: Access entry created/updated
 * - 400: Validation error
 * - 401: Not authenticated
 * - 403: Insufficient permissions
 * - 500: Server error
 */
projectAccessRouter.put(
  '/',
  authenticateToken,
  requireProjectRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const body = req.body as SetProjectAccessDto;

      // Validate required fields
      if (!body.userId) {
        sendError(res, 400, 'userId is required');
        return;
      }
      if (!body.role) {
        sendError(res, 400, 'role is required');
        return;
      }

      // Validate role
      if (!VALID_ROLES.includes(body.role)) {
        sendError(res, 400, `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
        return;
      }

      // Prevent owner from changing their own role
      if (body.userId === req.user!.userId) {
        const currentAccess = await getUserProjectAccess(projectId, body.userId);
        if (currentAccess?.role === 'owner') {
          sendError(res, 400, 'Cannot change your own owner role');
          return;
        }
      }

      // Set access
      const access = await setProjectAccess(
        projectId,
        body.userId,
        body.role,
        req.user!.userId
      );

      sendSuccess(res, access);
    } catch (error) {
      console.error('Error setting project access:', error);
      sendError(res, 500, 'Failed to set project access');
    }
  }
);

/**
 * DELETE /api/projects/:projectId/access/:userId - Remove user's project access
 * Requires owner role
 *
 * Response:
 * - 204: Access removed
 * - 400: Cannot remove own access
 * - 401: Not authenticated
 * - 403: Insufficient permissions
 * - 404: Access not found
 * - 500: Server error
 */
projectAccessRouter.delete(
  '/:userId',
  authenticateToken,
  requireProjectRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, userId } = req.params;

      // Prevent owner from removing their own access
      if (userId === req.user!.userId) {
        sendError(res, 400, 'Cannot remove your own access');
        return;
      }

      // Remove access
      const removed = await removeProjectAccess(projectId, userId);

      if (!removed) {
        sendError(res, 404, 'Access not found');
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error removing project access:', error);
      sendError(res, 500, 'Failed to remove project access');
    }
  }
);
