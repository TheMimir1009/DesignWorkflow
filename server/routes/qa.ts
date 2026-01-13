/**
 * Q&A API Routes
 * Handles all Q&A-related endpoints for the form-based Q&A system
 * SPEC-DEBUG-005: Standardized error handling and response formats
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  sendApiSuccess,
  sendApiSuccessWithNull,
  sendApiError,
  sendApiErrorFromBuilder,
} from '../utils/apiResponse.ts';
import {
  buildTaskNotFoundError,
  buildMissingRequiredFieldError,
  buildInvalidCategoryError,
} from '../utils/errorBuilder.ts';
import {
  loadQuestionTemplate,
  getAvailableCategories,
} from '../utils/questionLoader.ts';
import {
  getQASessionByTaskId,
  saveQASession,
  createQASession,
} from '../utils/qaStorage.ts';
import { getTaskById, updateTask } from '../utils/taskStorage.ts';
import { callClaudeCode, ClaudeCodeTimeoutError } from '../utils/claudeCodeRunner.ts';
import { buildDesignDocumentPrompt, type QAResponse } from '../utils/promptBuilder.ts';
import type { QACategory, QASessionAnswer } from '../../src/types/qa.ts';

export const qaRouter = Router();

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
 * GET /api/questions - Get all available categories
 *
 * Response: ApiResponse<CategoryDefinition[]>
 * - 200: List of available categories
 * - 500: Server error
 */
qaRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = getAvailableCategories();
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * GET /api/questions/categories - Get all available categories
 * (Alias for backward compatibility)
 *
 * Response: ApiResponse<CategoryDefinition[]>
 * - 200: List of available categories
 * - 500: Server error
 */
qaRouter.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = getAvailableCategories();
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    sendError(res, 500, 'Failed to get categories');
  }
});

/**
 * GET /api/questions/:category - Get questions for a specific category
 *
 * Path Parameters:
 * - category: QACategory (game_mechanic, economy, growth)
 *
 * Response: ApiResponse<QuestionTemplate>
 * - 200: Question template for the category
 * - 400: Invalid category
 * - 500: Server error
 */
