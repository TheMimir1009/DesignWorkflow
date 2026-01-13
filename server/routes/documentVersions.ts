/**
 * Document Versions API Routes
 *
 * RESTful API endpoints for document version management:
 * - Create new document versions
 * - List all versions for a task
 * - Get specific version details
 * - Restore to previous versions
 *
 * ## API Endpoints
 *
 * ### Create Version
 * POST /api/tasks/:taskId/versions
 * - Creates a new version with automatic version numbering
 * - Supports parent version tracking for lineage
 * - Request body: { projectId, content, author, changeDescription?, parentVersionId? }
 * - Response: 201 with created version
 *
 * ### List Versions
 * GET /api/tasks/:taskId/versions?projectId=:projectId
 * - Returns all versions sorted by version number
 * - Query parameter: projectId (required)
 * - Response: 200 with array of versions
 *
 * ### Get Specific Version
 * GET /api/tasks/:taskId/versions/:versionId?projectId=:projectId
 * - Returns specific version by ID
 * - Query parameter: projectId (required)
 * - Response: 200 with version or 404 if not found
 *
 * ### Restore Version
 * POST /api/tasks/:taskId/versions/:versionId/restore
 * - Creates a new version with content from specified version
 * - Request body: { projectId }
 * - Response: 201 with restored version or 404 if not found
 *
 * @module documentVersions
 */

import { Router, type Request, type Response } from 'express';
import {
  saveVersion,
  getVersions,
  getVersion,
  restoreVersion,
  type SaveVersionInput
} from '../utils/versionStorage';
import { sendSuccess, sendError } from '../utils/response';

export const documentVersionsRouter = Router();

/**
 * POST /api/tasks/:taskId/versions
 *
 * Create a new document version for a task
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Request Body:
 * - projectId: string (required) - Project ID
 * - content: string (required) - Document content
 * - author: string (required) - User creating the version
 * - changeDescription?: string - Optional description of changes
 * - parentVersionId?: string - Optional parent version ID for lineage tracking
 *
 * Response: ApiResponse<DocumentVersion>
 * - 201: Version created successfully
 * - 400: Missing required fields
 * - 500: Server error
 */
documentVersionsRouter.post(
  '/:taskId/versions',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { projectId, content, author, changeDescription, parentVersionId } = req.body;

      // Validate required fields
      if (!projectId) {
        sendError(res, 400, 'projectId is required');
        return;
      }

      if (!content) {
        sendError(res, 400, 'content is required');
        return;
      }

      if (!author) {
        sendError(res, 400, 'author is required');
        return;
      }

      // Create new version
      const versionInput: SaveVersionInput = {
        taskId,
        content,
        author,
        changeDescription,
        parentVersionId,
      };

      const newVersion = await saveVersion(projectId, versionInput);

      res.status(201).json({
        success: true,
        data: newVersion,
        error: null,
      });
    } catch (error) {
      console.error('Error creating version:', error);
      sendError(res, 500, 'Failed to create version');
    }
  }
);

/**
 * GET /api/tasks/:taskId/versions
 *
 * Get all versions for a task
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Query Parameters:
 * - projectId: string (required) - Project ID
 *
 * Response: ApiResponse<DocumentVersion[]>
 * - 200: Versions retrieved successfully
 * - 400: Missing projectId
 * - 500: Server error
 */
documentVersionsRouter.get(
  '/:taskId/versions',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { projectId } = req.query;

      // Validate required fields
      if (!projectId || typeof projectId !== 'string') {
        sendError(res, 400, 'projectId query parameter is required');
        return;
      }

      // Get all versions
      const versions = await getVersions(projectId, taskId);

      sendSuccess(res, versions);
    } catch (error) {
      console.error('Error getting versions:', error);
      sendError(res, 500, 'Failed to get versions');
    }
  }
);

/**
 * GET /api/tasks/:taskId/versions/:versionId
 *
 * Get a specific version by ID
 *
 * Path Parameters:
 * - taskId: Task UUID
 * - versionId: Version UUID
 *
 * Query Parameters:
 * - projectId: string (required) - Project ID
 *
 * Response: ApiResponse<DocumentVersion>
 * - 200: Version retrieved successfully
 * - 400: Missing projectId
 * - 404: Version not found
 * - 500: Server error
 */
documentVersionsRouter.get(
  '/:taskId/versions/:versionId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId, versionId } = req.params;
      const { projectId } = req.query;

      // Validate required fields
      if (!projectId || typeof projectId !== 'string') {
        sendError(res, 400, 'projectId query parameter is required');
        return;
      }

      // Get specific version
      const version = await getVersion(projectId, taskId, versionId);

      if (!version) {
        sendError(res, 404, 'Version not found');
        return;
      }

      sendSuccess(res, version);
    } catch (error) {
      console.error('Error getting version:', error);
      sendError(res, 500, 'Failed to get version');
    }
  }
);

/**
 * POST /api/tasks/:taskId/versions/:versionId/restore
 *
 * Restore a task to a specific version
 * Creates a new version with the content from the specified version
 *
 * Path Parameters:
 * - taskId: Task UUID
 * - versionId: Version UUID to restore
 *
 * Request Body:
 * - projectId: string (required) - Project ID
 *
 * Response: ApiResponse<DocumentVersion>
 * - 201: Version restored successfully
 * - 400: Missing projectId
 * - 404: Version not found
 * - 500: Server error
 */
documentVersionsRouter.post(
  '/:taskId/versions/:versionId/restore',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId, versionId } = req.params;
      const { projectId } = req.body;

      // Validate required fields
      if (!projectId) {
        sendError(res, 400, 'projectId is required');
        return;
      }

      // Restore version
      const restoredVersion = await restoreVersion(projectId, taskId, versionId);

      if (!restoredVersion) {
        sendError(res, 404, 'Version not found');
        return;
      }

      res.status(201).json({
        success: true,
        data: restoredVersion,
        error: null,
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      sendError(res, 500, 'Failed to restore version');
    }
  }
);
