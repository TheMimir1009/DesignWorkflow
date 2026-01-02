/**
 * Systems CRUD API Routes
 * Handles all system document-related endpoints at /api/projects/:projectId/systems
 */
import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { SystemDocument } from '../../src/types/index.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  getAllSystemDocuments,
  getSystemDocumentById,
  saveSystemDocument,
  deleteSystemDocument,
  getCategories,
  getTags,
  isSystemNameDuplicate,
  searchSystemDocuments,
  getDependentDocuments,
} from '../utils/systemStorage.ts';

/**
 * DTO types for system document operations
 */
interface CreateSystemDto {
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

interface UpdateSystemDto {
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

/**
 * Validate system document name
 * @param name - Name to validate
 * @returns Validation result with optional error message
 */
function validateName(name: unknown): { valid: boolean; error?: string } {
  if (name === undefined || name === null) {
    return { valid: false, error: 'Document name is required' };
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'Document name must be a string' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Document name cannot be empty' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Document name must be 100 characters or less' };
  }

  return { valid: true };
}

/**
 * Validate system document category
 * @param category - Category to validate
 * @returns Validation result with optional error message
 */
function validateCategory(category: unknown): { valid: boolean; error?: string } {
  if (category === undefined || category === null) {
    return { valid: false, error: 'Document category is required' };
  }

  if (typeof category !== 'string') {
    return { valid: false, error: 'Document category must be a string' };
  }

  const trimmedCategory = category.trim();

  if (trimmedCategory.length === 0) {
    return { valid: false, error: 'Document category cannot be empty' };
  }

  return { valid: true };
}

export const systemsRouter = Router({ mergeParams: true });

/**
 * GET /api/projects/:projectId/systems/categories
 * Get all unique categories for a project
 *
 * Response: ApiResponse<string[]>
 * - 200: List of unique categories sorted alphabetically
 * - 500: Server error
 */
systemsRouter.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const categories = await getCategories(projectId);
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * GET /api/projects/:projectId/systems/tags
 * Get all unique tags for a project
 *
 * Response: ApiResponse<string[]>
 * - 200: List of unique tags sorted alphabetically
 * - 500: Server error
 */
systemsRouter.get('/tags', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const tags = await getTags(projectId);
    sendSuccess(res, tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    sendError(res, 500, 'Failed to get tags');
  }
});

/**
 * GET /api/projects/:projectId/systems/search
 * Search system documents by query
 *
 * Query Parameters:
 * - q: Search query string
 *
 * Response: ApiResponse<SystemDocument[]>
 * - 200: List of matching documents
 * - 500: Server error
 */
systemsRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const query = (req.query.q as string) || '';
    const documents = await searchSystemDocuments(projectId, query);
    sendSuccess(res, documents);
  } catch (error) {
    console.error('Error searching documents:', error);
    sendError(res, 500, 'Failed to search documents');
  }
});

/**
 * GET /api/projects/:projectId/systems
 * Get all system documents for a project
 *
 * Response: ApiResponse<SystemDocument[]>
 * - 200: List of system documents with content
 * - 500: Server error
 */
systemsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const documents = await getAllSystemDocuments(projectId);
    sendSuccess(res, documents);
  } catch (error) {
    console.error('Error getting system documents:', error);
    sendError(res, 500, 'Failed to get system documents');
  }
});

/**
 * GET /api/projects/:projectId/systems/:id
 * Get a single system document by ID
 *
 * Path Parameters:
 * - id: System document UUID
 *
 * Response: ApiResponse<SystemDocument>
 * - 200: System document found
 * - 404: System document not found
 * - 500: Server error
 */
systemsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, id } = req.params;
    const document = await getSystemDocumentById(projectId, id);

    if (!document) {
      sendError(res, 404, 'System document not found');
      return;
    }

    sendSuccess(res, document);
  } catch (error) {
    console.error('Error getting system document:', error);
    sendError(res, 500, 'Failed to get system document');
  }
});

