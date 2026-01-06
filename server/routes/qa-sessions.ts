/**
 * QA Sessions API Routes
 * Handles all Q&A session-related endpoints
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  createSession,
  getSessionById,
  updateSession,
  completeSession,
  getSessionsByTask,
} from '../utils/qaStorage.ts';

export const qaSessionsRouter = Router();

/**
 * POST /api/qa-sessions - Create a new QA session
 *
 * Request Body:
 * - taskId: string (required)
 * - projectId: string (required)
 *
 * Response: ApiResponse<QASession>
 * - 201: Session created successfully
 * - 400: Missing required fields
 * - 500: Server error
 */
qaSessionsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, projectId } = req.body;

    // Validate required fields
    if (!taskId) {
      sendError(res, 400, 'taskId is required');
      return;
    }

    if (!projectId) {
      sendError(res, 400, 'projectId is required');
      return;
    }

    const session = await createSession(taskId, projectId);
    res.status(201).json({
      success: true,
      data: session,
      error: null,
    });
  } catch (error) {
    console.error('Error creating QA session:', error);
    sendError(res, 500, 'Failed to create QA session');
  }
});

/**
 * GET /api/qa-sessions/:id - Get a QA session by ID
 *
 * Path Parameters:
 * - id: Session UUID
 *
 * Response: ApiResponse<QASession>
 * - 200: Session found
 * - 404: Session not found
 * - 500: Server error
 */
qaSessionsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await getSessionById(id);

    if (!session) {
      sendError(res, 404, 'Session not found');
      return;
    }

    sendSuccess(res, session);
  } catch (error) {
    console.error('Error getting QA session:', error);
    sendError(res, 500, 'Failed to get QA session');
  }
});

/**
 * PUT /api/qa-sessions/:id - Update a QA session
 *
 * Path Parameters:
 * - id: Session UUID
 *
 * Request Body:
 * - answers?: Record<string, string>
 * - completedCategories?: string[]
 *
 * Response: ApiResponse<QASession>
 * - 200: Session updated successfully
 * - 404: Session not found
 * - 500: Server error
 */
qaSessionsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSession = await updateSession(id, updates);

    if (!updatedSession) {
      sendError(res, 404, 'Session not found');
      return;
    }

    sendSuccess(res, updatedSession);
  } catch (error) {
    console.error('Error updating QA session:', error);
    sendError(res, 500, 'Failed to update QA session');
  }
});

/**
 * POST /api/qa-sessions/:id/complete - Complete a QA session
 *
 * Path Parameters:
 * - id: Session UUID
 *
 * Response: ApiResponse<QASession>
 * - 200: Session completed successfully
 * - 404: Session not found
 * - 500: Server error
 */
qaSessionsRouter.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const completedSession = await completeSession(id);

    if (!completedSession) {
      sendError(res, 404, 'Session not found');
      return;
    }

    sendSuccess(res, completedSession);
  } catch (error) {
    console.error('Error completing QA session:', error);
    sendError(res, 500, 'Failed to complete QA session');
  }
});

/**
 * GET /api/qa-sessions/task/:taskId - Get all sessions for a task
 *
 * Path Parameters:
 * - taskId: Task UUID
 *
 * Response: ApiResponse<QASession[]>
 * - 200: List of sessions for the task
 * - 500: Server error
 */
qaSessionsRouter.get('/task/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const sessions = await getSessionsByTask(taskId);
    sendSuccess(res, sessions);
  } catch (error) {
    console.error('Error getting sessions by task:', error);
    sendError(res, 500, 'Failed to get sessions by task');
  }
});
