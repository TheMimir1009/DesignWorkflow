/**
 * Template Service - API Communication Layer
 * Handles all CRUD operations for templates via REST API
 */
import type {
  Template,
  TemplateCategory,
  CreateTemplateDto,
  UpdateTemplateDto,
  ApiResponse,
  ApplyTemplateRequest,
  ApplyTemplateResponse,
} from '../types';

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
 * Fetch all templates with optional filters
 * @param category - Optional category filter
 * @param projectId - Optional project ID filter
 * @returns Promise resolving to array of templates sorted by createdAt descending
 */
export async function getTemplates(
  category?: TemplateCategory,
  projectId?: string
): Promise<Template[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (projectId) params.append('projectId', projectId);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/templates${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  return handleResponse<Template[]>(response);
}

/**
 * Fetch a single template by ID
 * @param templateId - Template ID
 * @returns Promise resolving to the template
 * @throws Error if template not found
 */
export async function getTemplate(templateId: string): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`);
  return handleResponse<Template>(response);
}

/**
 * Create a new template
 * @param data - Template creation data
 * @returns Promise resolving to the created template
 * @throws Error if validation fails or duplicate name exists
 */
export async function createTemplate(data: CreateTemplateDto): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Template>(response);
}

/**
 * Update an existing template
 * @param templateId - Template ID
 * @param data - Template update data
 * @returns Promise resolving to the updated template
 * @throws Error if template not found or validation fails
 */
export async function updateTemplate(
  templateId: string,
  data: UpdateTemplateDto
): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Template>(response);
}

/**
 * Delete a template
 * @param templateId - Template ID
 * @returns Promise resolving when deletion is complete
 * @throws Error if template not found or is default
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}

/**
 * Fetch available template categories
 * @returns Promise resolving to array of categories
 */
export async function getCategories(): Promise<TemplateCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/templates/categories`);
  return handleResponse<TemplateCategory[]>(response);
}

/**
 * Apply template with variable values
 * @param templateId - Template ID
 * @param variableValues - Variable values to apply
 * @returns Promise resolving to the applied content
 * @throws Error if template not found or required variables missing
 */
export async function applyTemplate(
  templateId: string,
  variableValues: ApplyTemplateRequest['variableValues']
): Promise<ApplyTemplateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ variableValues }),
  });
  return handleResponse<ApplyTemplateResponse>(response);
}

/**
 * Preview template with default values
 * @param templateId - Template ID
 * @returns Promise resolving to the preview content
 * @throws Error if template not found
 */
export async function previewTemplate(templateId: string): Promise<{ content: string }> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/preview`);
  return handleResponse<{ content: string }>(response);
}
