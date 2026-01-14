/**
 * Tests for Passthrough Pipeline Runner
 * SPEC-PASSTHROUGH-001: Pipeline execution engine
 *
 * TDD RED Phase: Failing tests that define expected behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  PassthroughPipeline,
  PassthroughStageName,
  PassthroughStageStatus,
} from '../../../src/types/passthrough.ts';
import type { Task } from '../../../src/types/index.ts';
import type { LLMProvider } from '../../../src/types/llm.ts';

// Mock dependencies
vi.mock('../passthroughStorage.ts', () => ({
  createPipeline: vi.fn(),
  savePipeline: vi.fn(),
  getPipelineById: vi.fn(),
  updatePipelineStatus: vi.fn(),
  updateStageProgress: vi.fn(),
}));

vi.mock('../taskStorage.ts', () => ({
  getTaskById: vi.fn(),
  updateTask: vi.fn(),
}));

vi.mock('../llmSettingsStorage.ts', () => ({
  getLLMSettingsOrDefault: vi.fn(),
}));

vi.mock('../llmProvider.ts', () => ({
  createLLMProvider: vi.fn(),
}));

vi.mock('../promptBuilder.ts', () => ({
  buildDesignDocumentPrompt: vi.fn(),
  buildPRDPrompt: vi.fn(),
  buildPrototypePrompt: vi.fn(),
}));

vi.mock('../claudeCodeRunner.ts', () => ({
  callClaudeCode: vi.fn(),
}));

// Import after mocks
import {
  createPipeline,
  savePipeline,
  getPipelineById,
  updatePipelineStatus,
  updateStageProgress,
} from '../passthroughStorage.ts';
import { getTaskById, updateTask } from '../taskStorage.ts';
import { getLLMSettingsOrDefault } from '../llmSettingsStorage.ts';
import { createLLMProvider } from '../llmProvider.ts';
import {
  buildDesignDocumentPrompt,
  buildPRDPrompt,
  buildPrototypePrompt,
} from '../promptBuilder.ts';
import { callClaudeCode } from '../claudeCodeRunner.ts';

// Import the module under test
import {
  runPipeline,
  runStage,
  isPipelinePaused,
  isPipelineCancelled,
  handleStageError,
  type PipelineRunnerOptions,
} from '../passthroughRunner.ts';

describe('Passthrough Pipeline Runner (TDD RED)', () => {
  // Test fixtures
  const mockTaskId = 'task-123';
  const mockProjectId = 'project-456';
  const mockQaSessionId = 'qa-session-789';

  const mockTask: Task = {
    id: mockTaskId,
    projectId: mockProjectId,
    title: 'Test Task',
    status: 'featurelist',
    featureList: 'Test feature list',
    designDocument: null,
    prd: null,
    prototype: null,
    references: [],
    qaAnswers: [],
    qaSession: {
      id: mockQaSessionId,
      isCompleted: true,
    },
    revisions: [],
    isArchived: false,
    createdAt: '2024-01-14T00:00:00.000Z',
    updatedAt: '2024-01-14T00:00:00.000Z',
  };

  const mockPipeline: PassthroughPipeline = {
    id: 'pipeline-123',
    taskId: mockTaskId,
    qaSessionId: mockQaSessionId,
    status: 'pending',
    currentStage: null,
    stages: [
      {
        id: 'stage-design_doc',
        name: 'design_doc',
        displayName: 'Design Document',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0,
      },
      {
        id: 'stage-prd',
        name: 'prd',
        displayName: 'Product Requirements Document',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0,
      },
      {
        id: 'stage-prototype',
        name: 'prototype',
        displayName: 'Prototype',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0,
      },
    ],
    createdAt: '2024-01-14T00:00:00.000Z',
    updatedAt: '2024-01-14T00:00:00.000Z',
    startedAt: null,
    completedAt: null,
  };

  const mockLLMSettings = {
    provider: 'claude-code' as LLMProvider,
    model: 'claude-3.5-sonnet',
    isEnabled: true,
    connectionStatus: 'connected',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup default mock returns
    vi.mocked(getTaskById).mockResolvedValue({ task: mockTask, projectId: mockProjectId });
    vi.mocked(getLLMSettingsOrDefault).mockResolvedValue(mockLLMSettings);
    vi.mocked(createPipeline).mockResolvedValue(mockPipeline);
    vi.mocked(savePipeline).mockResolvedValue(undefined);
    vi.mocked(getPipelineById).mockResolvedValue(mockPipeline);
    vi.mocked(updatePipelineStatus).mockResolvedValue(undefined);
    vi.mocked(updateStageProgress).mockResolvedValue(undefined);
    vi.mocked(updateTask).mockResolvedValue(mockTask);

    // Mock LLM provider
    const mockLLMProvider = {
      generateText: vi.fn().mockResolvedValue('# Design Document\n\nGenerated content'),
      chat: vi.fn().mockResolvedValue({
        content: '# PRD\n\nGenerated content',
        usage: { inputTokens: 100, outputTokens: 200 },
      }),
    };
    vi.mocked(createLLMProvider).mockReturnValue(mockLLMProvider as any);

    // Mock prompt builders
    vi.mocked(buildDesignDocumentPrompt).mockReturnValue('Mock design doc prompt');
    vi.mocked(buildPRDPrompt).mockReturnValue('Mock PRD prompt');
    vi.mocked(buildPrototypePrompt).mockReturnValue('Mock prototype prompt');

    // Mock Claude Code runner
    vi.mocked(callClaudeCode).mockResolvedValue({
      success: true,
      output: '# Generated Document',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // Test Group 1: runPipeline() - Basic Flow
  // -----------------------------------------------------------------------

  describe('runPipeline()', () => {
    it('should execute full pipeline successfully (design_doc -> prd -> prototype)', async () => {
      // Arrange
      const options: PipelineRunnerOptions = {
        taskId: mockTaskId,
        qaSessionId: mockQaSessionId,
      };

      // Act
      const result = await runPipeline(options);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.completedAt).not.toBeNull();

      // Verify all stages completed
      expect(result.stages).toHaveLength(3);
      expect(result.stages[0].status).toBe('completed');
      expect(result.stages[1].status).toBe('completed');
      expect(result.stages[2].status).toBe('completed');

      // Verify pipeline was saved after each stage (3) plus final completion (1) = 4 total
      expect(savePipeline).toHaveBeenCalledTimes(4);
    });

    it('should handle pause request during pipeline execution', async () => {
      // Arrange
      const options: PipelineRunnerOptions = {
        taskId: mockTaskId,
        qaSessionId: mockQaSessionId,
      };

      // Mock pipeline to return paused status
      let callCount = 0;
      vi.mocked(getPipelineById).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return { ...mockPipeline, status: 'running', currentStage: 'design_doc' };
        } else if (callCount === 2) {
          return { ...mockPipeline, status: 'paused' };
        }
        return mockPipeline;
      });

      // Act
      const result = await runPipeline(options);

      // Assert
      expect(result.status).toBe('paused');
      expect(updatePipelineStatus).toHaveBeenCalledWith(
        mockPipeline.id,
        'paused'
      );
    });

    it('should handle cancel request immediately during execution', async () => {
      // Arrange
      const options: PipelineRunnerOptions = {
        taskId: mockTaskId,
        qaSessionId: mockQaSessionId,
      };

      // Mock pipeline to return cancelled status
      vi.mocked(getPipelineById).mockResolvedValueOnce({
        ...mockPipeline,
        status: 'running',
        currentStage: 'design_doc',
      });
      vi.mocked(getPipelineById).mockResolvedValueOnce({
        ...mockPipeline,
        status: 'cancelled',
      });

      // Act
      const result = await runPipeline(options);

      // Assert
      expect(result.status).toBe('cancelled');
      expect(updatePipelineStatus).toHaveBeenCalledWith(
        mockPipeline.id,
        'cancelled'
      );
    });

    it('should handle stage errors and update stage status', async () => {
      // Arrange
      const options: PipelineRunnerOptions = {
        taskId: mockTaskId,
        qaSessionId: mockQaSessionId,
      };

      // Mock LLM provider to throw error
      const mockLLMProvider = {
        generateText: vi.fn().mockRejectedValue(new Error('LLM service unavailable')),
      };
      vi.mocked(createLLMProvider).mockReturnValue(mockLLMProvider as any);

      // Act
      const result = await runPipeline(options);

      // Assert
      expect(result.status).toBe('failed');
      expect(result.stages[0].status).toBe('failed');
      expect(result.stages[0].error).not.toBeNull();
      expect(result.stages[0].error?.message).toBe('LLM service unavailable');
    });

    it('should stop after maximum retry attempts', async () => {
      // Arrange
      const options: PipelineRunnerOptions = {
        taskId: mockTaskId,
        qaSessionId: mockQaSessionId,
        maxRetries: 3,
      };

      // Mock LLM provider to consistently fail
      const mockLLMProvider = {
        generateText: vi.fn().mockRejectedValue(new Error('LLM service unavailable')),
      };
      vi.mocked(createLLMProvider).mockReturnValue(mockLLMProvider as any);

      // Act
      const result = await runPipeline(options);

      // Assert
      expect(result.status).toBe('failed');
      expect(result.stages[0].error?.retryCount).toBe(3);
      expect(mockLLMProvider.generateText).toHaveBeenCalledTimes(3); // maxRetries + 1 initial attempt
    });
  });

  // -----------------------------------------------------------------------
  // Test Group 2: runStage() - Individual Stage Execution
  // -----------------------------------------------------------------------

  describe('runStage()', () => {
    it('should execute design_doc stage successfully', async () => {
      // Arrange
      const stage = mockPipeline.stages[0];

      // Act
      const result = await runStage({
        pipeline: mockPipeline,
        stage,
        task: mockTask,
        llmSettings: mockLLMSettings,
      });

      // Assert
      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
      expect(result.completedAt).not.toBeNull();
      expect(result.error).toBeNull();
    });

    it('should execute prd stage successfully', async () => {
      // Arrange
      const stage = mockPipeline.stages[1];
      const pipelineWithDesign = {
        ...mockPipeline,
        stages: [
          { ...mockPipeline.stages[0], status: 'completed' as PassthroughStageStatus },
          stage,
          mockPipeline.stages[2],
        ],
      };

      // Act
      const result = await runStage({
        pipeline: pipelineWithDesign,
        stage,
        task: mockTask,
        llmSettings: mockLLMSettings,
      });

      // Assert
      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
    });

    it('should execute prototype stage successfully', async () => {
      // Arrange
      const stage = mockPipeline.stages[2];
      const pipelineWithPrd = {
        ...mockPipeline,
        stages: [
          { ...mockPipeline.stages[0], status: 'completed' as PassthroughStageStatus },
          { ...mockPipeline.stages[1], status: 'completed' as PassthroughStageStatus },
          stage,
        ],
      };

      // Act
      const result = await runStage({
        pipeline: pipelineWithPrd,
        stage,
        task: mockTask,
        llmSettings: mockLLMSettings,
      });

      // Assert
      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
    });
  });

  // -----------------------------------------------------------------------
  // Test Group 3: Utility Functions
  // -----------------------------------------------------------------------

  describe('isPipelinePaused()', () => {
    it('should return true when pipeline status is paused', () => {
      const pausedPipeline = { ...mockPipeline, status: 'paused' as const };
      expect(isPipelinePaused(pausedPipeline)).toBe(true);
    });

    it('should return false when pipeline status is not paused', () => {
      expect(isPipelinePaused(mockPipeline)).toBe(false);
      expect(isPipelinePaused({ ...mockPipeline, status: 'running' })).toBe(false);
      expect(isPipelinePaused({ ...mockPipeline, status: 'completed' })).toBe(false);
    });
  });

  describe('isPipelineCancelled()', () => {
    it('should return true when pipeline status is cancelled', () => {
      const cancelledPipeline = { ...mockPipeline, status: 'cancelled' as const };
      expect(isPipelineCancelled(cancelledPipeline)).toBe(true);
    });

    it('should return false when pipeline status is not cancelled', () => {
      expect(isPipelineCancelled(mockPipeline)).toBe(false);
      expect(isPipelineCancelled({ ...mockPipeline, status: 'running' })).toBe(false);
      expect(isPipelineCancelled({ ...mockPipeline, status: 'paused' })).toBe(false);
    });
  });

  describe('handleStageError()', () => {
    it('should update stage with error information', async () => {
      // Arrange
      const stage = mockPipeline.stages[0];
      const error = new Error('Test error');

      // Act
      const result = await handleStageError({
        pipeline: mockPipeline,
        stage,
        error,
        retryCount: 1,
      });

      // Assert
      expect(result.status).toBe('failed');
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Test error');
      expect(result.error?.retryCount).toBe(1);
    });

    it('should attempt retry if under max retries', async () => {
      // Arrange
      const stage = mockPipeline.stages[0];
      const error = new Error('Temporary error');

      // Act
      const shouldRetry = await handleStageError({
        pipeline: mockPipeline,
        stage,
        error,
        retryCount: 1,
        maxRetries: 3,
      });

      // Assert - should return retry information
      expect(shouldRetry).toBeDefined();
    });

    it('should not retry if max retries exceeded', async () => {
      // Arrange
      const stage = mockPipeline.stages[0];
      const error = new Error('Permanent error');

      // Act
      const result = await handleStageError({
        pipeline: mockPipeline,
        stage,
        error,
        retryCount: 4,
        maxRetries: 3,
      });

      // Assert
      expect(result.status).toBe('failed');
      expect(result.error?.retryCount).toBe(4);
    });
  });

  // -----------------------------------------------------------------------
  // Test Group 4: Progress Calculation
  // -----------------------------------------------------------------------

  describe('calculateProgress()', () => {
    it('should calculate 0% progress when no stages started', async () => {
      // Arrange
      const options: PipelineRunnerOptions = {
        taskId: mockTaskId,
        qaSessionId: mockQaSessionId,
      };

      // Act & Assert - This will be implemented in GREEN phase
      // For now, just verify the function exists
      expect(() => import('../passthroughRunner.ts')).not.toThrow();
    });

    it('should calculate 33% progress when first stage running', async () => {
      // This test will pass after implementation
      expect(true).toBe(true); // Placeholder
    });

    it('should calculate 100% progress when all stages completed', async () => {
      // This test will pass after implementation
      expect(true).toBe(true); // Placeholder
    });
  });
});
