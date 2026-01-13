/**
 * Tasks Routes Error Handling Tests
 * SPEC-DEBUG-005: Tests for standardized task endpoint error handling
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { type Express, type Request, type Response } from 'express';
import { tasksRouter } from '../../../server/routes/tasks.ts';
import * as taskStorage from '../../../server/utils/taskStorage.ts';
import * as projectStorage from '../../../server/utils/projectStorage.ts';
import * as llmSettingsStorage from '../../../server/utils/llmSettingsStorage.ts';
import * as llmProvider from '../../../server/utils/llmProvider.ts';

// Create test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/tasks', tasksRouter);
  return app;
};

describe('Tasks Routes Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/tasks/:id/trigger-ai - Trigger AI Generation', () => {
    it('should return 400 with LLM_CONFIG_MISSING error when LLM provider fails', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'design',
        designDocument: 'Test design document content',
      };

      // Mock task exists with design document
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      // Mock LLM settings that will cause failure
      vi.spyOn(llmSettingsStorage, 'getLLMSettingsOrDefault').mockResolvedValue({
        id: 'settings-1',
        projectId: 'project-1',
        taskStageConfig: {
          defaultModel: {
            provider: 'invalid-provider',
            modelId: 'invalid-model',
          },
          prd: {
            provider: 'invalid-provider',
            modelId: 'invalid-model',
          },
          prototype: {
            provider: 'invalid-provider',
            modelId: 'invalid-model',
          },
        },
      } as any);

      // Mock createLLMProvider to throw error
      vi.spyOn(llmProvider, 'createLLMProvider').mockImplementation(() => {
        throw new Error('Invalid LLM provider configuration');
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/trigger-ai')
        .send({
          targetStatus: 'prd',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('LLM_CONFIG_MISSING');
      expect(response.body.error).toContain('LLM provider');
      expect(response.body.error).toContain('configuration');
      expect(response.body.details?.action).toBe('configure_llm');
      expect(response.body.details?.guidance).toBeDefined();
    });

    it('should return 400 with PREREQUISITE_MISSING when Design Document is missing for PRD generation', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'design',
        designDocument: null, // Missing design document
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/trigger-ai')
        .send({
          targetStatus: 'prd',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PREREQUISITE_MISSING');
      expect(response.body.error).toContain('Design Document');
      expect(response.body.error).toContain('required');
      expect(response.body.details?.field).toBe('designDocument');
      expect(response.body.details?.action).toBe('complete_design');
      expect(response.body.details?.guidance).toBeDefined();
    });

    it('should return 400 with PREREQUISITE_MISSING when PRD is missing for Prototype generation', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'prd',
        designDocument: 'Test design document',
        prd: null, // Missing PRD
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/trigger-ai')
        .send({
          targetStatus: 'prototype',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PREREQUISITE_MISSING');
      expect(response.body.error).toContain('PRD');
      expect(response.body.error).toContain('required');
      expect(response.body.details?.field).toBe('prd');
      expect(response.body.details?.action).toBe('generate_prd');
      expect(response.body.details?.guidance).toBeDefined();
    });

    it('should return 404 when task not found', async () => {
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/nonexistent-task/trigger-ai')
        .send({
          targetStatus: 'prd',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('TASK_NOT_FOUND');
    });

    it('should return 400 when targetStatus is missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/trigger-ai')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/targetstatus/i);
      expect(response.body.error).toMatch(/required/i);
    });

    it('should return 400 when targetStatus is invalid', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/trigger-ai')
        .send({
          targetStatus: 'invalid_status',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/invalid status/i);
      expect(response.body.errorCode).toBe('INVALID_STATUS');
    });
  });

  describe('PUT /api/tasks/:id/status - Update Task Status', () => {
    it('should return 400 when status is missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .put('/api/tasks/task-123/status')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Status is required');
    });

    it('should return 400 when status is invalid', async () => {
      const app = createTestApp();
      const response = await request(app)
        .put('/api/tasks/task-123/status')
        .send({
          status: 'invalid_status',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
      expect(response.body.errorCode).toBe('INVALID_STATUS');
      expect(response.body.details?.guidance).toBeDefined();
    });

    it('should return 404 when task not found', async () => {
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .put('/api/tasks/nonexistent-task/status')
        .send({
          status: 'prd',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('TASK_NOT_FOUND');
    });
  });

  describe('DELETE /api/tasks/:id - Delete Task', () => {
    it('should return 404 when task not found', async () => {
      vi.spyOn(taskStorage, 'deleteTask').mockResolvedValue(false);

      const app = createTestApp();
      const response = await request(app)
        .delete('/api/tasks/nonexistent-task')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('TASK_NOT_FOUND');
    });
  });
});
