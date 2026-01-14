/**
 * TDD Tests for Passthrough Storage
 * RED Phase: Write failing tests first
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import type { PassthroughPipeline, PassthroughStage } from '../../src/types/passthrough';

// Generate unique test directory for this test run
const TEST_PIPELINE_DIR = path.join(tmpdir(), `moai-test-passthrough-${uuidv4()}`);

// Storage module will be loaded dynamically
let storageModule: any;

describe('Passthrough Storage', () => {
  const originalEnv = process.env.MOAI_TEST_PIPELINE_DIR;

  beforeEach(async () => {
    // Set test directory environment variable before module loads
    process.env.MOAI_TEST_PIPELINE_DIR = TEST_PIPELINE_DIR;

    // Clear module cache to force reload with new env var
    vi.resetModules();

    // Dynamically import storage module with test environment
    storageModule = await import('../passthroughStorage.js');

    // Clean up test directory before each test
    if (existsSync(TEST_PIPELINE_DIR)) {
      await rm(TEST_PIPELINE_DIR, { recursive: true, force: true });
    }
  });

  afterEach(async () => {
    // Clean up test directory after each test
    if (existsSync(TEST_PIPELINE_DIR)) {
      await rm(TEST_PIPELINE_DIR, { recursive: true, force: true });
    }

    // Restore original environment
    process.env.MOAI_TEST_PIPELINE_DIR = originalEnv;
  });

  describe('createPipeline', () => {
    it('should create a new pipeline with required fields', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');

      expect(pipeline).toBeDefined();
      expect(pipeline.id).toBeDefined();
      expect(pipeline.taskId).toBe('task-1');
      expect(pipeline.qaSessionId).toBe('qa-session-1');
      expect(pipeline.status).toBe('pending');
      expect(pipeline.currentStage).toBeNull();
      expect(pipeline.stages).toEqual([]);
      expect(pipeline.createdAt).toBeDefined();
      expect(pipeline.updatedAt).toBeDefined();
      expect(pipeline.startedAt).toBeNull();
      expect(pipeline.completedAt).toBeNull();
    });

    it('should create pipeline with initial stages', async () => {
      const stages: PassthroughStage[] = [
        {
          id: 'stage-1',
          name: 'design_doc',
          displayName: 'Design Document',
          status: 'pending',
          startedAt: null,
          completedAt: null,
          error: null,
          progress: 0,
        },
      ];

      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1', stages);

      expect(pipeline.stages).toHaveLength(1);
      expect(pipeline.stages[0].name).toBe('design_doc');
    });
  });

  describe('savePipeline and getPipelineById', () => {
    it('should save and retrieve pipeline by ID', async () => {
      const created = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(created);

      const retrieved = await storageModule.getPipelineById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.taskId).toBe('task-1');
      expect(retrieved?.qaSessionId).toBe('qa-session-1');
    });

    it('should return null for non-existent pipeline', async () => {
      const retrieved = await storageModule.getPipelineById('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should persist pipeline updates', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      // Update pipeline
      pipeline.status = 'running';
      pipeline.startedAt = new Date().toISOString();
      await storageModule.savePipeline(pipeline);

      const retrieved = await storageModule.getPipelineById(pipeline.id);
      expect(retrieved?.status).toBe('running');
      expect(retrieved?.startedAt).toBeDefined();
    });
  });

  describe('getPipelineByTaskId', () => {
    it('should retrieve pipeline by task ID', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      const retrieved = await storageModule.getPipelineByTaskId('task-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(pipeline.id);
    });

    it('should return null for non-existent task', async () => {
      const retrieved = await storageModule.getPipelineByTaskId('non-existent-task');
      expect(retrieved).toBeNull();
    });

    it('should return the most recent pipeline if multiple exist', async () => {
      const pipeline1 = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline1);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const pipeline2 = await storageModule.createPipeline('task-1', 'qa-session-2');
      await storageModule.savePipeline(pipeline2);

      const retrieved = await storageModule.getPipelineByTaskId('task-1');
      expect(retrieved?.qaSessionId).toBe('qa-session-2');
    });
  });

  describe('deletePipeline', () => {
    it('should delete an existing pipeline', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      const deleted = await storageModule.deletePipeline(pipeline.id);
      expect(deleted).toBe(true);

      const retrieved = await storageModule.getPipelineById(pipeline.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent pipeline', async () => {
      const deleted = await storageModule.deletePipeline('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('listPipelines', () => {
    it('should return empty array when no pipelines exist', async () => {
      const pipelines = await storageModule.listPipelines();
      expect(pipelines).toEqual([]);
    });

    it('should list all pipelines', async () => {
      const pipeline1 = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline1);

      const pipeline2 = await storageModule.createPipeline('task-2', 'qa-session-2');
      await storageModule.savePipeline(pipeline2);

      const pipelines = await storageModule.listPipelines();
      expect(pipelines).toHaveLength(2);
    });

    it('should filter pipelines by task ID', async () => {
      const pipeline1 = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline1);

      const pipeline2 = await storageModule.createPipeline('task-2', 'qa-session-2');
      await storageModule.savePipeline(pipeline2);

      const pipelines = await storageModule.listPipelines('task-1');
      expect(pipelines).toHaveLength(1);
      expect(pipelines[0].taskId).toBe('task-1');
    });

    it('should filter pipelines by status', async () => {
      const pipeline1 = await storageModule.createPipeline('task-1', 'qa-session-1');
      pipeline1.status = 'running';
      await storageModule.savePipeline(pipeline1);

      const pipeline2 = await storageModule.createPipeline('task-2', 'qa-session-2');
      await storageModule.savePipeline(pipeline2);

      const pipelines = await storageModule.listPipelines(undefined, 'running');
      expect(pipelines).toHaveLength(1);
      expect(pipelines[0].status).toBe('running');
    });
  });

  describe('updatePipelineStatus', () => {
    it('should update pipeline status', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updatePipelineStatus(pipeline.id, 'running');

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('running');
      expect(updated?.startedAt).toBeDefined();
    });

    it('should set completedAt when status is completed', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updatePipelineStatus(pipeline.id, 'completed');

      expect(updated?.status).toBe('completed');
      expect(updated?.completedAt).toBeDefined();
    });

    it('should return null for non-existent pipeline', async () => {
      const updated = await storageModule.updatePipelineStatus('non-existent-id', 'running');
      expect(updated).toBeNull();
    });

    it('should update currentStage when provided', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updatePipelineStatus(pipeline.id, 'running', 'design_doc');

      expect(updated?.currentStage).toBe('design_doc');
    });

    it('should clear currentStage when status is completed', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      pipeline.currentStage = 'design_doc';
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updatePipelineStatus(pipeline.id, 'completed');

      expect(updated?.currentStage).toBeNull();
    });
  });

  describe('updateStageProgress', () => {
    it('should update stage progress', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: null,
        error: null,
        progress: 50,
      };
      pipeline.stages.push(stage);
      await storageModule.savePipeline(pipeline);

      const originalUpdatedAt = pipeline.updatedAt;
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

      const updated = await storageModule.updateStageProgress(
        pipeline.id,
        'stage-1',
        75,
        'running'
      );

      expect(updated).toBeDefined();
      expect(updated?.stages[0].progress).toBe(75);
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should mark stage as completed when progress is 100', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: null,
        error: null,
        progress: 50,
      };
      pipeline.stages.push(stage);
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updateStageProgress(
        pipeline.id,
        'stage-1',
        100,
        'running'
      );

      expect(updated?.stages[0].status).toBe('completed');
      expect(updated?.stages[0].completedAt).toBeDefined();
    });

    it('should set stage error when status is failed', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: null,
        error: null,
        progress: 50,
      };
      pipeline.stages.push(stage);
      await storageModule.savePipeline(pipeline);

      const error = { message: 'Test error', code: 'TEST_ERROR' };
      const updated = await storageModule.updateStageProgress(
        pipeline.id,
        'stage-1',
        50,
        'failed',
        error
      );

      expect(updated?.stages[0].status).toBe('failed');
      expect(updated?.stages[0].error).toEqual(error);
    });

    it('should return null for non-existent pipeline', async () => {
      const updated = await storageModule.updateStageProgress('non-existent-id', 'stage-1', 50, 'running');
      expect(updated).toBeNull();
    });

    it('should return null for non-existent stage', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updateStageProgress(
        pipeline.id,
        'non-existent-stage',
        50,
        'running'
      );

      expect(updated).toBeNull();
    });

    it('should start stage if not started', async () => {
      const pipeline = await storageModule.createPipeline('task-1', 'qa-session-1');
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0,
      };
      pipeline.stages.push(stage);
      await storageModule.savePipeline(pipeline);

      const updated = await storageModule.updateStageProgress(
        pipeline.id,
        'stage-1',
        10,
        'running'
      );

      expect(updated?.stages[0].startedAt).toBeDefined();
    });
  });
});
