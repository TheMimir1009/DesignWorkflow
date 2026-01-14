/**
 * QA Service - API Communication Layer
 * Handles all Q&A-related API operations via REST API
 */
import type {
  Question,
  QASession,
  QACategory,
  CreateQASessionDto,
  UpdateQASessionDto,
} from '../types/qa';
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
 * Fetch all questions
 * @returns Promise resolving to array of questions
 */
export async function getQuestions(): Promise<Question[]> {
  const response = await fetch(`${API_BASE_URL}/api/questions`);
  return handleResponse<Question[]>(response);
}

/**
 * Fetch all categories
 * @returns Promise resolving to array of categories
 */
export async function getCategories(): Promise<QACategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/questions/categories`);
  return handleResponse<QACategory[]>(response);
}

/**
 * Fetch questions by category
 * @param categoryId - Category ID to filter questions
 * @returns Promise resolving to array of questions
 */
export async function getQuestionsByCategory(categoryId: string): Promise<Question[]> {
  const response = await fetch(`${API_BASE_URL}/api/questions/${categoryId}`);
  return handleResponse<Question[]>(response);
}

/**
 * Create a new QA session
 * @param data - Session creation data
 * @returns Promise resolving to the created session
 */
export async function createSession(data: CreateQASessionDto): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<QASession>(response);
}

/**
 * Update a QA session
 * @param sessionId - Session ID to update
 * @param data - Session update data
 * @returns Promise resolving to the updated session
 */
export async function updateSession(
  sessionId: string,
  data: UpdateQASessionDto
): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<QASession>(response);
}

/**
 * Get a QA session by ID
 * @param sessionId - Session ID to retrieve
 * @returns Promise resolving to the session
 */
export async function getSession(sessionId: string): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions/${sessionId}`);
  return handleResponse<QASession>(response);
}

/**
 * Complete a QA session
 * @param sessionId - Session ID to complete
 * @returns Promise resolving to the completed session
 */
export async function completeSession(sessionId: string): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions/${sessionId}/complete`, {
    method: 'POST',
  });
  return handleResponse<QASession>(response);
}
