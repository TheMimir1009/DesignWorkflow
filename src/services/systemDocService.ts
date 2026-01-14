/**
 * System Document Service - API Communication Layer
 * Handles all CRUD operations for system documents via REST API
 */
import type { SystemDocument, ApiResponse } from '../types';

/**
 * Create System Document DTO
 */
export interface CreateSystemDocumentDto {
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

/**
 * Update System Document DTO
 */
export interface UpdateSystemDocumentDto {
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

/**
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems`);
  return handleResponse<SystemDocument[]>(response);
}

/**
 * Fetch a single system document by ID
 * @param projectId - Project ID
 * @param systemId - System document ID
 * @returns Promise resolving to the system document
 * @throws Error if system document not found
 */
export async function getSystemDocument(projectId: string, systemId: string): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/${systemId}`);
  return handleResponse<SystemDocument>(response);
}

/**
 * Create a new system document
 * @param projectId - Project ID
 * @param data - System document creation data
 * @returns Promise resolving to the created system document
 * @throws Error if validation fails or duplicate name exists
 */
export async function createSystemDocument(projectId: string, data: CreateSystemDocumentDto): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<SystemDocument>(response);
}

/**
 * Update an existing system document
 * @param projectId - Project ID
 * @param systemId - System document ID
 * @param data - System document update data
 * @returns Promise resolving to the updated system document
 * @throws Error if system document not found or validation fails
 */
export async function updateSystemDocument(
  projectId: string,
  systemId: string,
  data: UpdateSystemDocumentDto
): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/${systemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<SystemDocument>(response);
}

/**
 * Delete a system document
 * @param projectId - Project ID
 * @param systemId - System document ID
 * @returns Promise resolving when deletion is complete
 * @throws Error if system document not found
 */
export async function deleteSystemDocument(projectId: string, systemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/${systemId}`, {
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}

/**
 * Fetch unique categories for a project
 * @param projectId - Project ID
 * @returns Promise resolving to array of unique categories sorted alphabetically
 */
export async function getCategories(projectId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/categories`);
  return handleResponse<string[]>(response);
}

/**
 * Fetch unique tags for a project
 * @param projectId - Project ID
 * @returns Promise resolving to array of unique tags sorted alphabetically
 */
export async function getTags(projectId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/tags`);
  return handleResponse<string[]>(response);
}
