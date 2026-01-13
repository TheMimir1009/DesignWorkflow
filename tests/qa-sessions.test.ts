/**
 * QA Sessions API Tests
 * Integration tests for Q&A session endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../server/index.ts';
import fs from 'fs/promises';
import path from 'path';

describe('QA Sessions API', () => {
  let app: Express;
  const sessionsPath = path.join(process.cwd(), 'workspace/qa-sessions');
  const templatesPath = path.join(process.cwd(), 'workspace/templates/questions');

  beforeAll(async () => {
    app = createApp();
    // Ensure directories exist
    await fs.mkdir(sessionsPath, { recursive: true });
    await fs.mkdir(templatesPath, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test sessions
    try {
      const files = await fs.readdir(sessionsPath);
      for (const file of files) {
        if (file.startsWith('test-')) {
          await fs.unlink(path.join(sessionsPath, file));
        }
      }
    } catch {
      // Ignore errors during cleanup
    }
  });

  describe('POST /api/qa-sessions', () => {
    it('should create a new QA session', async () => {
      const response = await request(app)
        .post('/api/qa-sessions')
        .send({
          taskId: 'test-task-1',
          projectId: 'test-project-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.taskId).toBe('test-task-1');
      expect(response.body.data.projectId).toBe('test-project-1');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.answers).toEqual({});
      expect(response.body.data.isComplete).toBe(false);
      expect(response.body.data.progress).toBe(0);

      // Clean up created session
      await fs.unlink(path.join(sessionsPath, `${response.body.data.id}.json`)).catch(() => {});
    });

    it('should return 400 when taskId is missing', async () => {
      const response = await request(app)
        .post('/api/qa-sessions')
        .send({
          projectId: 'test-project-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('taskId');
    });

    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .post('/api/qa-sessions')
        .send({
          taskId: 'test-task-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('projectId');
    });
  });

  describe('GET /api/qa-sessions/:id', () => {
    let testSessionId: string;

    beforeEach(async () => {
      // Create a test session
      const createResponse = await request(app)
        .post('/api/qa-sessions')
        .send({
          taskId: 'test-task-get',
          projectId: 'test-project-get',
        });
      testSessionId = createResponse.body.data.id;
    });

    afterAll(async () => {
      // Clean up
      await fs.unlink(path.join(sessionsPath, `${testSessionId}.json`)).catch(() => {});
    });

    it('should get a session by id', async () => {
      const response = await request(app).get(`/api/qa-sessions/${testSessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testSessionId);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app).get('/api/qa-sessions/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/qa-sessions/:id', () => {
    let testSessionId: string;

    beforeEach(async () => {
      // Create a test session
      const createResponse = await request(app)
        .post('/api/qa-sessions')
        .send({
          taskId: 'test-task-update',
          projectId: 'test-project-update',
        });
      testSessionId = createResponse.body.data.id;
    });

    afterAll(async () => {
      // Clean up
      await fs.unlink(path.join(sessionsPath, `${testSessionId}.json`)).catch(() => {});
    });

    it('should update session answers', async () => {
      const response = await request(app)
        .put(`/api/qa-sessions/${testSessionId}`)
        .send({
          answers: { 'q-1': 'Test answer 1', 'q-2': 'Test answer 2' },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answers['q-1']).toBe('Test answer 1');
      expect(response.body.data.answers['q-2']).toBe('Test answer 2');
    });

    it('should update completed categories', async () => {
      const response = await request(app)
        .put(`/api/qa-sessions/${testSessionId}`)
        .send({
          completedCategories: ['game-mechanic', 'economy'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.completedCategories).toContain('game-mechanic');
      expect(response.body.data.completedCategories).toContain('economy');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .put('/api/qa-sessions/non-existent-id')
        .send({
          answers: { 'q-1': 'Test' },
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/qa-sessions/:id/complete', () => {
    let testSessionId: string;

    beforeEach(async () => {
      // Create a test session
      const createResponse = await request(app)
        .post('/api/qa-sessions')
        .send({
          taskId: 'test-task-complete',
          projectId: 'test-project-complete',
        });
      testSessionId = createResponse.body.data.id;
    });

    afterAll(async () => {
      // Clean up
      await fs.unlink(path.join(sessionsPath, `${testSessionId}.json`)).catch(() => {});
    });

    it('should mark session as complete', async () => {
      const response = await request(app).post(`/api/qa-sessions/${testSessionId}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isComplete).toBe(true);
      expect(response.body.data.progress).toBe(100);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app).post('/api/qa-sessions/non-existent-id/complete');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('Questions API', () => {
  let app: Express;
  const templatesPath = path.join(process.cwd(), 'workspace/templates/questions');

  beforeAll(async () => {
    app = createApp();
    // Ensure templates directory exists
    await fs.mkdir(templatesPath, { recursive: true });
  });

  describe('GET /api/questions', () => {
    it('should return all questions', async () => {
      const response = await request(app).get('/api/questions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/questions/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app).get('/api/questions/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/questions/:categoryId', () => {
    it('should return questions for a category', async () => {
<<<<<<< HEAD
      const response = await request(app).get('/api/questions/game-mechanic');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app).get('/api/questions/non-existent-category');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
=======
      // Use snake_case category name as expected by the API
      const response = await request(app).get('/api/questions/game_mechanic');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Response is a QuestionTemplate object, not an array
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 for non-existent category', async () => {
      const response = await request(app).get('/api/questions/non-existent-category');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid category');
>>>>>>> main
    });
  });
});
