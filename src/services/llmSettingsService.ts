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
} from '../types/llm';
import type { ApiResponse } from '../types';

/**
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
 * Handle API response and throw error if unsuccessful
 */
async function handleResponse<T>(response: Response): Promise<T> {
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
 * Test connection to a provider
 * @param projectId - Project ID
 * @param provider - Provider to test
 * @returns Promise resolving to connection test result
 */
export async function testProviderConnection(
  projectId: string,
  provider: LLMProvider
): Promise<ConnectionTestResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/llm-settings/test-connection/${provider}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return handleResponse<ConnectionTestResult>(response);
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