qaRouter.get('/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    if (!isValidCategory(category)) {
      sendError(res, 400, `Invalid category: ${category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
      return;
    }

    const template = await loadQuestionTemplate(category);
    sendSuccess(res, template);
  } catch (error) {
    console.error('Error getting questions:', error);
    sendError(res, 500, 'Failed to get questions');
  }
});

/**
 * POST /api/tasks/:taskId/qa - Save Q&A answers for a task
 * SPEC-DEBUG-005: REQ-ERR-005 - Auto-creates session if not exists
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Request Body:
 * - category: QACategory (required)
 * - answers: QASessionAnswer[] (required)
 * - currentStep: number (required)
 * - isComplete?: boolean
 *
 * Response: ApiResponse<{ sessionId: string; session: QASession }>
 * - 200: Q&A answers saved successfully
 * - 400: Missing required fields or invalid category
 * - 404: Task not found
 * - 500: Server error
 */
export async function saveTaskQA(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const { category, answers, currentStep, isComplete } = req.body;

    // Validate required fields
    if (!category) {
      sendApiErrorFromBuilder(res, buildMissingRequiredFieldError('category'), 400);
      return;
    }

    if (!isValidCategory(category)) {
      sendApiErrorFromBuilder(res, buildInvalidCategoryError(category), 400);
      return;
    }

    // Check if task exists
    const taskResult = await getTaskById(taskId);
    if (!taskResult) {
      sendApiErrorFromBuilder(res, buildTaskNotFoundError(taskId), 404);
      return;
    }

    // SPEC-DEBUG-005: REQ-ERR-005 - Auto-create session if not exists
    // Get or create Q&A session
    let session = await getQASessionByTaskId(taskId);

    if (!session) {
      session = await createQASession(taskId, category);
    }

    // Update session with new answers
    session.answers = answers || [];
    session.currentStep = currentStep ?? session.currentStep;
    session.category = category;

    if (isComplete) {
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
    } else {
      session.status = 'in_progress';
    }

    // Save session
    const savedSession = await saveQASession(session);

    // Update task with Q&A answers
    const qaAnswers = (answers || []).map((a: QASessionAnswer) => ({
      questionId: a.questionId,
      category: category,
      question: '', // Will be filled by the service
      answer: a.answer,
      answeredAt: a.answeredAt,
    }));

    await updateTask(taskId, { qaAnswers });

    sendApiSuccess(res, {
      sessionId: savedSession.id,
      session: savedSession,
    });
  } catch (error) {
    console.error('Error saving Q&A answers:', error);
    sendApiError(res, 500, 'Failed to save Q&A answers');
  }
}

/**
 * GET /api/tasks/:taskId/qa - Get Q&A session for a task
 * SPEC-DEBUG-005: REQ-ERR-004 - Returns 200 with null when session not found
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Response: ApiResponse<QASession | null>
 * - 200: Q&A session retrieved (or null if not exists)
 * - 404: Task not found
 * - 500: Server error
 */
export async function getTaskQA(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const taskResult = await getTaskById(taskId);
    if (!taskResult) {
      sendApiErrorFromBuilder(res, buildTaskNotFoundError(taskId), 404);
      return;
    }

    // Get Q&A session
    const session = await getQASessionByTaskId(taskId);
    if (!session) {
      // SPEC-DEBUG-005: REQ-ERR-004 - Return 200 OK with null for optional resources
      sendApiSuccessWithNull(res);
      return;
    }

    sendApiSuccess(res, session);
  } catch (error) {
    console.error('Error getting Q&A session:', error);
    sendApiError(res, 500, 'Failed to get Q&A session');
  }
}

/**
 * POST /api/tasks/:taskId/generate-design - Trigger design generation after Q&A
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Response: ApiResponse<{ message: string; task: Task }>
 * - 200: Design generation triggered
 * - 404: Task not found
 * - 500: Server error
 */
export async function generateDesign(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const taskResult = await getTaskById(taskId);
    if (!taskResult) {
      sendError(res, 404, 'Task not found');
      return;
    }

    const task = taskResult.task;

    // Get Q&A session for context
    const session = await getQASessionByTaskId(taskId);

    // Convert session answers to QAResponse format for prompt builder
    const qaResponses: QAResponse[] = session?.answers.map((a) => ({
      question: a.questionId,
      answer: a.answer,
    })) || [];

    // Build the AI prompt with task context
    const basePrompt = buildDesignDocumentPrompt(qaResponses);
    const fullPrompt = `
## Task Information
- Title: ${task.title}
- Feature List: ${task.featureList || 'Not specified'}

${basePrompt}

## Additional Instructions
- Write the design document in Korean (한국어)
- Focus on practical implementation details
- Include specific technical recommendations based on the Q&A responses
`;

    // Generate design document using Claude Code AI
    console.log(`[AI Generation] Starting Design Document generation for task: ${taskId}`);

    const result = await callClaudeCode(
      fullPrompt,
      process.cwd(),
      { timeout: 600000, allowedTools: ['Read', 'Grep'] }  // 10분 타임아웃
    );

    // Extract the generated content
    let designDocument: string;
    if (result.output && typeof result.output === 'object' && 'result' in result.output) {
      designDocument = (result.output as { result: string }).result;
    } else if (result.rawOutput) {
      // Try to parse JSON and extract result
      try {
        const parsed = JSON.parse(result.rawOutput);
        designDocument = parsed.result || result.rawOutput;
      } catch {
        designDocument = result.rawOutput;
      }
    } else {
      throw new Error('No content generated from Claude Code');
    }

    console.log(`[AI Generation] Design Document generated successfully for task: ${taskId}`);

    // Update task with design document and status
    const updatedTask = await updateTask(taskId, {
      designDocument,
      status: 'design',
    });

    // Update session status to completed if exists
    if (session && session.status !== 'completed') {
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      await saveQASession(session);
    }

    sendSuccess(res, {
      message: 'Design document generated successfully with AI',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error generating design:', error);

    // Provide more specific error messages
    if (error instanceof ClaudeCodeTimeoutError) {
      sendError(res, 504, 'AI generation timed out. Please try again.');
    } else {
      sendError(res, 500, `Failed to generate design document: ${(error as Error).message}`);
    }
  }
}

// Mock function removed - now using Claude Code AI for design document generation