/**
 * POST /api/projects/:projectId/systems
 * Create a new system document
 *
 * Request Body (CreateSystemDto):
 * - name: string (required, 1-100 chars)
 * - category: string (required)
 * - tags: string[] (optional)
 * - content: string (optional)
 * - dependencies: string[] (optional)
 *
 * Response: ApiResponse<SystemDocument>
 * - 201: System document created successfully
 * - 400: Validation error or duplicate name
 * - 500: Server error
 */
systemsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const body = req.body as CreateSystemDto;

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
      sendError(res, 400, 'A system document with this name already exists');
      return;
    }

    // Create document entity
    const now = new Date().toISOString();
    const document: SystemDocument = {
      id: uuidv4(),
      projectId,
      name: body.name.trim(),
      category: body.category.trim(),
      tags: body.tags ?? [],
      content: body.content ?? '',
      dependencies: body.dependencies ?? [],
      createdAt: now,
      updatedAt: now,
    };

    await saveSystemDocument(projectId, document);
    sendSuccess(res, document, 201);
  } catch (error) {
    console.error('Error creating system document:', error);
    sendError(res, 500, 'Failed to create system document');
  }
});

/**
 * PUT /api/projects/:projectId/systems/:id
 * Update a system document
 *
 * Path Parameters:
 * - id: System document UUID
 *
 * Request Body (UpdateSystemDto):
 * - name: string (optional, 1-100 chars)
 * - category: string (optional)
 * - tags: string[] (optional)
 * - content: string (optional)
 * - dependencies: string[] (optional)
 *
 * Response: ApiResponse<SystemDocument>
 * - 200: System document updated successfully
 * - 400: Validation error or duplicate name
 * - 404: System document not found
 * - 500: Server error
 */
systemsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, id } = req.params;
    const body = req.body as UpdateSystemDto;

    // Get existing document
    const existingDoc = await getSystemDocumentById(projectId, id);
    if (!existingDoc) {
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

      // Check for duplicate name (excluding current document)
      if (body.name !== existingDoc.name && await isSystemNameDuplicate(projectId, body.name, id)) {
        sendError(res, 400, 'A system document with this name already exists');
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

    // Update document with provided fields
    const updatedDoc: SystemDocument = {
      ...existingDoc,
      name: body.name !== undefined ? body.name.trim() : existingDoc.name,
      category: body.category !== undefined ? body.category.trim() : existingDoc.category,
      tags: body.tags ?? existingDoc.tags,
      content: body.content !== undefined ? body.content : existingDoc.content,
      dependencies: body.dependencies ?? existingDoc.dependencies,
      updatedAt: new Date().toISOString(),
    };

    await saveSystemDocument(projectId, updatedDoc);
    sendSuccess(res, updatedDoc);
  } catch (error) {
    console.error('Error updating system document:', error);
    sendError(res, 500, 'Failed to update system document');
  }
});

/**
 * DELETE /api/projects/:projectId/systems/:id
 * Delete a system document
 *
 * Path Parameters:
 * - id: System document UUID
 *
 * Response: ApiResponse<{ deleted: boolean, dependentDocuments?: SystemDocument[] }>
 * - 200: System document deleted successfully
 * - 404: System document not found
 * - 500: Server error
 */
systemsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, id } = req.params;

    // Check if document exists
    const existingDoc = await getSystemDocumentById(projectId, id);
    if (!existingDoc) {
      sendError(res, 404, 'System document not found');
      return;
    }

    // Get dependent documents (for informational purposes)
    const dependentDocs = await getDependentDocuments(projectId, id);

    // Delete document
    await deleteSystemDocument(projectId, id);

    // Update dependent documents to remove this document from their dependencies
    for (const depDoc of dependentDocs) {
      const updatedDependencies = depDoc.dependencies.filter(depId => depId !== id);
      await saveSystemDocument(projectId, { ...depDoc, dependencies: updatedDependencies });
    }

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting system document:', error);
    sendError(res, 500, 'Failed to delete system document');
  }
});
