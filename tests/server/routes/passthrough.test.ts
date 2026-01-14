/**
 * Passthrough Routes Tests
 * SPEC-PASSTHROUGH-001: Tests for passthrough pipeline API endpoints
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import {
  passthroughRouter,
  registerPassthroughRoutes,
} from '../../../server/routes/passthrough.ts';
import * as taskStorage from '../../../server/utils/taskStorage.ts';
import * as passthroughStorage from '../../../server/utils/passthroughStorage.ts';
import type {
  PassthroughPipeline,
  PipelineStatus,
  PipelineStage,
} from '../../../src/types/passthrough.ts';

// Create test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/tasks', passthroughRouter);
  return app;
};

// Mock pipeline data
const createMockPipeline = (
  taskId: string,
  status: PipelineStatus = 'idle'
): PassthroughPipeline => ({
  id: `pipeline-${taskId}`,
  taskId,
  status,
  currentStage: null,
  stages: [],
  startedAt: new Date().toISOString(),
  progress: 0,
  llmSettings: {
    provider: 'claude-code',
    model: 'claude-sonnet-4.5',
    routingMode: 'single',
  },
});

describe('Passthrough Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/tasks/:taskId/passthrough/start - Start Pipeline', () => {
    it('should return 404 when task not found', async () => {
      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/nonexistent-task/passthrough/start')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('TASK_NOT_FOUND');
    });

    it('should return 400 when Q&A is not completed', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'qa',
        qaSession: { isCompleted: false },
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/start')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('QA_NOT_COMPLETED');
      expect(response.body.error).toContain('Q&A');
    });

    it('should return 409 when pipeline is already running', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'qa',
        qaSession: { isCompleted: true },
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      const runningPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        runningPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/start')
        .send({})
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PIPELINE_ALREADY_RUNNING');
    });

    it('should start a new pipeline when Q&A is completed', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'qa',
        qaSession: { isCompleted: true },
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const newPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'createPipeline').mockResolvedValue(
        newPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/start')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('running');
    });

    it('should resume from specified stage', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-1',
        status: 'qa',
        qaSession: { isCompleted: true },
      };

      vi.spyOn(taskStorage, 'getTaskById').mockResolvedValue({
        task: mockTask as any,
        projectId: 'project-1',
      });

      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const newPipeline = createMockPipeline('task-123', 'running');
      newPipeline.currentStage = 'prd';
      vi.spyOn(passthroughStorage, 'createPipeline').mockResolvedValue(
        newPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/start')
        .send({ resumeFromStage: 'prd' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(passthroughStorage.createPipeline).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeFromStage: 'prd',
        })
      );
    });
  });

  describe('POST /api/tasks/:taskId/passthrough/pause - Pause Pipeline', () => {
    it('should return 404 when pipeline not found', async () => {
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/pause')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PIPELINE_NOT_FOUND');
    });

    it('should return 405 when pipeline is not running', async () => {
      const pausedPipeline = createMockPipeline('task-123', 'paused');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        pausedPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/pause')
        .send({})
        .expect(405);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('OPERATION_NOT_ALLOWED');
    });

    it('should pause a running pipeline', async () => {
      const runningPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        runningPipeline
      );

      const pausedPipeline = createMockPipeline('task-123', 'paused');
      vi.spyOn(passthroughStorage, 'updatePipelineStatus').mockResolvedValue(
        pausedPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/pause')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('paused');
    });
  });

  describe('POST /api/tasks/:taskId/passthrough/resume - Resume Pipeline', () => {
    it('should return 404 when pipeline not found', async () => {
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/resume')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PIPELINE_NOT_FOUND');
    });

    it('should return 405 when pipeline is not paused', async () => {
      const runningPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        runningPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/resume')
        .send({})
        .expect(405);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('OPERATION_NOT_ALLOWED');
    });

    it('should resume a paused pipeline', async () => {
      const pausedPipeline = createMockPipeline('task-123', 'paused');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        pausedPipeline
      );

      const runningPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'updatePipelineStatus').mockResolvedValue(
        runningPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/resume')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('running');
    });
  });

  describe('POST /api/tasks/:taskId/passthrough/cancel - Cancel Pipeline', () => {
    it('should return 404 when pipeline not found', async () => {
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/cancel')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PIPELINE_NOT_FOUND');
    });

    it('should cancel a running pipeline', async () => {
      const runningPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        runningPipeline
      );

      const cancelledPipeline = createMockPipeline('task-123', 'cancelled');
      vi.spyOn(passthroughStorage, 'updatePipelineStatus').mockResolvedValue(
        cancelledPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/cancel')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('cancelled');
    });

    it('should cancel a paused pipeline', async () => {
      const pausedPipeline = createMockPipeline('task-123', 'paused');
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        pausedPipeline
      );

      const cancelledPipeline = createMockPipeline('task-123', 'cancelled');
      vi.spyOn(passthroughStorage, 'updatePipelineStatus').mockResolvedValue(
        cancelledPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/cancel')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('cancelled');
    });
  });

  describe('GET /api/tasks/:taskId/passthrough/status - Get Pipeline Status', () => {
    it('should return 404 when pipeline not found', async () => {
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .get('/api/tasks/task-123/passthrough/status')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PIPELINE_NOT_FOUND');
    });

    it('should return pipeline status when found', async () => {
      const pipeline = createMockPipeline('task-123', 'running');
      pipeline.currentStage = 'prd';
      pipeline.progress = 33;
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        pipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .get('/api/tasks/task-123/passthrough/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('running');
      expect(response.body.data.pipeline.currentStage).toBe('prd');
      expect(response.body.data.pipeline.progress).toBe(33);
    });
  });

  describe('POST /api/tasks/:taskId/passthrough/retry - Retry Failed Stage', () => {
    it('should return 400 when stage is missing', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/retry')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should return 400 when stage is invalid', async () => {
      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/retry')
        .send({ stage: 'invalid_stage' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_PIPELINE_STAGE');
    });

    it('should return 404 when pipeline not found', async () => {
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(null);

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/retry')
        .send({ stage: 'prd' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('PIPELINE_NOT_FOUND');
    });

    it('should retry the specified stage', async () => {
      const failedPipeline = createMockPipeline('task-123', 'failed');
      failedPipeline.stages = [
        {
          stage: 'prd',
          status: 'failed',
          error: {
            code: 'GENERATION_ERROR',
            message: 'LLM generation failed',
            retryCount: 1,
          },
        },
      ];
      vi.spyOn(passthroughStorage, 'getPipelineByTaskId').mockResolvedValue(
        failedPipeline
      );

      const runningPipeline = createMockPipeline('task-123', 'running');
      vi.spyOn(passthroughStorage, 'updatePipelineStatus').mockResolvedValue(
        runningPipeline
      );

      const app = createTestApp();
      const response = await request(app)
        .post('/api/tasks/task-123/passthrough/retry')
        .send({ stage: 'prd' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pipeline.status).toBe('running');
    });
  });
});
