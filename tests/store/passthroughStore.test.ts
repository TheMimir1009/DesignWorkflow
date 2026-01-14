/**
 * Passthrough Store Tests
 * SPEC-PASSTHROUGH-001: TDD test suite for Passthrough Zustand state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { PassthroughPipeline, PassthroughStageName } from '../../src/types/passthrough';

// Mock the passthroughService module
vi.mock('../../src/services/passthroughService', () => ({
  startPipeline: vi.fn(),
  pausePipeline: vi.fn(),
  resumePipeline: vi.fn(),
  cancelPipeline: vi.fn(),
  getPipelineStatus: vi.fn(),
  retryStage: vi.fn(),
}));

// Import after mocking
import * as passthroughService from '../../src/services/passthroughService';
import { usePassthroughStore } from '../../src/store/passthroughStore';

// Test data factories
const createMockPipeline = (
  overrides: Partial<PassthroughPipeline> = {}
): PassthroughPipeline => ({
  id: 'test-pipeline-id',
  taskId: 'test-task-id',
  qaSessionId: 'test-qa-session-id',
  status: 'pending',
  currentStage: null,
  stages: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  startedAt: null,
  completedAt: null,
  ...overrides,
});

describe('passthroughStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset store state before each test
    usePassthroughStore.setState({
      pipelines: new Map(),
      pollingTaskIds: new Set(),
      loadingStates: new Map(),
      errorStates: new Map(),
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = usePassthroughStore.getState();

      expect(state.pipelines).toBeInstanceOf(Map);
      expect(state.pipelines.size).toBe(0);
      expect(state.pollingTaskIds).toBeInstanceOf(Set);
      expect(state.pollingTaskIds.size).toBe(0);
      expect(state.loadingStates).toBeInstanceOf(Map);
      expect(state.loadingStates.size).toBe(0);
      expect(state.errorStates).toBeInstanceOf(Map);
      expect(state.errorStates.size).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('startPipeline', () => {
    it('should start pipeline successfully', async () => {
      const mockPipeline = createMockPipeline({ status: 'running' });
      vi.mocked(passthroughService.startPipeline).mockResolvedValueOnce(mockPipeline);
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValue(mockPipeline);

      await act(async () => {
        await usePassthroughStore.getState().startPipeline('test-task-id');
      });

      const state = usePassthroughStore.getState();
      expect(state.pipelines.get('test-task-id')).toEqual(mockPipeline);
      expect(state.isTaskLoading('test-task-id')).toBe(false);
      expect(state.getTaskError('test-task-id')).toBeNull();
      expect(passthroughService.startPipeline).toHaveBeenCalledWith('test-task-id', undefined);
    });

    it('should start pipeline from specific stage', async () => {
      const mockPipeline = createMockPipeline({
        status: 'running',
        currentStage: 'prd' as PassthroughStageName,
      });
      vi.mocked(passthroughService.startPipeline).mockResolvedValueOnce(mockPipeline);

      await act(async () => {
        await usePassthroughStore.getState().startPipeline('test-task-id', 'prd');
      });

      expect(passthroughService.startPipeline).toHaveBeenCalledWith('test-task-id', 'prd');
    });

    it('should set loading state while starting', async () => {
      let resolvePromise: (value: PassthroughPipeline) => void;
      const pendingPromise = new Promise<PassthroughPipeline>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(passthroughService.startPipeline).mockReturnValueOnce(pendingPromise);

      act(() => {
        usePassthroughStore.getState().startPipeline('test-task-id');
      });

      expect(usePassthroughStore.getState().isTaskLoading('test-task-id')).toBe(true);

      await act(async () => {
        resolvePromise!(createMockPipeline());
      });

      expect(usePassthroughStore.getState().isTaskLoading('test-task-id')).toBe(false);
    });

    it('should handle start pipeline error', async () => {
      const error = new Error('Failed to start pipeline');
      vi.mocked(passthroughService.startPipeline).mockRejectedValueOnce(error);

      await act(async () => {
        await usePassthroughStore.getState().startPipeline('test-task-id');
      });

      const state = usePassthroughStore.getState();
      expect(state.getTaskError('test-task-id')).toBe('Failed to start pipeline');
      expect(state.error).toBe('Failed to start pipeline');
      expect(state.isTaskLoading('test-task-id')).toBe(false);
    });

    it('should start polling when pipeline is running', async () => {
      const mockPipeline = createMockPipeline({ status: 'running' });
      vi.mocked(passthroughService.startPipeline).mockResolvedValueOnce(mockPipeline);
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValue(mockPipeline);

      await act(async () => {
        await usePassthroughStore.getState().startPipeline('test-task-id');
      });

      expect(usePassthroughStore.getState().pollingTaskIds.has('test-task-id')).toBe(true);
    });
  });

  describe('pausePipeline', () => {
    it('should pause pipeline successfully', async () => {
      const runningPipeline = createMockPipeline({ status: 'running' });
      const pausedPipeline = createMockPipeline({ status: 'paused' });
      usePassthroughStore.setState({
        pipelines: new Map([['test-task-id', runningPipeline]]),
        pollingTaskIds: new Set(['test-task-id']),
      });
      vi.mocked(passthroughService.pausePipeline).mockResolvedValueOnce(pausedPipeline);

      await act(async () => {
        await usePassthroughStore.getState().pausePipeline('test-task-id');
      });

      const state = usePassthroughStore.getState();
      expect(state.pipelines.get('test-task-id')).toEqual(pausedPipeline);
      expect(state.pollingTaskIds.has('test-task-id')).toBe(false);
      expect(passthroughService.pausePipeline).toHaveBeenCalledWith('test-task-id');
    });

    it('should handle pause pipeline error', async () => {
      const error = new Error('Failed to pause pipeline');
      vi.mocked(passthroughService.pausePipeline).mockRejectedValueOnce(error);

      await act(async () => {
        await usePassthroughStore.getState().pausePipeline('test-task-id');
      });

      expect(usePassthroughStore.getState().getTaskError('test-task-id')).toBe(
        'Failed to pause pipeline'
      );
    });
  });

  describe('resumePipeline', () => {
    it('should resume pipeline successfully', async () => {
      const pausedPipeline = createMockPipeline({ status: 'paused' });
      const runningPipeline = createMockPipeline({ status: 'running' });
      usePassthroughStore.setState({
        pipelines: new Map([['test-task-id', pausedPipeline]]),
      });
      vi.mocked(passthroughService.resumePipeline).mockResolvedValueOnce(runningPipeline);
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValue(runningPipeline);

      await act(async () => {
        await usePassthroughStore.getState().resumePipeline('test-task-id');
      });

      const state = usePassthroughStore.getState();
      expect(state.pipelines.get('test-task-id')).toEqual(runningPipeline);
      expect(state.pollingTaskIds.has('test-task-id')).toBe(true);
      expect(passthroughService.resumePipeline).toHaveBeenCalledWith('test-task-id');
    });

    it('should handle resume pipeline error', async () => {
      const error = new Error('Failed to resume pipeline');
      vi.mocked(passthroughService.resumePipeline).mockRejectedValueOnce(error);

      await act(async () => {
        await usePassthroughStore.getState().resumePipeline('test-task-id');
      });

      expect(usePassthroughStore.getState().getTaskError('test-task-id')).toBe(
        'Failed to resume pipeline'
      );
    });
  });

  describe('cancelPipeline', () => {
    it('should cancel pipeline successfully', async () => {
      const runningPipeline = createMockPipeline({ status: 'running' });
      const cancelledPipeline = createMockPipeline({ status: 'cancelled' });
      usePassthroughStore.setState({
        pipelines: new Map([['test-task-id', runningPipeline]]),
        pollingTaskIds: new Set(['test-task-id']),
      });
      vi.mocked(passthroughService.cancelPipeline).mockResolvedValueOnce(cancelledPipeline);

      await act(async () => {
        await usePassthroughStore.getState().cancelPipeline('test-task-id');
      });

      const state = usePassthroughStore.getState();
      expect(state.pipelines.get('test-task-id')).toEqual(cancelledPipeline);
      expect(state.pollingTaskIds.has('test-task-id')).toBe(false);
      expect(passthroughService.cancelPipeline).toHaveBeenCalledWith('test-task-id');
    });

    it('should handle cancel pipeline error', async () => {
      const error = new Error('Failed to cancel pipeline');
      vi.mocked(passthroughService.cancelPipeline).mockRejectedValueOnce(error);

      await act(async () => {
        await usePassthroughStore.getState().cancelPipeline('test-task-id');
      });

      expect(usePassthroughStore.getState().getTaskError('test-task-id')).toBe(
        'Failed to cancel pipeline'
      );
    });
  });

  describe('retryStage', () => {
    it('should retry stage successfully', async () => {
      const failedPipeline = createMockPipeline({ status: 'failed' });
      const runningPipeline = createMockPipeline({ status: 'running' });
      usePassthroughStore.setState({
        pipelines: new Map([['test-task-id', failedPipeline]]),
      });
      vi.mocked(passthroughService.retryStage).mockResolvedValueOnce(runningPipeline);
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValue(runningPipeline);

      await act(async () => {
        await usePassthroughStore.getState().retryStage('test-task-id', 'design_doc');
      });

      const state = usePassthroughStore.getState();
      expect(state.pipelines.get('test-task-id')).toEqual(runningPipeline);
      expect(passthroughService.retryStage).toHaveBeenCalledWith('test-task-id', 'design_doc');
    });

    it('should handle retry stage error', async () => {
      const error = new Error('Failed to retry stage');
      vi.mocked(passthroughService.retryStage).mockRejectedValueOnce(error);

      await act(async () => {
        await usePassthroughStore.getState().retryStage('test-task-id', 'prd');
      });

      expect(usePassthroughStore.getState().getTaskError('test-task-id')).toBe(
        'Failed to retry stage'
      );
    });
  });

  describe('fetchPipelineStatus', () => {
    it('should fetch pipeline status successfully', async () => {
      const mockPipeline = createMockPipeline({ status: 'running' });
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValueOnce(mockPipeline);

      await act(async () => {
        await usePassthroughStore.getState().fetchPipelineStatus('test-task-id');
      });

      const state = usePassthroughStore.getState();
      expect(state.pipelines.get('test-task-id')).toEqual(mockPipeline);
      expect(passthroughService.getPipelineStatus).toHaveBeenCalledWith('test-task-id');
    });

    it('should stop polling when pipeline completes', async () => {
      const runningPipeline = createMockPipeline({ status: 'running' });
      const completedPipeline = createMockPipeline({ status: 'completed' });
      usePassthroughStore.setState({
        pipelines: new Map([['test-task-id', runningPipeline]]),
        pollingTaskIds: new Set(['test-task-id']),
      });
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValueOnce(completedPipeline);

      await act(async () => {
        await usePassthroughStore.getState().fetchPipelineStatus('test-task-id');
      });

      expect(usePassthroughStore.getState().pollingTaskIds.has('test-task-id')).toBe(false);
    });
  });

  describe('polling', () => {
    it('should start polling for a task', () => {
      const mockPipeline = createMockPipeline({ status: 'running' });
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValue(mockPipeline);

      act(() => {
        usePassthroughStore.getState().startPolling('test-task-id');
      });

      expect(usePassthroughStore.getState().pollingTaskIds.has('test-task-id')).toBe(true);
    });

    it('should stop polling for a task', () => {
      usePassthroughStore.setState({
        pollingTaskIds: new Set(['test-task-id']),
      });

      act(() => {
        usePassthroughStore.getState().stopPolling('test-task-id');
      });

      expect(usePassthroughStore.getState().pollingTaskIds.has('test-task-id')).toBe(false);
    });

    it('should not start polling if already polling', () => {
      vi.mocked(passthroughService.getPipelineStatus).mockResolvedValue(createMockPipeline());

      usePassthroughStore.setState({
        pollingTaskIds: new Set(['test-task-id']),
      });

      act(() => {
        usePassthroughStore.getState().startPolling('test-task-id');
      });

      // Should not call getPipelineStatus if already polling
      expect(passthroughService.getPipelineStatus).not.toHaveBeenCalled();
    });
  });

  describe('getters', () => {
    it('should get pipeline for task', () => {
      const mockPipeline = createMockPipeline();
      usePassthroughStore.setState({
        pipelines: new Map([['test-task-id', mockPipeline]]),
      });

      expect(usePassthroughStore.getState().getPipeline('test-task-id')).toEqual(mockPipeline);
      expect(usePassthroughStore.getState().getPipeline('other-task-id')).toBeUndefined();
    });

    it('should check if task is loading', () => {
      usePassthroughStore.setState({
        loadingStates: new Map([['test-task-id', true]]),
      });

      expect(usePassthroughStore.getState().isTaskLoading('test-task-id')).toBe(true);
      expect(usePassthroughStore.getState().isTaskLoading('other-task-id')).toBe(false);
    });

    it('should get task error', () => {
      usePassthroughStore.setState({
        errorStates: new Map([['test-task-id', 'Test error']]),
      });

      expect(usePassthroughStore.getState().getTaskError('test-task-id')).toBe('Test error');
      expect(usePassthroughStore.getState().getTaskError('other-task-id')).toBeNull();
    });
  });

  describe('clearTaskError', () => {
    it('should clear error for specific task', () => {
      usePassthroughStore.setState({
        errorStates: new Map([['test-task-id', 'Test error']]),
      });

      act(() => {
        usePassthroughStore.getState().clearTaskError('test-task-id');
      });

      expect(usePassthroughStore.getState().getTaskError('test-task-id')).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear overall error', () => {
      usePassthroughStore.setState({
        error: 'Test error',
      });

      act(() => {
        usePassthroughStore.getState().clearError();
      });

      expect(usePassthroughStore.getState().error).toBeNull();
    });
  });
});
