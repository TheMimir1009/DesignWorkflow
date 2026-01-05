/**
 * Q&A Service
 * Frontend API client for Q&A system endpoints
 */
import type {
  QACategory,
  QuestionTemplate,
  QASession,
  QASessionAnswer,
} from '../types/qa';

/**
 * API base URL
 */
const API_BASE = 'http://localhost:3001';

/**
 * Category definition from API
 */
export interface CategoryDefinition {
  id: QACategory;
  name: string;
  description: string;
}

/**
 * Response from saving Q&A answers
 */
export interface SaveQAResponse {
  sessionId: string;
  session: QASession;
}

/**
 * Response from design generation
 */
export interface GenerateDesignResponse {
  message: string;
  task: {
    id: string;
    status: string;
    designDocument: string | null;
  };
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Get questions for a specific category
 */
export async function getQuestions(category: QACategory): Promise<QuestionTemplate> {
  const response = await fetch(`${API_BASE}/api/questions/${category}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result: ApiResponse<QuestionTemplate> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch questions');
  }

  return result.data;
}

/**
 * Get all available categories
 */
export async function getCategories(): Promise<CategoryDefinition[]> {
  const response = await fetch(`${API_BASE}/api/questions`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const result: ApiResponse<CategoryDefinition[]> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch categories');
  }

  return result.data;
}

/**
 * Save Q&A answers for a task
 */
export async function saveQAAnswers(
  taskId: string,
  category: QACategory,
  answers: QASessionAnswer[],
  currentStep: number,
  isComplete: boolean = false
): Promise<SaveQAResponse> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      answers,
      currentStep,
      isComplete,
    }),
  });

  const result: ApiResponse<SaveQAResponse> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to save Q&A answers');
  }

  return result.data;
}

/**
 * Get Q&A session for a task
 */
export async function getQASession(taskId: string): Promise<QASession | null> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/qa`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 404) {
    return null;
  }

  const result: ApiResponse<QASession> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    return null;
  }

  return result.data;
}

/**
 * Trigger design document generation for a task
 */
export async function triggerDesignGeneration(
  taskId: string
): Promise<GenerateDesignResponse> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/generate-design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  const result: ApiResponse<GenerateDesignResponse> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to generate design document');
  }

  return result.data;
}
