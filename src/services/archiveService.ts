/**
 * Archive Service - API Communication Layer
 * Handles all archive-related API operations via REST API
 */
import type { Archive, Task, ApiResponse } from '../types';

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
 * Fetch all archives for a project
 * @param projectId - Project ID to fetch archives for
 * @returns Promise resolving to array of archives
 */
export async function getArchives(projectId: string): Promise<Archive[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/archives`);
  return handleResponse<Archive[]>(response);
}

/**
 * Fetch a single archive
 * @param projectId - Project ID
 * @param archiveId - Archive ID
 * @returns Promise resolving to the archive
 */
export async function getArchive(projectId: string, archiveId: string): Promise<Archive> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/archives/${archiveId}`
  );
  return handleResponse<Archive>(response);
}

/**
 * Archive a task
 * @param projectId - Project ID
 * @param taskId - Task ID to archive
 * @returns Promise resolving to the created archive
 */
export async function archiveTask(projectId: string, taskId: string): Promise<Archive> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/archive`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return handleResponse<Archive>(response);
}

/**
 * Restore an archive back to a task
 * @param projectId - Project ID
 * @param archiveId - Archive ID to restore
 * @returns Promise resolving to the restored task
 */
export async function restoreArchive(projectId: string, archiveId: string): Promise<Task> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/archives/${archiveId}/restore`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return handleResponse<Task>(response);
}

/**
 * Delete an archive permanently
 * @param projectId - Project ID
 * @param archiveId - Archive ID to delete
 * @returns Promise resolving when archive is deleted
 */
export async function deleteArchive(projectId: string, archiveId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/archives/${archiveId}`,
    {
      method: 'DELETE',
    }
  );
  await handleResponse<{ deleted: boolean }>(response);
}
