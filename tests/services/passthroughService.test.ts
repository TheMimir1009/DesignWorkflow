/**
 * Passthrough Service Tests
 * SPEC-PASSTHROUGH-001: TDD test suite for Passthrough API communication layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startPipeline,
  pausePipeline,
  resumePipeline,
  cancelPipeline,
  getPipelineStatus,
  retryStage,
} from '../../src/services/passthroughService';
import type { PassthroughPipeline, ApiResult } from '../../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

const createApiResponse = <T>(data: T, success = true, error?: string, errorCode?: string): ApiResult<T> => {
  const response: ApiResult<T> = {
    success,
    data,
  };

  if (!success) {
    response.error = error ?? 'Unknown error';
    if (errorCode) {
      response.errorCode = errorCode;
    }
  }

  return response;
};

describe('passthroughService', () => {
  const API_BASE_URL = 'http://localhost:3001';

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('startPipeline', () => {
    it('should start a new pipeline successfully', async () => {
      const mockPipeline = createMockPipeline({ status: 'running' });
      const mockResponse = createApiResponse({ pipeline: mockPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await startPipeline('test-task-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeFromStage: undefined }),
        }
      );
      expect(result).toEqual(mockPipeline);
    });

    it('should start pipeline from specific stage', async () => {
      const mockPipeline = createMockPipeline({
        status: 'running',
        currentStage: 'prd',
      });
      const mockResponse = createApiResponse({ pipeline: mockPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await startPipeline('test-task-id', 'prd');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeFromStage: 'prd' }),
        }
      );
      expect(result).toEqual(mockPipeline);
    });

    it('should throw error when API returns unsuccessful response', async () => {
      const mockResponse = createApiResponse(
        { pipeline: null },
        false,
        'Q&A not completed',
        'QA_NOT_COMPLETED'
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(startPipeline('test-task-id')).rejects.toThrow(
        'Q&A not completed [QA_NOT_COMPLETED]'
      );
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(startPipeline('test-task-id')).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      const errorResponse = createApiResponse(
        { pipeline: null },
        false,
        'Task not found',
        'TASK_NOT_FOUND'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve(errorResponse),
      });

      await expect(startPipeline('test-task-id')).rejects.toThrow(
        'Task not found [TASK_NOT_FOUND]'
      );
    });
  });

  describe('pausePipeline', () => {
    it('should pause a running pipeline successfully', async () => {
      const runningPipeline = createMockPipeline({ status: 'running' });
      const pausedPipeline = createMockPipeline({ status: 'paused' });
      const mockResponse = createApiResponse({ pipeline: pausedPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await pausePipeline('test-task-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/pause`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(pausedPipeline);
    });

    it('should throw error when pipeline not found', async () => {
      const errorResponse = createApiResponse(
        { pipeline: null },
        false,
        'Pipeline not found',
        'PIPELINE_NOT_FOUND'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(pausePipeline('test-task-id')).rejects.toThrow(
        'Pipeline not found [PIPELINE_NOT_FOUND]'
      );
    });
  });

  describe('resumePipeline', () => {
    it('should resume a paused pipeline successfully', async () => {
      const pausedPipeline = createMockPipeline({ status: 'paused' });
      const runningPipeline = createMockPipeline({ status: 'running' });
      const mockResponse = createApiResponse({ pipeline: runningPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resumePipeline('test-task-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(runningPipeline);
    });

    it('should throw error when operation not allowed', async () => {
      const errorResponse = createApiResponse(
        { pipeline: null },
        false,
        'Cannot resume pipeline that is running',
        'OPERATION_NOT_ALLOWED'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(resumePipeline('test-task-id')).rejects.toThrow(
        'Cannot resume pipeline that is running [OPERATION_NOT_ALLOWED]'
      );
    });
  });

  describe('cancelPipeline', () => {
    it('should cancel a pipeline successfully', async () => {
      const runningPipeline = createMockPipeline({ status: 'running' });
      const cancelledPipeline = createMockPipeline({ status: 'cancelled' });
      const mockResponse = createApiResponse({ pipeline: cancelledPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await cancelPipeline('test-task-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(cancelledPipeline);
    });

    it('should cancel a paused pipeline successfully', async () => {
      const pausedPipeline = createMockPipeline({ status: 'paused' });
      const cancelledPipeline = createMockPipeline({ status: 'cancelled' });
      const mockResponse = createApiResponse({ pipeline: cancelledPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await cancelPipeline('test-task-id');

      expect(result).toEqual(cancelledPipeline);
    });
  });

  describe('getPipelineStatus', () => {
    it('should fetch pipeline status successfully', async () => {
      const mockPipeline = createMockPipeline({ status: 'running' });
      const mockResponse = createApiResponse({ pipeline: mockPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getPipelineStatus('test-task-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockPipeline);
    });

    it('should throw error when pipeline not found', async () => {
      const errorResponse = createApiResponse(
        { pipeline: null },
        false,
        'Pipeline not found',
        'PIPELINE_NOT_FOUND'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(getPipelineStatus('test-task-id')).rejects.toThrow(
        'Pipeline not found [PIPELINE_NOT_FOUND]'
      );
    });
  });

  describe('retryStage', () => {
    it('should retry a failed stage successfully', async () => {
      const failedPipeline = createMockPipeline({ status: 'failed' });
      const runningPipeline = createMockPipeline({ status: 'running', currentStage: 'prd' });
      const mockResponse = createApiResponse({ pipeline: runningPipeline });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await retryStage('test-task-id', 'prd');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/test-task-id/passthrough/retry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stage: 'prd' }),
        }
      );
      expect(result).toEqual(runningPipeline);
    });

    it('should throw error when stage is invalid', async () => {
      const errorResponse = createApiResponse(
        { pipeline: null },
        false,
        'Invalid pipeline stage',
        'INVALID_PIPELINE_STAGE'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(retryStage('test-task-id', 'invalid_stage')).rejects.toThrow(
        'Invalid pipeline stage [INVALID_PIPELINE_STAGE]'
      );
    });

    it('should throw error when stage is missing', async () => {
      const errorResponse = createApiResponse(
        { pipeline: null },
        false,
        'Stage is required',
        'MISSING_REQUIRED_FIELD'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(
        retryStage('test-task-id', '' as any)
      ).rejects.toThrow('Stage is required [MISSING_REQUIRED_FIELD]');
    });
  });

  describe('error handling', () => {
    it('should include error details when available', async () => {
      const errorResponse: ApiResult<{ pipeline: null }> = {
        success: false,
        error: 'Pipeline error',
        errorCode: 'PIPELINE_ERROR',
        details: {
          field: 'taskId',
          value: 'invalid-task',
          guidance: 'Provide a valid task ID',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(startPipeline('invalid-task')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(startPipeline('test-task-id')).rejects.toThrow('Failed to fetch');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(startPipeline('test-task-id')).rejects.toThrow('Request timeout');
    });
  });
});
