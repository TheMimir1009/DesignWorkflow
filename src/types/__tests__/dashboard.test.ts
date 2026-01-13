/**
 * Dashboard Types Tests
 * Validates type definitions for dashboard and analytics
 */
import { describe, it, expect } from 'vitest';
import type {
  DashboardSummary,
  TimelineDataPoint,
  PeriodFilter,
  DashboardState,
  TasksByStatus,
} from '../index';

describe('Dashboard Types', () => {
  describe('TasksByStatus', () => {
    it('should have all TaskStatus keys with number values', () => {
      const tasksByStatus: TasksByStatus = {
        featurelist: 5,
        design: 3,
        prd: 2,
        prototype: 1,
      };

      expect(tasksByStatus.featurelist).toBe(5);
      expect(tasksByStatus.design).toBe(3);
      expect(tasksByStatus.prd).toBe(2);
      expect(tasksByStatus.prototype).toBe(1);
    });
  });

  describe('DashboardSummary', () => {
    it('should have all required fields', () => {
      const summary: DashboardSummary = {
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

      expect(summary.projectId).toBe('project-1');
      expect(summary.totalTasks).toBe(10);
      expect(summary.tasksByStatus.featurelist).toBe(4);
      expect(summary.completionRate).toBe(0.1);
      expect(summary.archivedCount).toBe(5);
      expect(summary.documentsGenerated).toBe(8);
      expect(summary.lastUpdated).toBe('2024-01-01T00:00:00Z');
    });

    it('should calculate completion rate correctly', () => {
      const summary: DashboardSummary = {
        projectId: 'project-1',
        totalTasks: 10,
        tasksByStatus: {
          featurelist: 0,
          design: 0,
          prd: 0,
          prototype: 10,
        },
        completionRate: 1.0,
        archivedCount: 0,
        documentsGenerated: 10,
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      expect(summary.completionRate).toBe(1.0);
    });
  });

  describe('TimelineDataPoint', () => {
    it('should have date and count fields', () => {
      const dataPoint: TimelineDataPoint = {
        date: '2024-01-01',
        tasksCreated: 5,
        tasksCompleted: 3,
        documentsGenerated: 2,
      };

      expect(dataPoint.date).toBe('2024-01-01');
      expect(dataPoint.tasksCreated).toBe(5);
      expect(dataPoint.tasksCompleted).toBe(3);
      expect(dataPoint.documentsGenerated).toBe(2);
    });
  });

  describe('PeriodFilter', () => {
    it('should accept valid period values', () => {
      const daily: PeriodFilter = 'daily';
      const weekly: PeriodFilter = 'weekly';
      const monthly: PeriodFilter = 'monthly';

      expect(daily).toBe('daily');
      expect(weekly).toBe('weekly');
      expect(monthly).toBe('monthly');
    });
  });

  describe('DashboardState', () => {
    it('should have all state fields', () => {
      const state: DashboardState = {
        summary: null,
        timeline: [],
        periodFilter: 'weekly',
        isLoading: false,
        error: null,
      };

      expect(state.summary).toBeNull();
      expect(state.timeline).toEqual([]);
      expect(state.periodFilter).toBe('weekly');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle populated state', () => {
      const state: DashboardState = {
        summary: {
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
        },
        timeline: [
          {
            date: '2024-01-01',
            tasksCreated: 5,
            tasksCompleted: 3,
            documentsGenerated: 2,
          },
        ],
        periodFilter: 'monthly',
        isLoading: true,
        error: 'Test error',
      };

      expect(state.summary).not.toBeNull();
      expect(state.timeline).toHaveLength(1);
      expect(state.periodFilter).toBe('monthly');
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('Test error');
    });
  });
});
