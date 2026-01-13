/**
 * Dashboard Store Tests
 * Tests for Zustand dashboard store state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useDashboardStore } from '../dashboardStore';
import type { DashboardSummary, TimelineDataPoint } from '../../types';

// Mock dashboardService
vi.mock('../../services/dashboardService', () => ({
  getSummary: vi.fn(),
  getTimeline: vi.fn(),
  exportCSV: vi.fn(),
}));

import * as dashboardService from '../../services/dashboardService';

describe('Dashboard Store', () => {
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
    // Reset store state before each test
    useDashboardStore.setState({
      summary: null,
      timeline: [],
      periodFilter: 'weekly',
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useDashboardStore.getState();

      expect(state.summary).toBeNull();
      expect(state.timeline).toEqual([]);
      expect(state.periodFilter).toBe('weekly');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSummary', () => {
    it('should fetch summary successfully', async () => {
      vi.mocked(dashboardService.getSummary).mockResolvedValueOnce(mockSummary);

      await act(async () => {
        await useDashboardStore.getState().fetchSummary('project-1');
      });

      const state = useDashboardStore.getState();
      expect(state.summary).toEqual(mockSummary);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(dashboardService.getSummary).toHaveBeenCalledWith('project-1');
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: DashboardSummary) => void;
      const promise = new Promise<DashboardSummary>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(dashboardService.getSummary).mockReturnValueOnce(promise);

      const fetchPromise = useDashboardStore.getState().fetchSummary('project-1');

      // Check loading state is true during fetch
      expect(useDashboardStore.getState().isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!(mockSummary);
        await fetchPromise;
      });

      expect(useDashboardStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch summary';
      vi.mocked(dashboardService.getSummary).mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        await useDashboardStore.getState().fetchSummary('project-1');
      });

      const state = useDashboardStore.getState();
      expect(state.summary).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('fetchTimeline', () => {
    it('should fetch timeline successfully', async () => {
      vi.mocked(dashboardService.getTimeline).mockResolvedValueOnce(mockTimeline);

      await act(async () => {
        await useDashboardStore.getState().fetchTimeline('project-1', 'weekly');
      });

      const state = useDashboardStore.getState();
      expect(state.timeline).toEqual(mockTimeline);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(dashboardService.getTimeline).toHaveBeenCalledWith('project-1', 'weekly');
    });

    it('should handle timeline fetch error', async () => {
      const errorMessage = 'Failed to fetch timeline';
      vi.mocked(dashboardService.getTimeline).mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        await useDashboardStore.getState().fetchTimeline('project-1', 'daily');
      });

      const state = useDashboardStore.getState();
      expect(state.timeline).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('setPeriodFilter', () => {
    it('should update period filter', () => {
      act(() => {
        useDashboardStore.getState().setPeriodFilter('daily');
      });

      expect(useDashboardStore.getState().periodFilter).toBe('daily');

      act(() => {
        useDashboardStore.getState().setPeriodFilter('monthly');
      });

      expect(useDashboardStore.getState().periodFilter).toBe('monthly');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      // Set an error first
      useDashboardStore.setState({ error: 'Some error' });

      expect(useDashboardStore.getState().error).toBe('Some error');

      act(() => {
        useDashboardStore.getState().clearError();
      });

      expect(useDashboardStore.getState().error).toBeNull();
    });
  });
});
