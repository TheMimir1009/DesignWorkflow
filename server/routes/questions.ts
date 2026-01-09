/**
 * Questions API Routes
 * Handles all question-related endpoints
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  loadAllTemplates,
  getAvailableCategories,
  loadQuestionTemplate,
} from '../utils/questionLoader.ts';
import type { QACategory } from '../../src/types/qa.ts';

export const questionsRouter = Router();

/**
 * Valid Q&A categories
 */
const VALID_CATEGORIES: QACategory[] = ['game_mechanic', 'economy', 'growth'];

/**
 * Check if a category is valid
 */
function isValidCategory(category: string): category is QACategory {
  return VALID_CATEGORIES.includes(category as QACategory);
}

/**
 * GET /api/questions - Get all questions
 *
 * Response: ApiResponse<Question[]>
 * - 200: List of all questions
 * - 500: Server error
 */
questionsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = await loadAllTemplates();
    // Flatten all questions from all templates
    const questions = templates.flatMap((t) => t.questions);
    sendSuccess(res, questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    sendError(res, 500, 'Failed to get questions');
  }
});

/**
 * GET /api/questions/categories - Get all categories
 *
 * Response: ApiResponse<CategoryDefinition[]>
 * - 200: List of all categories
 * - 500: Server error
 */
questionsRouter.get('/categories', (_req: Request, res: Response): void => {
  try {
    const categories = getAvailableCategories();
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * GET /api/questions/:categoryId - Get questions by category
 *
 * Path Parameters:
 * - categoryId: Category ID (game_mechanic, economy, growth)
 *
 * Response: ApiResponse<Question[]>
 * - 200: List of questions for the category
 * - 200: Empty array for invalid category
 * - 500: Server error
 */
questionsRouter.get('/:categoryId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    // Return empty array for invalid categories
    if (!isValidCategory(categoryId)) {
      sendSuccess(res, []);
      return;
    }

    const template = await loadQuestionTemplate(categoryId);
    sendSuccess(res, template.questions);
  } catch (error) {
    console.error('Error getting questions by category:', error);
    sendError(res, 500, 'Failed to get questions by category');
  }
});
