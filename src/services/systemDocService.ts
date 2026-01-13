/**
 * System Document Service - API Communication Layer
<<<<<<< HEAD
 * Handles all CRUD operations for system documents via REST API
=======
 * Handles all system document-related API operations via REST API
>>>>>>> main
 */
import type { SystemDocument, ApiResponse } from '../types';

/**
<<<<<<< HEAD
 * Create System Document DTO
 */
export interface CreateSystemDocumentDto {
=======
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
 * DTO types for create and update operations
 */
export interface CreateSystemDto {
>>>>>>> main
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

<<<<<<< HEAD
/**
 * Update System Document DTO
 */
export interface UpdateSystemDocumentDto {
=======
export interface UpdateSystemDto {
>>>>>>> main
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

/**
<<<<<<< HEAD
 * Base URL for API requests
 */
export const API_BASE_URL = 'http://localhost:3001';

/**
=======
>>>>>>> main
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
<<<<<<< HEAD
 * Fetch all system documents for a project
 * @param projectId - Project ID
 * @returns Promise resolving to array of system documents sorted by createdAt descending
 */
export async function getSystemDocuments(projectId: string): Promise<SystemDocument[]> {
=======
 * Fetch all systems for a project
 * @param projectId - Project ID to fetch systems for
 * @returns Promise resolving to array of system documents
 */
export async function getSystems(projectId: string): Promise<SystemDocument[]> {
>>>>>>> main
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems`);
  return handleResponse<SystemDocument[]>(response);
}

/**
<<<<<<< HEAD
 * Fetch a single system document by ID
 * @param projectId - Project ID
 * @param systemId - System document ID
 * @returns Promise resolving to the system document
 * @throws Error if system document not found
 */
export async function getSystemDocument(projectId: string, systemId: string): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/${systemId}`);
=======
 * Fetch a single system by ID
 * @param systemId - System ID
 * @returns Promise resolving to the system document
 * @throws Error if system not found
 */
export async function getSystem(systemId: string): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/api/systems/${systemId}`);
>>>>>>> main
  return handleResponse<SystemDocument>(response);
}

/**
 * Create a new system document
<<<<<<< HEAD
 * @param projectId - Project ID
 * @param data - System document creation data
 * @returns Promise resolving to the created system document
 * @throws Error if validation fails or duplicate name exists
 */
export async function createSystemDocument(projectId: string, data: CreateSystemDocumentDto): Promise<SystemDocument> {
=======
 * @param projectId - Project ID to create system in
 * @param data - System creation data
 * @returns Promise resolving to the created system document
 * @throws Error if validation fails or project not found
 */
export async function createSystem(projectId: string, data: CreateSystemDto): Promise<SystemDocument> {
>>>>>>> main
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
<<<<<<< HEAD
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
=======
 * @param systemId - System ID to update
 * @param data - System update data
 * @returns Promise resolving to the updated system document
 * @throws Error if system not found or validation fails
 */
export async function updateSystem(systemId: string, data: UpdateSystemDto): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/api/systems/${systemId}`, {
>>>>>>> main
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
<<<<<<< HEAD
 * @param projectId - Project ID
 * @param systemId - System document ID
 * @returns Promise resolving when deletion is complete
 * @throws Error if system document not found
 */
export async function deleteSystemDocument(projectId: string, systemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/systems/${systemId}`, {
=======
 * @param systemId - System ID to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if system not found
 */
export async function deleteSystem(systemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/systems/${systemId}`, {
>>>>>>> main
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}

<<<<<<< HEAD
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
=======
// ============================================================================
// Document-centric API aliases (for integration test compatibility)
// ============================================================================

/**
 * Fetch all system documents for a project (alias for getSystems)
 * @param projectId - Project ID to fetch documents for
 * @returns Promise resolving to array of system documents
 */
export async function getSystemDocuments(projectId: string): Promise<SystemDocument[]> {
  return getSystems(projectId);
}

/**
 * Create a new system document (alias for createSystem)
 * @param projectId - Project ID to create document in
 * @param data - Document creation data
 * @returns Promise resolving to the created system document
 */
export async function createSystemDocument(projectId: string, data: CreateSystemDto): Promise<SystemDocument> {
  return createSystem(projectId, data);
}

/**
 * Update an existing system document (alias for updateSystem)
 * @param _projectId - Project ID (unused but kept for API compatibility)
 * @param documentId - Document ID to update
 * @param data - Document update data
 * @returns Promise resolving to the updated system document
 */
export async function updateSystemDocument(_projectId: string, documentId: string, data: UpdateSystemDto): Promise<SystemDocument> {
  return updateSystem(documentId, data);
}

/**
 * Delete a system document (alias for deleteSystem)
 * @param _projectId - Project ID (unused but kept for API compatibility)
 * @param documentId - Document ID to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteSystemDocument(_projectId: string, documentId: string): Promise<void> {
  return deleteSystem(documentId);
}

/**
 * Fetch all unique categories for a project
 * @param projectId - Project ID to fetch categories for
 * @returns Promise resolving to array of unique category names
 */
export async function getCategories(projectId: string): Promise<string[]> {
  const documents = await getSystems(projectId);
  const categories = [...new Set(documents.map((doc) => doc.category))];
  return categories.sort();
}

/**
 * Fetch all unique tags for a project
 * @param projectId - Project ID to fetch tags for
 * @returns Promise resolving to array of unique tag names
 */
export async function getTags(projectId: string): Promise<string[]> {
  const documents = await getSystems(projectId);
  const allTags = documents.flatMap((doc) => doc.tags);
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags.sort();
>>>>>>> main
}
