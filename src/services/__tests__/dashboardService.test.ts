/**
 * Dashboard Service Tests
 * Tests for dashboard API client functions
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSummary, getTimeline, exportCSV, API_BASE_URL } from '../dashboardService';
import type { DashboardSummary, TimelineDataPoint } from '../../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Dashboard Service', () => {
  const mockSummary: DashboardSummary = {
    projectId: 'project-1',
    totalTasks: 10,
    tasksByStatus: {
      featurelist: 4,
      design: 3,
      prd: 2,
      prototype: 1,
    },
    completionRate: 0.1,
    archivedCount: 5,
    documentsGenerated: 8,
    lastUpdated: '2024-01-01T00:00:00Z',
  };

  const mockTimeline: TimelineDataPoint[] = [
    { date: '2024-01-01', tasksCreated: 5, tasksCompleted: 3, documentsGenerated: 2 },
    { date: '2024-01-02', tasksCreated: 3, tasksCompleted: 2, documentsGenerated: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSummary', () => {
    it('should fetch summary successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSummary }),
      });

      const result = await getSummary('project-1');

      expect(result).toEqual(mockSummary);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/project-1/analytics/summary`
      );
    });

    it('should throw error on HTTP failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getSummary('project-1')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Project not found' }),
      });

      await expect(getSummary('project-1')).rejects.toThrow('Project not found');
    });
  });

  describe('getTimeline', () => {
    it('should fetch timeline with period parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTimeline }),
      });

      const result = await getTimeline('project-1', 'weekly');

      expect(result).toEqual(mockTimeline);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/project-1/analytics/timeline?period=weekly`
      );
    });

    it('should fetch timeline with daily period', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTimeline }),
      });

      await getTimeline('project-1', 'daily');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/project-1/analytics/timeline?period=daily`
      );
    });

    it('should fetch timeline with monthly period', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTimeline }),
      });

      await getTimeline('project-1', 'monthly');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/project-1/analytics/timeline?period=monthly`
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getTimeline('project-1', 'weekly')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('exportCSV', () => {
    it('should export CSV and return blob', async () => {
      const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await exportCSV('project-1');

      expect(result).toEqual(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/project-1/analytics/export?format=csv`
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(exportCSV('project-1')).rejects.toThrow('HTTP error! status: 500');
    });
  });
});
