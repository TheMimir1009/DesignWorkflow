/**
 * TDD Tests for Passthrough Types
 * RED Phase: Write failing tests first
 */
import { describe, it, expect } from 'vitest';
import type {
  PassthroughPipeline,
  PassthroughStage,
  PassthroughStageStatus,
  PassthroughPipelineStatus,
  PassthroughStageError,
} from '../passthrough';
import {
  validatePipeline,
  validateStage,
  isPipelineRunning,
  isPipelineCompleted,
  isStageActive,
  getNextStage,
} from '../passthrough';

describe('Passthrough Types - Type Guards and Validators', () => {
  describe('isStageActive', () => {
    it('should return true for stages with running status', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'running',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
        error: null,
        progress: 50,
      };
      expect(isStageActive(stage)).toBe(true);
    });

    it('should return true for stages with pending status', () => {
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
      expect(isStageActive(stage)).toBe(true);
    });

    it('should return false for stages with completed status', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'completed',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: '2025-01-14T11:00:00.000Z',
        error: null,
        progress: 100,
      };
      expect(isStageActive(stage)).toBe(false);
    });

    it('should return false for stages with failed status', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'failed',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
        error: { message: 'Test error', code: 'TEST_ERROR' },
        progress: 50,
      };
      expect(isStageActive(stage)).toBe(false);
    });

    it('should return false for stages with cancelled status', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'cancelled',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
        error: null,
        progress: 50,
      };
      expect(isStageActive(stage)).toBe(false);
    });
  });

  describe('isPipelineRunning', () => {
    it('should return true for pipeline with running status', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'running',
        currentStage: 'design_doc',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(isPipelineRunning(pipeline)).toBe(true);
    });

    it('should return true for pipeline with paused status', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'paused',
        currentStage: 'design_doc',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(isPipelineRunning(pipeline)).toBe(true);
    });

    it('should return false for pipeline with completed status', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'completed',
        currentStage: null,
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T11:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: '2025-01-14T11:00:00.000Z',
      };
      expect(isPipelineRunning(pipeline)).toBe(false);
    });

    it('should return false for pipeline with failed status', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'failed',
        currentStage: 'design_doc',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:30:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(isPipelineRunning(pipeline)).toBe(false);
    });
  });

  describe('isPipelineCompleted', () => {
    it('should return true for pipeline with completed status', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'completed',
        currentStage: null,
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T11:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: '2025-01-14T11:00:00.000Z',
      };
      expect(isPipelineCompleted(pipeline)).toBe(true);
    });

    it('should return false for pipeline with running status', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'running',
        currentStage: 'design_doc',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(isPipelineCompleted(pipeline)).toBe(false);
    });
  });

  describe('getNextStage', () => {
    it('should return design_doc for null currentStage', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'pending',
        currentStage: null,
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: null,
        completedAt: null,
      };
      expect(getNextStage(pipeline)).toBe('design_doc');
    });

    it('should return prd after design_doc', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'running',
        currentStage: 'design_doc',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(getNextStage(pipeline)).toBe('prd');
    });

    it('should return prototype after prd', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'running',
        currentStage: 'prd',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(getNextStage(pipeline)).toBe('prototype');
    });

    it('should return null after prototype', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'running',
        currentStage: 'prototype',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      expect(getNextStage(pipeline)).toBeNull();
    });
  });

  describe('validateStage', () => {
    it('should pass validation for valid stage', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'completed',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: '2025-01-14T11:00:00.000Z',
        error: null,
        progress: 100,
      };
      const result = validateStage(stage);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for stage with invalid status combination', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'completed',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 100,
      };
      const result = validateStage(stage);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for stage with failed status but no error', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'failed',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
        error: null,
        progress: 50,
      };
      const result = validateStage(stage);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Failed stage must have an error');
    });

    it('should fail validation for stage with invalid progress', () => {
      const stage: PassthroughStage = {
        id: 'stage-1',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'running',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
        error: null,
        progress: 150,
      };
      const result = validateStage(stage);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Progress must be between 0 and 100');
    });
  });

  describe('validatePipeline', () => {
    it('should pass validation for valid pipeline', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'pending',
        currentStage: null,
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T10:00:00.000Z',
        startedAt: null,
        completedAt: null,
      };
      const result = validatePipeline(pipeline);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for pipeline with invalid status combination', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'completed',
        currentStage: 'design_doc',
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T11:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: '2025-01-14T11:00:00.000Z',
      };
      const result = validatePipeline(pipeline);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for pipeline with completed status but no completedAt', () => {
      const pipeline: PassthroughPipeline = {
        id: 'pipeline-1',
        taskId: 'task-1',
        qaSessionId: 'qa-1',
        status: 'completed',
        currentStage: null,
        stages: [],
        createdAt: '2025-01-14T10:00:00.000Z',
        updatedAt: '2025-01-14T11:00:00.000Z',
        startedAt: '2025-01-14T10:00:00.000Z',
        completedAt: null,
      };
      const result = validatePipeline(pipeline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Completed pipeline must have completedAt timestamp');
    });
  });
});
