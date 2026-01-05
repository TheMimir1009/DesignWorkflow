/**
 * Q&A API Routes Tests
 * TDD tests for Q&A API endpoints
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/index';
import type { Express } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Q&A API Routes', () => {
  let app: Express;
  const testProjectId = 'test-project-qa';
  const testTaskId = 'test-task-qa';

  beforeAll(async () => {
    app = createApp();

    // Create test project directory
    const projectDir = path.join(process.cwd(), 'workspace/projects', testProjectId);
    await fs.mkdir(projectDir, { recursive: true });

    // Create project.json
    await fs.writeFile(
      path.join(projectDir, 'project.json'),
      JSON.stringify({
        id: testProjectId,
        name: 'Test QA Project',
        description: 'Test project for Q&A API',
        techStack: ['React', 'Node.js'],
        categories: [],
        defaultReferences: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );

    // Create tasks directory and tasks.json with a test task
    const tasksDir = path.join(projectDir, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });
    await fs.writeFile(
      path.join(tasksDir, 'tasks.json'),
      JSON.stringify([
        {
          id: testTaskId,
          projectId: testProjectId,
          title: 'Test Task for QA',
          status: 'featurelist',
          featureList: 'Test feature list',
          designDocument: null,
          prd: null,
          prototype: null,
          references: [],
          qaAnswers: [],
          revisions: [],
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    );
  });

  afterAll(async () => {
    // Cleanup test project directory
    const projectDir = path.join(process.cwd(), 'workspace/projects', testProjectId);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('GET /api/questions/:category', () => {
    it('should return questions for game_mechanic category', async () => {
      const response = await request(app).get('/api/questions/game_mechanic');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.category).toBe('game_mechanic');
      expect(response.body.data.questions).toBeInstanceOf(Array);
      expect(response.body.data.questions.length).toBeGreaterThan(0);
    });

    it('should return questions for economy category', async () => {
      const response = await request(app).get('/api/questions/economy');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('economy');
    });

    it('should return questions for growth category', async () => {
      const response = await request(app).get('/api/questions/growth');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('growth');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).get('/api/questions/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid category');
    });
  });

  describe('GET /api/questions', () => {
    it('should return all available categories', async () => {
      const response = await request(app).get('/api/questions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);

      const ids = response.body.data.map((c: { id: string }) => c.id);
      expect(ids).toContain('game_mechanic');
      expect(ids).toContain('economy');
      expect(ids).toContain('growth');
    });
  });

  describe('POST /api/tasks/:taskId/qa', () => {
    it('should save Q&A answers for a task', async () => {
      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/qa`)
        .send({
          category: 'game_mechanic',
          answers: [
            {
              questionId: 'gm-q-1',
              answer: 'The core gameplay loop involves exploring dungeons',
              answeredAt: new Date().toISOString(),
            },
          ],
          currentStep: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.sessionId).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .post('/api/tasks/non-existent-task/qa')
        .send({
          category: 'game_mechanic',
          answers: [],
          currentStep: 0,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/qa`)
        .send({
          answers: [],
          currentStep: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:taskId/qa', () => {
    it('should retrieve Q&A session for a task', async () => {
      // First save some answers
      await request(app)
        .post(`/api/tasks/${testTaskId}/qa`)
        .send({
          category: 'economy',
          answers: [
            {
              questionId: 'ec-q-1',
              answer: 'Gold and gems are the primary currencies',
              answeredAt: new Date().toISOString(),
            },
          ],
          currentStep: 1,
        });

      const response = await request(app).get(`/api/tasks/${testTaskId}/qa`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 404 for task without Q&A session', async () => {
      const response = await request(app).get('/api/tasks/non-existent-task/qa');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks/:taskId/generate-design', () => {
    it('should trigger design generation after Q&A completion', async () => {
      // Save complete Q&A answers first
      await request(app)
        .post(`/api/tasks/${testTaskId}/qa`)
        .send({
          category: 'game_mechanic',
          answers: [
            { questionId: 'gm-q-1', answer: 'Core loop is explore, fight, loot', answeredAt: new Date().toISOString() },
            { questionId: 'gm-q-2', answer: 'Move, attack, dodge, interact', answeredAt: new Date().toISOString() },
            { questionId: 'gm-q-3', answer: 'Win by defeating boss, lose by dying', answeredAt: new Date().toISOString() },
          ],
          currentStep: 3,
          isComplete: true,
        });

      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/generate-design`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.message).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .post('/api/tasks/non-existent-task/generate-design')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
