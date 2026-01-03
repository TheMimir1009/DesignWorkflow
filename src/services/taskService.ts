/**
 * Task Service - API Communication Layer
 * Handles all task-related API operations via REST API
 */
import type { Task, TaskStatus, ApiResponse } from '../types';

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
 * Fetch all tasks for a project
 * @param projectId - Project ID to fetch tasks for
 * @returns Promise resolving to array of tasks
 */
export async function getTasks(projectId: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`);
  return handleResponse<Task[]>(response);
}

/**
 * Update task status
 * @param taskId - Task ID to update
 * @param status - New status to set
 * @returns Promise resolving to the updated task
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Task>(response);
}

/**
 * Trigger AI generation for a task
 * @param taskId - Task ID to trigger AI for
 * @param targetStatus - Target status that determines what to generate
 * @returns Promise resolving to the updated task with generated content
 */
export async function triggerAI(taskId: string, targetStatus: TaskStatus): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/trigger-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetStatus }),
  });
  return handleResponse<Task>(response);
}
