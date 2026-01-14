/**
 * Passthrough Service - API Communication Layer
 * SPEC-PASSTHROUGH-001: Handles all passthrough pipeline API operations via REST API
 */
import type {
  PassthroughPipeline,
  PassthroughStageName,
  ApiResult,
} from '../types';

/**
 * Base URL for API requests
 */
const API_BASE_URL = 'http://localhost:3001';

/**
 * Handle API response and throw error if unsuccessful
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResult<T>;

  if (!json.success) {
    const errorCode = json.errorCode ?? 'UNKNOWN_ERROR';
    throw new Error(`${json.error || 'Unknown error occurred'} [${errorCode}]`);
  }

  return json.data as T;
}

/**
 * Handle API error response and throw with details
 */
async function handleApiError(response: Response): Promise<never> {
  const json = (await response.json()) as ApiResult<unknown>;
  const errorCode = json.errorCode ?? 'UNKNOWN_ERROR';
  const message = json.error ?? 'Unknown error occurred';
  const details = json.details
    ? ` (${JSON.stringify(json.details)})`
    : '';
  throw new Error(`${message}${details} [${errorCode}]`);
}

/**
 * Start a new passthrough pipeline for a task
 * @param taskId - Task ID to start pipeline for
 * @param resumeFromStage - Optional stage to resume from (for retry scenarios)
 * @returns Promise resolving to the created pipeline
 */
export async function startPipeline(
  taskId: string,
  resumeFromStage?: PassthroughStageName | null
): Promise<PassthroughPipeline> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/passthrough/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeFromStage }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await handleResponse<{ pipeline: PassthroughPipeline }>(response);
  return result.pipeline;
}

/**
 * Pause a running pipeline
 * @param taskId - Task ID with pipeline to pause
 * @returns Promise resolving to the updated pipeline
 */
export async function pausePipeline(taskId: string): Promise<PassthroughPipeline> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/passthrough/pause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await handleResponse<{ pipeline: PassthroughPipeline }>(response);
  return result.pipeline;
}

/**
 * Resume a paused pipeline
 * @param taskId - Task ID with pipeline to resume
 * @returns Promise resolving to the updated pipeline
 */
export async function resumePipeline(taskId: string): Promise<PassthroughPipeline> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/passthrough/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await handleResponse<{ pipeline: PassthroughPipeline }>(response);
  return result.pipeline;
}

/**
 * Cancel a pipeline
 * @param taskId - Task ID with pipeline to cancel
 * @returns Promise resolving to the updated pipeline
 */
export async function cancelPipeline(taskId: string): Promise<PassthroughPipeline> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/passthrough/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await handleResponse<{ pipeline: PassthroughPipeline }>(response);
  return result.pipeline;
}

/**
 * Get pipeline status for a task
 * @param taskId - Task ID to get pipeline status for
 * @returns Promise resolving to the pipeline state
 */
export async function getPipelineStatus(taskId: string): Promise<PassthroughPipeline> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/passthrough/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await handleResponse<{ pipeline: PassthroughPipeline }>(response);
  return result.pipeline;
}

/**
 * Retry a failed stage in the pipeline
 * @param taskId - Task ID with pipeline to retry
 * @param stage - Stage name to retry
 * @returns Promise resolving to the updated pipeline
 */
export async function retryStage(
  taskId: string,
  stage: PassthroughStageName
): Promise<PassthroughPipeline> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/passthrough/retry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stage }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await handleResponse<{ pipeline: PassthroughPipeline }>(response);
  return result.pipeline;
}
