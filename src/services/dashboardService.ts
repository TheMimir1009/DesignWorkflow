/**
 * Dashboard Service - API Communication Layer
 * Handles all dashboard and analytics API operations via REST API
 */
import type { DashboardSummary, TimelineDataPoint, PeriodFilter, ApiResponse } from '../types';

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
 * Fetch dashboard summary for a project
 * @param projectId - Project ID to fetch summary for
 * @returns Promise resolving to dashboard summary
 */
export async function getSummary(projectId: string): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/analytics/summary`);
  return handleResponse<DashboardSummary>(response);
}

/**
 * Fetch timeline data for a project
 * @param projectId - Project ID to fetch timeline for
 * @param period - Time period for aggregation (daily, weekly, monthly)
 * @returns Promise resolving to array of timeline data points
 */
export async function getTimeline(
  projectId: string,
  period: PeriodFilter
): Promise<TimelineDataPoint[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/analytics/timeline?period=${period}`
  );
  return handleResponse<TimelineDataPoint[]>(response);
}

/**
 * Export analytics data as CSV
 * @param projectId - Project ID to export data for
 * @returns Promise resolving to CSV blob
 */
export async function exportCSV(projectId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/analytics/export?format=csv`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.blob();
}
