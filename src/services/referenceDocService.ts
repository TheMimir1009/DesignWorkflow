/**
 * Reference Document Service - API Communication Layer
 * Handles completed document reference API operations for SPEC-DOCREF-002
 */
import type {
  CompletedDocumentSummary,
  CompletedDocumentDetail,
  CompletedDocumentsQueryOptions,
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
 * Build URL with query parameters from options
 */
function buildQueryUrl(
  baseUrl: string,
  options?: CompletedDocumentsQueryOptions
): string {
  if (!options) {
    return baseUrl;
  }

  const params = new URLSearchParams();

  if (options.search) {
    params.append('search', options.search);
  }

  if (options.documentType && options.documentType.length > 0) {
    params.append('documentType', options.documentType.join(','));
  }

  if (options.reference && options.reference.length > 0) {
    params.append('reference', options.reference.join(','));
  }

  if (options.includeArchived !== undefined) {
    params.append('includeArchived', String(options.includeArchived));
  }

  if (options.limit !== undefined) {
    params.append('limit', String(options.limit));
  }

  if (options.offset !== undefined) {
    params.append('offset', String(options.offset));
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Fetch completed documents for a project
 * @param projectId - Project ID to fetch documents for
 * @param options - Optional query parameters for filtering
 * @returns Promise resolving to array of completed document summaries
 */
export async function getCompletedDocuments(
  projectId: string,
  options?: CompletedDocumentsQueryOptions
): Promise<CompletedDocumentSummary[]> {
  const baseUrl = `${API_BASE_URL}/api/projects/${projectId}/completed-documents`;
  const url = buildQueryUrl(baseUrl, options);
  const response = await fetch(url);
  return handleResponse<CompletedDocumentSummary[]>(response);
}

/**
 * Fetch a single completed document detail
 * @param projectId - Project ID
 * @param taskId - Task ID to fetch
 * @returns Promise resolving to the completed document detail
 */
export async function getCompletedDocumentDetail(
  projectId: string,
  taskId: string
): Promise<CompletedDocumentDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/completed-documents/${taskId}`
  );
  return handleResponse<CompletedDocumentDetail>(response);
}
