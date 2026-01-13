/**
 * Q&A Routes Error Handling Tests
 * SPEC-DEBUG-005: Tests for standardized Q&A endpoint error handling
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { type Express, type Request, type Response } from 'express';
import { getTaskQA, saveTaskQA } from '../../../server/routes/qa.ts';
import * as taskStorage from '../../../server/utils/taskStorage.ts';
import * as qaStorage from '../../../server/utils/qaStorage.ts';

// Create test app with direct route registration
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  // Register routes directly as they are in the actual server
  app.post('/api/tasks/:taskId/qa', async (req: Request, res: Response) => {
    await saveTaskQA(req, res);
  });
  app.get('/api/tasks/:taskId/qa', async (req: Request, res: Response) => {
    await getTaskQA(req, res);
  });

  return app;
};

describe('Q&A Routes Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/tasks/:taskId/qa - Get Q&A Session', () => {
    it('should return 200 OK with null data when session not found', async () => {
      // Mock task exists but session does not
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: {
          id: 'task-123',
          title: 'Test Task',
          projectId: 'project-1',
        } as any,
        projectId: 'project-1',
      });

      vi.spyOn(qaStorage, 'getQASessionByTaskId').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .get('/api/tasks/task-123/qa')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: null,
      });
    });

    it('should return 200 OK with session data when session exists', async () => {
      const mockSession = {
        id: 'session-1',
        taskId: 'task-123',
        category: 'game_mechanic',
        answers: [],
        currentStep: 0,
        status: 'in_progress',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: {
          id: 'task-123',
          title: 'Test Task',
          projectId: 'project-1',
        } as any,
        projectId: 'project-1',
      });

      vi.spyOn(qaStorage, 'getQASessionByTaskId').mockResolvedValue(mockSession);

      const app = createTestApp();
      const response = await request(app)
        .get('/api/tasks/task-123/qa')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSession);
    });

    it('should return 404 when task not found', async () => {
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .get('/api/tasks/nonexistent-task/qa')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Task not found');
      expect(response.body.errorCode).toBe('TASK_NOT_FOUND');
      expect(response.body.details?.field).toBe('taskId');
    });

    it('should handle server errors gracefully', async () => {
      vi.spyOn(taskStorage, 'getTaskById').mockRejectedValue(
        new Error('Database connection failed')
      );

      const app = createTestApp();
      const response = await request(app)
        .get('/api/tasks/task-123/qa')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/tasks/:taskId/qa - Save Q&A Answers', () => {
    it('should create session automatically if not exists', async () => {
      const newSessionData = {
        category: 'game_mechanic',
        answers: [
          {
            questionId: 'q1',
            answer: 'Test answer',
            answeredAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        currentStep: 1,
      };

      const createdSession = {
        id: 'session-new',
        taskId: 'task-123',
        category: 'game_mechanic',
        answers: newSessionData.answers,
        currentStep: 1,
        status: 'in_progress',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: {
          id: 'task-123',
          title: 'Test Task',
          projectId: 'project-1',
        } as any,
        projectId: 'project-1',
      });

      // Session doesn't exist initially
      vi.spyOn(qaStorage, 'getQASessionByTaskId').mockResolvedValue(null);

      // Create new session
      vi.spyOn(qaStorage, 'createQASession').mockResolvedValue(createdSession);

      // Save the session
      vi.spyOn(qaStorage, 'saveQASession').mockResolvedValue(createdSession);

      // Update task with Q&A answers
      vi.spyOn(taskStorage, 'updateTask').mockResolvedValue({
        id: 'task-123',
        qaAnswers: newSessionData.answers.map((a) => ({
          ...a,
          category: 'game_mechanic',
          question: '',
        })),
      } as any);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/qa')
        .send(newSessionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe('session-new');
      expect(response.body.data.session).toEqual(createdSession);
    });

    it('should return 400 when category is missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/qa')
        .send({
          answers: [],
          currentStep: 1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category is required');
      expect(response.body.errorCode).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should return 400 when category is invalid', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/qa')
        .send({
          category: 'invalid_category',
          answers: [],
          currentStep: 1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid category');
      expect(response.body.errorCode).toBe('INVALID_CATEGORY');
      expect(response.body.details?.guidance).toBeDefined();
    });

    it('should return 404 when task not found', async () => {
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/nonexistent-task/qa')
        .send({
          category: 'game_mechanic',
          answers: [],
          currentStep: 0,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('TASK_NOT_FOUND');
    });

    it('should mark session as completed when isComplete is true', async () => {
      const existingSession = {
        id: 'session-1',
        taskId: 'task-123',
        category: 'game_mechanic',
        answers: [],
        currentStep: 0,
        status: 'in_progress',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const completedSession = {
        ...existingSession,
        status: 'completed',
        completedAt: '2024-01-01T01:00:00.000Z',
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: {
          id: 'task-123',
          title: 'Test Task',
          projectId: 'project-1',
        } as any,
        projectId: 'project-1',
      });

      vi.spyOn(qaStorage, 'getQASessionByTaskId').mockResolvedValue(existingSession);
      vi.spyOn(qaStorage, 'saveQASession').mockResolvedValue(completedSession);
      vi.spyOn(taskStorage, 'updateTask').mockResolvedValue({} as any);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/qa')
        .send({
          category: 'game_mechanic',
          answers: [],
          currentStep: 5,
          isComplete: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Verify the saved session would have status completed
      const saveCall = vi.mocked(qaStorage.saveQASession).mock.calls[0][0];
      expect(saveCall.status).toBe('completed');
    });
  });
});
