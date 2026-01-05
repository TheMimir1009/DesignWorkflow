/**
 * Systems API Routes
 * Handles all system document-related endpoints
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getProjectById } from '../utils/projectStorage.ts';
import {
  getSystemsByProject,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
} from '../utils/systemStorage.ts';

export const systemsRouter = Router();

/**
 * GET /api/projects/:projectId/systems - Get all systems for a project
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Response: ApiResponse<SystemDocument[]>
 * - 200: List of systems
 * - 404: Project not found
 * - 500: Server error
 */
export async function getProjectSystems(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    const systems = await getSystemsByProject(projectId);
    sendSuccess(res, systems);
  } catch (error) {
    console.error('Error getting systems:', error);
    sendError(res, 500, 'Failed to get systems');
  }
}

/**
 * POST /api/projects/:projectId/systems - Create a new system document
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Request Body:
 * - name: string (required)
 * - category: string (required)
 * - tags?: string[]
 * - content?: string
 * - dependencies?: string[]
 *
 * Response: ApiResponse<SystemDocument>
 * - 201: System created successfully
 * - 400: Missing required fields
 * - 404: Project not found
 * - 500: Server error
 */
export async function createProjectSystem(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { name, category, tags, content, dependencies } = req.body;

    // Validate name is provided
    if (!name) {
      sendError(res, 400, 'Name is required');
      return;
    }

    // Validate category is provided
    if (!category) {
      sendError(res, 400, 'Category is required');
      return;
    }

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Create system
    const newSystem = await createSystem({
      projectId,
      name,
      category,
      tags,
      content,
      dependencies,
    });

    res.status(201).json({
      success: true,
      data: newSystem,
      error: null,
    });
  } catch (error) {
    console.error('Error creating system:', error);
    sendError(res, 500, 'Failed to create system');
  }
}

/**
 * GET /api/systems/:id - Get a single system document
 *
 * Path Parameters:
 * - id: System UUID
 *
 * Response: ApiResponse<SystemDocument>
 * - 200: System document
 * - 404: System not found
 * - 500: Server error
 */
systemsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await getSystemById(id);
    if (!result) {
      sendError(res, 404, 'System not found');
      return;
    }

    sendSuccess(res, result.system);
  } catch (error) {
    console.error('Error getting system:', error);
    sendError(res, 500, 'Failed to get system');
  }
});

/**
 * PUT /api/systems/:id - Update a system document
 *
 * Path Parameters:
 * - id: System UUID
 *
 * Request Body:
 * - name?: string
 * - category?: string
 * - tags?: string[]
 * - content?: string
 * - dependencies?: string[]
 *
 * Response: ApiResponse<SystemDocument>
 * - 200: System updated successfully
 * - 404: System not found
 * - 500: Server error
 */
systemsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if system exists
    const result = await getSystemById(id);
    if (!result) {
      sendError(res, 404, 'System not found');
      return;
    }

    // Update system
    const updatedSystem = await updateSystem(id, updates);
    if (!updatedSystem) {
      sendError(res, 500, 'Failed to update system');
      return;
    }

    sendSuccess(res, updatedSystem);
  } catch (error) {
    console.error('Error updating system:', error);
    sendError(res, 500, 'Failed to update system');
  }
});

/**
 * DELETE /api/systems/:id - Delete a system document
 *
 * Path Parameters:
 * - id: System UUID
 *
 * Response: ApiResponse<{ deleted: boolean }>
 * - 200: System deleted successfully
 * - 404: System not found
 * - 500: Server error
 */
systemsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await deleteSystem(id);
    if (!deleted) {
      sendError(res, 404, 'System not found');
      return;
    }

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting system:', error);
    sendError(res, 500, 'Failed to delete system');
  }
});
