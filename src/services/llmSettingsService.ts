/**
 * LLM Settings Service - API Communication Layer
 * Handles all LLM settings operations via REST API
 */
import type {
  ProjectLLMSettings,
  LLMProvider,
  LLMProviderSettings,
  TaskStageConfig,
  ConnectionTestResult,
  ConnectionError,
} from '../types/llm';
import type { ApiResponse } from '../types';

/**
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
 * Default timeout for API requests (30 seconds)
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Handle API response and throw error if unsuccessful
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error || 'Unknown error occurred');
  }

  return json.data as T;
}

/**
 * Wrapper to add timeout to fetch requests
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds
 * @returns Promise resolving to Response
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Fetch LLM settings for a project
 * @param projectId - Project ID
 * @returns Promise resolving to LLM settings (API keys are masked)
 */
export async function getLLMSettings(projectId: string): Promise<ProjectLLMSettings> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/llm-settings`);
  return handleResponse<ProjectLLMSettings>(response);
}

/**
 * Update all LLM settings for a project
 * @param projectId - Project ID
 * @param settings - Partial settings to update
 * @returns Promise resolving to updated settings (API keys are masked)
 */
export async function updateLLMSettings(
  projectId: string,
  settings: Partial<ProjectLLMSettings>
): Promise<ProjectLLMSettings> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/llm-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  return handleResponse<ProjectLLMSettings>(response);
}

/**
 * Update specific provider settings
 * @param projectId - Project ID
 * @param provider - Provider to update
 * @param settings - Partial provider settings to update
 * @returns Promise resolving to updated provider settings (API key is masked)
 */
export async function updateProviderSettings(
  projectId: string,
  provider: LLMProvider,
  settings: Partial<Omit<LLMProviderSettings, 'provider'>>
): Promise<LLMProviderSettings> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/llm-settings/provider/${provider}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    }
  );
  return handleResponse<LLMProviderSettings>(response);
}

/**
 * Update task stage configuration
 * @param projectId - Project ID
 * @param config - Partial task stage config to update
 * @returns Promise resolving to updated task stage config
 */
export async function updateTaskStageConfig(
  projectId: string,
  config: Partial<TaskStageConfig>
): Promise<TaskStageConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/llm-settings/task-stage`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    }
  );
  return handleResponse<TaskStageConfig>(response);
}

/**
 * Test connection to a provider with timeout
 * @param projectId - Project ID
 * @param provider - Provider to test
 * @param timeout - Optional custom timeout in milliseconds
 * @returns Promise resolving to connection test result
 */
export async function testProviderConnection(
  projectId: string,
  provider: LLMProvider,
  timeout?: number
): Promise<ConnectionTestResult> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/projects/${projectId}/llm-settings/test-connection/${provider}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      timeout ?? DEFAULT_TIMEOUT
    );
    return handleResponse<ConnectionTestResult>(response);
  } catch (error) {
    // Handle timeout and network errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        const timeoutError: ConnectionError = {
          code: 'TIMEOUT',
          message: error.message,
          retryable: true,
        };
        return {
          success: false,
          status: 'error',
          error: timeoutError,
          timestamp: new Date().toISOString(),
        };
      }
      if (error.message.includes('HTTP error')) {
        const apiError: ConnectionError = {
          code: 'API_ERROR',
          message: error.message,
          retryable: false,
          details: { originalError: error.message },
        };
        return {
          success: false,
          status: 'error',
          error: apiError,
          timestamp: new Date().toISOString(),
        };
      }
    }
    // Unknown error
    const unknownError: ConnectionError = {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: true,
    };
    return {
      success: false,
      status: 'error',
      error: unknownError,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get available models for a provider
 * @param projectId - Project ID
 * @param provider - Provider to get models for
 * @returns Promise resolving to list of model names
 */
export async function getProviderModels(
  projectId: string,
  provider: LLMProvider
): Promise<string[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/llm-settings/provider/${provider}/models`
  );
  const result = await handleResponse<{ provider: string; models: string[] }>(response);
  return result.models;
}
