/**
 * Project Service - API Communication Layer
 * Handles all CRUD operations for projects via REST API
 */
import type { Project, CreateProjectDto, UpdateProjectDto, ApiResponse } from '../types';

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
 * Fetch all projects from the API
 * @returns Promise resolving to array of projects sorted by createdAt descending
 */
export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects`);
  return handleResponse<Project[]>(response);
}

/**
 * Fetch a single project by ID
 * @param id - Project ID
 * @returns Promise resolving to the project
 * @throws Error if project not found
 */
export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
  return handleResponse<Project>(response);
}

/**
 * Create a new project
 * @param data - Project creation data
 * @returns Promise resolving to the created project
 * @throws Error if validation fails or duplicate name exists
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(response);
}

/**
 * Update an existing project
 * @param id - Project ID
 * @param data - Project update data
 * @returns Promise resolving to the updated project
 * @throws Error if project not found or validation fails
 */
export async function updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(response);
}

/**
 * Delete a project
 * @param id - Project ID
 * @returns Promise resolving when deletion is complete
 * @throws Error if project not found
 */
export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}
