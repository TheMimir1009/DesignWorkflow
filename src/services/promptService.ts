/**
 * Prompt Service - API Communication Layer
 * Handles all CRUD operations for prompt templates via REST API
 */
import type {
  PromptTemplate,
  PromptCategory,
  PromptVersion,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
  ApiResponse,
} from '../types';

/**
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
 * Handle API response and throw error if unsuccessful
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error || 'Unknown error occurred');
  }

  return json.data as T;
}

/**
 * Fetch all prompts with optional category filter
 * @param category - Optional category filter
 * @returns Promise resolving to array of prompts sorted by createdAt descending
 */
export async function getPrompts(category?: PromptCategory): Promise<PromptTemplate[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/prompts${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  return handleResponse<PromptTemplate[]>(response);
}

/**
 * Fetch a single prompt by ID
 * @param promptId - Prompt ID
 * @returns Promise resolving to the prompt
 * @throws Error if prompt not found
 */
export async function getPrompt(promptId: string): Promise<PromptTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`);
  return handleResponse<PromptTemplate>(response);
}

/**
 * Create a new prompt
 * @param data - Prompt creation data
 * @returns Promise resolving to the created prompt
 * @throws Error if validation fails
 */
export async function createPrompt(data: CreatePromptTemplateDto): Promise<PromptTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<PromptTemplate>(response);
}

/**
 * Update an existing prompt
 * @param promptId - Prompt ID
 * @param data - Prompt update data
 * @returns Promise resolving to the updated prompt
 * @throws Error if prompt not found or validation fails
 */
export async function updatePrompt(
  promptId: string,
  data: UpdatePromptTemplateDto
): Promise<PromptTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<PromptTemplate>(response);
}

/**
 * Reset prompt to default content
 * @param promptId - Prompt ID
 * @returns Promise resolving to the reset prompt
 * @throws Error if prompt not found
 */
export async function resetPrompt(promptId: string): Promise<PromptTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<PromptTemplate>(response);
}

/**
 * Delete a prompt
 * @param promptId - Prompt ID
 * @returns Promise resolving when deletion is complete
 * @throws Error if prompt not found
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}

/**
 * Fetch version history for a prompt
 * @param promptId - Prompt ID
 * @returns Promise resolving to array of prompt versions
 * @throws Error if prompt not found
 */
export async function getPromptVersions(promptId: string): Promise<PromptVersion[]> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/versions`);
  return handleResponse<PromptVersion[]>(response);
}

/**
 * Fetch available prompt categories
 * @returns Promise resolving to array of categories
 */
export async function getCategories(): Promise<PromptCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/categories`);
  return handleResponse<PromptCategory[]>(response);
}
