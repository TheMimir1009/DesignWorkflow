/**
 * Prompts CRUD API Routes
 * Handles all prompt template-related endpoints at /api/prompts
 *
 * Endpoints:
 * - GET /api/prompts/categories - Get all available categories
 * - GET /api/prompts - List all prompts (with optional category filter)
 * - GET /api/prompts/:id - Get specific prompt
 * - POST /api/prompts - Create new prompt
 * - PUT /api/prompts/:id - Update prompt
 * - POST /api/prompts/:id/reset - Reset prompt to default content
 * - GET /api/prompts/:id/versions - Get version history
 * - DELETE /api/prompts/:id - Delete prompt
 */
import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { PromptCategory } from '../../src/types/index.ts';
import type { CreatePromptTemplateDto, UpdatePromptTemplateDto } from '../utils/promptStorage.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import { validateName } from '../utils/validation.ts';
import {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  resetPrompt as resetPromptUtil,
  deletePrompt as deletePromptUtil,
  getPromptVersions,
  validatePromptVariables,
} from '../utils/promptStorage.ts';

export const promptsRouter = Router();

/**
 * Valid prompt categories
 */
const VALID_CATEGORIES: PromptCategory[] = [
  'document-generation',
  'code-operation',
  'analysis',
  'utility',
];

/**
 * Validate prompt category
 */
function validateCategory(category: unknown): { valid: boolean; error?: string } {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'category is required' };
  }

  if (!VALID_CATEGORIES.includes(category as PromptCategory)) {
    return {
      valid: false,
      error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * GET /api/prompts/categories - Get all available categories
 */
promptsRouter.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    sendSuccess(res, VALID_CATEGORIES);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * GET /api/prompts - List all prompts
 * Query params:
 * - category: Optional category filter
 */
promptsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    let prompts;
    if (category && typeof category === 'string') {
      const validation = validateCategory(category);
      if (!validation.valid) {
        sendError(res, 400, validation.error!);
        return;
      }
      prompts = await getAllPrompts(category as PromptCategory);
    } else {
      prompts = await getAllPrompts();
    }

    sendSuccess(res, prompts);
  } catch (error) {
    console.error('Error getting prompts:', error);
    sendError(res, 500, 'Failed to get prompts');
  }
});

/**
 * GET /api/prompts/:id - Get specific prompt
 */
promptsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const prompt = await getPromptById(id);

    if (!prompt) {
      sendError(res, 404, 'Prompt not found');
      return;
    }

    sendSuccess(res, prompt);
  } catch (error) {
    console.error('Error getting prompt:', error);
    sendError(res, 500, 'Failed to get prompt');
  }
});

/**
 * POST /api/prompts - Create new prompt
 */
promptsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as CreatePromptTemplateDto;

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

    // Create prompt with generated UUID
    const promptId = uuidv4();
    const created = await createPrompt(promptId, body);

    sendSuccess(res, created, 201);
  } catch (error) {
    console.error('Error creating prompt:', error);
    sendError(res, 500, 'Failed to create prompt');
  }
});

/**
 * PUT /api/prompts/:id - Update prompt
 */
promptsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdatePromptTemplateDto;

    // Validate name if provided
    if (body.name !== undefined) {
      const nameValidation = validateName(body.name);
      if (!nameValidation.valid) {
        sendError(res, 400, nameValidation.error!);
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

    const updated = await updatePrompt(id, body);
    sendSuccess(res, updated);
  } catch (error) {
    if (error instanceof Error && error.message === 'Prompt not found') {
      sendError(res, 404, 'Prompt not found');
    } else {
      console.error('Error updating prompt:', error);
      sendError(res, 500, 'Failed to update prompt');
    }
  }
});

/**
 * POST /api/prompts/:id/reset - Reset prompt to default content
 */
promptsRouter.post('/:id/reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reset = await resetPromptUtil(id);
    sendSuccess(res, reset);
  } catch (error) {
    if (error instanceof Error && error.message === 'Prompt not found') {
      sendError(res, 404, 'Prompt not found');
    } else {
      console.error('Error resetting prompt:', error);
      sendError(res, 500, 'Failed to reset prompt');
    }
  }
});

/**
 * GET /api/prompts/:id/versions - Get version history
 */
promptsRouter.get('/:id/versions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify prompt exists
    const prompt = await getPromptById(id);
    if (!prompt) {
      sendError(res, 404, 'Prompt not found');
      return;
    }

    const versions = await getPromptVersions(id);
    sendSuccess(res, versions);
  } catch (error) {
    console.error('Error getting prompt versions:', error);
    sendError(res, 500, 'Failed to get prompt versions');
  }
});

/**
 * DELETE /api/prompts/:id - Delete prompt
 */
promptsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify prompt exists before deleting
    const prompt = await getPromptById(id);
    if (!prompt) {
      sendError(res, 404, 'Prompt not found');
      return;
    }

    await deletePromptUtil(id);
    sendSuccess(res, { id, deleted: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    sendError(res, 500, 'Failed to delete prompt');
  }
});
