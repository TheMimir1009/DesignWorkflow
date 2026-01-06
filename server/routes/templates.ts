/**
 * Templates CRUD API Routes
 * Handles all template-related endpoints at /api/templates
 */
import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { TemplateCategory } from '../../src/types/index.ts';
import type { CreateTemplateDto, UpdateTemplateDto } from '../utils/templateStorage.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import { validateName } from '../utils/validation.ts';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  isTemplateNameDuplicate,
  isDefaultTemplate,
  applyTemplateVariables,
  getMissingRequiredVariables,
  generatePreview,
  VALID_CATEGORIES,
} from '../utils/templateStorage.ts';

export const templatesRouter = Router();

/**
 * Validate template category
 * @param category - Category to validate
 * @returns Validation result
 */
function validateCategory(category: unknown): { valid: boolean; error?: string } {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'category is required' };
  }

  if (!VALID_CATEGORIES.includes(category as TemplateCategory)) {
    return {
      valid: false,
      error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * GET /api/templates/categories - Get all available categories
 *
 * Response: ApiResponse<string[]>
 * - 200: List of available categories
 */
templatesRouter.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    sendSuccess(res, VALID_CATEGORIES);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * POST /api/templates - Create a new template
 *
 * Request Body (CreateTemplateDto):
 * - name: string (required, 1-100 chars)
 * - category: TemplateCategory (required)
 * - description: string (optional)
 * - content: string (optional)
 * - variables: TemplateVariable[] (optional)
 * - projectId: string | null (optional)
 *
 * Response: ApiResponse<Template>
 * - 201: Template created successfully
 * - 400: Validation error or duplicate name
 * - 500: Server error
 */
templatesRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as CreateTemplateDto;

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

    // Check for duplicate name in same category
    if (await isTemplateNameDuplicate(body.name, body.category)) {
      sendError(res, 400, 'A template with this name already exists in this category (duplicate)');
      return;
    }

    // Create template
    const templateId = uuidv4();
    const template = await createTemplate(templateId, body);

    sendSuccess(res, template, 201);
  } catch (error) {
    console.error('Error creating template:', error);
    sendError(res, 500, 'Failed to create template');
  }
});

/**
 * GET /api/templates - Get all templates
 *
 * Query Parameters:
 * - category: TemplateCategory (optional) - Filter by category
 * - projectId: string (optional) - Filter by project ID
 *
 * Response: ApiResponse<Template[]>
 * - 200: List of templates sorted by createdAt descending
 * - 500: Server error
 */
templatesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as TemplateCategory | undefined;
    const projectId = req.query.projectId as string | undefined;

    const templates = await getAllTemplates(category, projectId);
    sendSuccess(res, templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    sendError(res, 500, 'Failed to get templates');
  }
});

/**
 * GET /api/templates/:templateId - Get a single template by ID
 *
 * Path Parameters:
 * - templateId: Template UUID
 *
 * Response: ApiResponse<Template>
 * - 200: Template found
 * - 404: Template not found
 * - 500: Server error
 */
templatesRouter.get('/:templateId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    const template = await getTemplateById(templateId);

    if (!template) {
      sendError(res, 404, 'Template not found');
      return;
    }

    sendSuccess(res, template);
  } catch (error) {
    console.error('Error getting template:', error);
    sendError(res, 500, 'Failed to get template');
  }
});

/**
 * GET /api/templates/:templateId/preview - Preview template with default values
 *
 * Path Parameters:
 * - templateId: Template UUID
 *
 * Response: ApiResponse<{ content: string }>
 * - 200: Preview generated
 * - 404: Template not found
 * - 500: Server error
 */
templatesRouter.get('/:templateId/preview', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    const template = await getTemplateById(templateId);

    if (!template) {
      sendError(res, 404, 'Template not found');
      return;
    }

    const previewContent = generatePreview(template.content, template.variables);
    sendSuccess(res, { content: previewContent });
  } catch (error) {
    console.error('Error previewing template:', error);
    sendError(res, 500, 'Failed to preview template');
  }
});

/**
 * PUT /api/templates/:templateId - Update a template
 *
 * Path Parameters:
 * - templateId: Template UUID
 *
 * Request Body (UpdateTemplateDto):
 * - name: string (optional, 1-100 chars)
 * - category: TemplateCategory (optional)
 * - description: string (optional)
 * - content: string (optional)
 * - variables: TemplateVariable[] (optional)
 *
 * Response: ApiResponse<Template>
 * - 200: Template updated successfully
 * - 400: Validation error or duplicate name
 * - 404: Template not found
 * - 500: Server error
 */
templatesRouter.put('/:templateId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const body = req.body as UpdateTemplateDto;

    // Get existing template
    const existingTemplate = await getTemplateById(templateId);
    if (!existingTemplate) {
      sendError(res, 404, 'Template not found');
      return;
    }

    // Validate name if provided
    if (body.name !== undefined) {
      const nameValidation = validateName(body.name);
      if (!nameValidation.valid) {
        sendError(res, 400, nameValidation.error!);
        return;
      }

      // Check for duplicate name (excluding current template)
      const category = body.category ?? existingTemplate.category;
      if (body.name !== existingTemplate.name && await isTemplateNameDuplicate(body.name, category, templateId)) {
        sendError(res, 400, 'A template with this name already exists in this category (duplicate)');
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

    // Update template
    const updatedTemplate = await updateTemplate(templateId, body);
    sendSuccess(res, updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    sendError(res, 500, 'Failed to update template');
  }
});

/**
 * DELETE /api/templates/:templateId - Delete a template
 *
 * Path Parameters:
 * - templateId: Template UUID
 *
 * Response: ApiResponse<{ deleted: boolean }>
 * - 200: Template deleted successfully
 * - 400: Cannot delete default template
 * - 404: Template not found
 * - 500: Server error
 */
templatesRouter.delete('/:templateId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    // Check if template exists
    const existingTemplate = await getTemplateById(templateId);
    if (!existingTemplate) {
      sendError(res, 404, 'Template not found');
      return;
    }

    // Check if it's a default template
    if (await isDefaultTemplate(templateId)) {
      sendError(res, 400, 'Cannot delete default templates');
      return;
    }

    // Delete template
    await deleteTemplate(templateId);

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    sendError(res, 500, 'Failed to delete template');
  }
});

/**
 * POST /api/templates/:templateId/apply - Apply template with variable values
 *
 * Path Parameters:
 * - templateId: Template UUID
 *
 * Request Body:
 * - variableValues: Record<string, string>
 *
 * Response: ApiResponse<{ content: string; appliedAt: string }>
 * - 200: Template applied successfully
 * - 400: Missing required variables
 * - 404: Template not found
 * - 500: Server error
 */
templatesRouter.post('/:templateId/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const { variableValues = {} } = req.body as { variableValues?: Record<string, string> };

    // Get template
    const template = await getTemplateById(templateId);
    if (!template) {
      sendError(res, 404, 'Template not found');
      return;
    }

    // Validate required variables
    const missingVariables = getMissingRequiredVariables(template.variables, variableValues);
    if (missingVariables.length > 0) {
      sendError(res, 400, `Missing required variables: ${missingVariables.join(', ')}`);
      return;
    }

    // Apply variables
    const appliedContent = applyTemplateVariables(template.content, template.variables, variableValues);

    sendSuccess(res, {
      content: appliedContent,
      appliedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error applying template:', error);
    sendError(res, 500, 'Failed to apply template');
  }
});
