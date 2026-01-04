/**
 * System Documents CRUD API Routes
 * Handles all system document-related endpoints at /api/projects/:projectId/systems
 */
import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { CreateSystemDocumentDto, UpdateSystemDocumentDto } from '../types.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import { validateName, validateCategory } from '../utils/validation.ts';
import { getProjectById } from '../utils/projectStorage.ts';
import {
  getAllSystemDocuments,
  getSystemDocumentById,
  createSystemDocument,
  updateSystemDocument,
  deleteSystemDocument,
  isSystemNameDuplicate,
  getUniqueCategories,
  getUniqueTags,
} from '../utils/systemStorage.ts';

export const systemsRouter = Router({ mergeParams: true });

/**
 * Middleware to verify project exists
 */
async function verifyProjectExists(req: Request, res: Response): Promise<boolean> {
  const { projectId } = req.params;
  const project = await getProjectById(projectId);

  if (!project) {
    sendError(res, 404, 'Project not found');
    return false;
  }

  return true;
}

/**
 * GET /api/projects/:projectId/systems/categories - Get unique categories
 *
 * Response: ApiResponse<string[]>
 * - 200: List of unique categories sorted alphabetically
 * - 404: Project not found
 * - 500: Server error
 */
systemsRouter.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    const categories = await getUniqueCategories(projectId);
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * GET /api/projects/:projectId/systems/tags - Get unique tags
 *
 * Response: ApiResponse<string[]>
 * - 200: List of unique tags sorted alphabetically
 * - 404: Project not found
 * - 500: Server error
 */
systemsRouter.get('/tags', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    const tags = await getUniqueTags(projectId);
    sendSuccess(res, tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    sendError(res, 500, 'Failed to get tags');
  }
});

/**
 * POST /api/projects/:projectId/systems - Create a new system document
 *
 * Request Body (CreateSystemDocumentDto):
 * - name: string (required, 1-100 chars)
 * - category: string (required, 1-50 chars)
 * - tags: string[] (optional)
 * - content: string (optional)
 * - dependencies: string[] (optional)
 *
 * Response: ApiResponse<SystemDocument>
 * - 201: System document created successfully
 * - 400: Validation error or duplicate name
 * - 404: Project not found
 * - 500: Server error
 */
systemsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const body = req.body as CreateSystemDocumentDto;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    // Validate name
    const nameValidation = validateName(body.name);
    if (!nameValidation.valid) {
      sendError(res, 400, nameValidation.error!);
      return;
    }

    // Validate category
    const categoryValidation = validateCategory(body.category);
    if (!categoryValidation.valid) {
      sendError(res, 400, categoryValidation.error!);
      return;
    }

    // Check for duplicate name
    if (await isSystemNameDuplicate(projectId, body.name)) {
      sendError(res, 400, 'A system document with this name already exists (duplicate)');
      return;
    }

    // Create system document
    const systemId = uuidv4();
    const systemDocument = await createSystemDocument(projectId, systemId, body);

    sendSuccess(res, systemDocument, 201);
  } catch (error) {
    console.error('Error creating system document:', error);
    sendError(res, 500, 'Failed to create system document');
  }
});

/**
 * GET /api/projects/:projectId/systems - Get all system documents
 *
 * Response: ApiResponse<SystemDocument[]>
 * - 200: List of system documents sorted by createdAt descending
 * - 404: Project not found
 * - 500: Server error
 */
systemsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    const systems = await getAllSystemDocuments(projectId);
    sendSuccess(res, systems);
  } catch (error) {
    console.error('Error getting system documents:', error);
    sendError(res, 500, 'Failed to get system documents');
  }
});

/**
 * GET /api/projects/:projectId/systems/:systemId - Get a single system document by ID
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - systemId: System document UUID
 *
 * Response: ApiResponse<SystemDocument>
 * - 200: System document found
 * - 404: Project or system document not found
 * - 500: Server error
 */
systemsRouter.get('/:systemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, systemId } = req.params;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    const systemDocument = await getSystemDocumentById(projectId, systemId);

    if (!systemDocument) {
      sendError(res, 404, 'System document not found');
      return;
    }

    sendSuccess(res, systemDocument);
  } catch (error) {
    console.error('Error getting system document:', error);
    sendError(res, 500, 'Failed to get system document');
  }
});

/**
 * PUT /api/projects/:projectId/systems/:systemId - Update a system document
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - systemId: System document UUID
 *
 * Request Body (UpdateSystemDocumentDto):
 * - name: string (optional, 1-100 chars)
 * - category: string (optional, 1-50 chars)
 * - tags: string[] (optional)
 * - content: string (optional)
 * - dependencies: string[] (optional)
 *
 * Response: ApiResponse<SystemDocument>
 * - 200: System document updated successfully
 * - 400: Validation error or duplicate name
 * - 404: Project or system document not found
 * - 500: Server error
 */
systemsRouter.put('/:systemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, systemId } = req.params;
    const body = req.body as UpdateSystemDocumentDto;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    // Get existing system document
    const existingSystem = await getSystemDocumentById(projectId, systemId);
    if (!existingSystem) {
      sendError(res, 404, 'System document not found');
      return;
    }

    // Validate name if provided
    if (body.name !== undefined) {
      const nameValidation = validateName(body.name);
      if (!nameValidation.valid) {
        sendError(res, 400, nameValidation.error!);
        return;
      }

      // Check for duplicate name (excluding current system document)
      if (body.name !== existingSystem.name && await isSystemNameDuplicate(projectId, body.name, systemId)) {
        sendError(res, 400, 'A system document with this name already exists (duplicate)');
        return;
      }
    }

    // Validate category if provided
    if (body.category !== undefined) {
      const categoryValidation = validateCategory(body.category);
      if (!categoryValidation.valid) {
        sendError(res, 400, categoryValidation.error!);
        return;
      }
    }

    // Update system document
    const updatedSystem = await updateSystemDocument(projectId, systemId, body);
    sendSuccess(res, updatedSystem);
  } catch (error) {
    console.error('Error updating system document:', error);
    sendError(res, 500, 'Failed to update system document');
  }
});

/**
 * DELETE /api/projects/:projectId/systems/:systemId - Delete a system document
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - systemId: System document UUID
 *
 * Response: ApiResponse<{ deleted: boolean }>
 * - 200: System document deleted successfully
 * - 404: Project or system document not found
 * - 500: Server error
 */
systemsRouter.delete('/:systemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, systemId } = req.params;

    if (!await verifyProjectExists(req, res)) {
      return;
    }

    // Check if system document exists
    const existingSystem = await getSystemDocumentById(projectId, systemId);
    if (!existingSystem) {
      sendError(res, 404, 'System document not found');
      return;
    }

    // Delete system document
    await deleteSystemDocument(projectId, systemId);

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting system document:', error);
    sendError(res, 500, 'Failed to delete system document');
  }
});
