/**
 * Default References API Routes
 * Handles default reference endpoints at /api/projects/:projectId/default-references
 * TAG-008: Default reference system API
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getProjectById, saveProject } from '../utils/projectStorage.ts';

export const referencesRouter = Router({ mergeParams: true });

/**
 * GET /api/projects/:projectId/default-references
 * Get default references for a project
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Response: ApiResponse<string[]>
 * - 200: List of default reference document IDs
 * - 404: Project not found
 * - 500: Server error
 */
referencesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    // Get project
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Return default references (empty array if not set)
    sendSuccess(res, project.defaultReferences || []);
  } catch (error) {
    console.error('Error getting default references:', error);
    sendError(res, 500, 'Failed to get default references');
  }
});

/**
 * PUT /api/projects/:projectId/default-references
 * Set default references for a project
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Request Body:
 * - referenceIds: string[] (required)
 *
 * Response: ApiResponse<string[]>
 * - 200: Updated list of default reference document IDs
 * - 400: Validation error (referenceIds not array or missing)
 * - 404: Project not found
 * - 500: Server error
 */
referencesRouter.put('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { referenceIds } = req.body;

    // Validate referenceIds
    if (referenceIds === undefined) {
      sendError(res, 400, 'referenceIds is required');
      return;
    }

    if (!Array.isArray(referenceIds)) {
      sendError(res, 400, 'referenceIds must be an array');
      return;
    }

    // Get project
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Update default references
    project.defaultReferences = referenceIds;
    project.updatedAt = new Date().toISOString();

    // Save project
    await saveProject(project);

    sendSuccess(res, referenceIds);
  } catch (error) {
    console.error('Error saving default references:', error);
    sendError(res, 500, 'Failed to save default references');
  }
});
