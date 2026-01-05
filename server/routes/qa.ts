/**
 * Q&A API Routes
 * Handles all Q&A-related endpoints for the form-based Q&A system
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
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
 * - 400: Missing required fields
 * - 404: Task not found
 * - 500: Server error
 */
export async function saveTaskQA(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const { category, answers, currentStep, isComplete } = req.body;

    // Validate required fields
    if (!category) {
      sendError(res, 400, 'Category is required');
      return;
    }

    if (!isValidCategory(category)) {
      sendError(res, 400, `Invalid category: ${category}`);
      return;
    }

    // Check if task exists
    const taskResult = await getTaskById(taskId);
    if (!taskResult) {
      sendError(res, 404, 'Task not found');
      return;
    }

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

    sendSuccess(res, {
      sessionId: savedSession.id,
      session: savedSession,
    });
  } catch (error) {
    console.error('Error saving Q&A answers:', error);
    sendError(res, 500, 'Failed to save Q&A answers');
  }
}

/**
 * GET /api/tasks/:taskId/qa - Get Q&A session for a task
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Response: ApiResponse<QASession>
 * - 200: Q&A session retrieved
 * - 404: Task or session not found
 * - 500: Server error
 */
export async function getTaskQA(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const taskResult = await getTaskById(taskId);
    if (!taskResult) {
      sendError(res, 404, 'Task not found');
      return;
    }

    // Get Q&A session
    const session = await getQASessionByTaskId(taskId);
    if (!session) {
      sendError(res, 404, 'Q&A session not found for this task');
      return;
    }

    sendSuccess(res, session);
  } catch (error) {
    console.error('Error getting Q&A session:', error);
    sendError(res, 500, 'Failed to get Q&A session');
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

    // Generate mock design document based on Q&A answers
    const qaContext = session?.answers
      .map((a) => `Q: ${a.questionId}\nA: ${a.answer}`)
      .join('\n\n') || 'No Q&A context available';

    const designDocument = generateMockDesignDocument(task.title, task.featureList, qaContext);

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
      message: 'Design document generated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error generating design:', error);
    sendError(res, 500, 'Failed to generate design document');
  }
}

/**
 * Generate mock design document (placeholder for AI integration)
 */
function generateMockDesignDocument(
  title: string,
  featureList: string,
  qaContext: string
): string {
  return `# Design Document: ${title}

## Overview
This design document outlines the implementation plan for the feature based on the collected requirements.

## Feature Description
${featureList}

## Design Intent (from Q&A)
${qaContext}

## Technical Approach
- Architecture: Component-based design
- Data Flow: Unidirectional state management
- Integration Points: API endpoints and state stores

## Implementation Notes
- Follow existing project patterns
- Maintain type safety
- Include comprehensive tests

---
*This is an auto-generated design document. Review and refine as needed.*

Generated at: ${new Date().toISOString()}
`;
}
