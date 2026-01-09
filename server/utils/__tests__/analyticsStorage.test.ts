/**
 * Analytics Storage Utility Tests
 * Tests for analytics calculation functions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateSummary,
  calculateTimeline,
  aggregateByPeriod,
} from '../analyticsStorage.ts';
import type { Task, Archive } from '../../../src/types/index.ts';

// Mock taskStorage and archiveStorage
vi.mock('../taskStorage.ts', () => ({
  getTasksByProject: vi.fn(),
}));

vi.mock('../archiveStorage.ts', () => ({
  getArchivesByProject: vi.fn(),
}));

import * as taskStorage from '../taskStorage.ts';
import * as archiveStorage from '../archiveStorage.ts';

describe('Analytics Storage', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      projectId: 'project-1',
      title: 'Task 1',
      status: 'featurelist',
      featureList: 'Feature list content',
      designDocument: null,
      prd: null,
      prototype: null,
      references: [],
      qaAnswers: [],
      revisions: [],
      isArchived: false,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 'task-2',
      projectId: 'project-1',
      title: 'Task 2',
      status: 'design',
      featureList: 'Feature list content',
      designDocument: 'Design doc',
      prd: null,
      prototype: null,
      references: [],
      qaAnswers: [],
      revisions: [],
      isArchived: false,
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T15:00:00Z',
    },
    {
      id: 'task-3',
      projectId: 'project-1',
      title: 'Task 3',
      status: 'prd',
      featureList: 'Feature list content',
      designDocument: 'Design doc',
      prd: 'PRD content',
      prototype: null,
      references: [],
      qaAnswers: [],
      revisions: [],
      isArchived: false,
      createdAt: '2024-01-03T10:00:00Z',
      updatedAt: '2024-01-03T15:00:00Z',
    },
    {
      id: 'task-4',
      projectId: 'project-1',
      title: 'Task 4',
      status: 'prototype',
      featureList: 'Feature list content',
      designDocument: 'Design doc',
      prd: 'PRD content',
      prototype: 'Prototype content',
      references: [],
      qaAnswers: [],
      revisions: [],
      isArchived: false,
      createdAt: '2024-01-04T10:00:00Z',
      updatedAt: '2024-01-04T15:00:00Z',
    },
  ];

  const mockArchives: Archive[] = [
    {
      id: 'archive-1',
      taskId: 'archived-task-1',
      projectId: 'project-1',
      task: { ...mockTasks[0], id: 'archived-task-1', isArchived: true },
      archivedAt: '2024-01-05T10:00:00Z',
    },
    {
      id: 'archive-2',
      taskId: 'archived-task-2',
      projectId: 'project-1',
      task: { ...mockTasks[1], id: 'archived-task-2', isArchived: true },
      archivedAt: '2024-01-06T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateSummary', () => {
    it('should calculate dashboard summary correctly', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce(mockTasks);
      vi.mocked(archiveStorage.getArchivesByProject).mockResolvedValueOnce(mockArchives);

      const summary = await calculateSummary('project-1');

      expect(summary.projectId).toBe('project-1');
      expect(summary.totalTasks).toBe(4);
      expect(summary.tasksByStatus.featurelist).toBe(1);
      expect(summary.tasksByStatus.design).toBe(1);
      expect(summary.tasksByStatus.prd).toBe(1);
      expect(summary.tasksByStatus.prototype).toBe(1);
      expect(summary.archivedCount).toBe(2);
      expect(summary.lastUpdated).toBeDefined();
    });

    it('should calculate completion rate correctly', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce(mockTasks);
      vi.mocked(archiveStorage.getArchivesByProject).mockResolvedValueOnce(mockArchives);

      const summary = await calculateSummary('project-1');

      // 1 task in prototype status out of 4 total tasks = 0.25
      expect(summary.completionRate).toBe(0.25);
    });

    it('should count documents generated correctly', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce(mockTasks);
      vi.mocked(archiveStorage.getArchivesByProject).mockResolvedValueOnce(mockArchives);

      const summary = await calculateSummary('project-1');

      // task-2: designDocument (1)
      // task-3: designDocument + prd (2)
      // task-4: designDocument + prd + prototype (3)
      // Total: 6
      expect(summary.documentsGenerated).toBe(6);
    });

    it('should handle empty project', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce([]);
      vi.mocked(archiveStorage.getArchivesByProject).mockResolvedValueOnce([]);

      const summary = await calculateSummary('project-1');

      expect(summary.totalTasks).toBe(0);
      expect(summary.tasksByStatus.featurelist).toBe(0);
      expect(summary.tasksByStatus.design).toBe(0);
      expect(summary.tasksByStatus.prd).toBe(0);
      expect(summary.tasksByStatus.prototype).toBe(0);
      expect(summary.completionRate).toBe(0);
      expect(summary.archivedCount).toBe(0);
      expect(summary.documentsGenerated).toBe(0);
    });
  });

  describe('calculateTimeline', () => {
    it('should calculate daily timeline correctly', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce(mockTasks);

      const timeline = await calculateTimeline('project-1', 'daily');

      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
      // Each task was created on different days
      expect(timeline.length).toBeGreaterThanOrEqual(4);
    });

    it('should calculate weekly timeline correctly', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce(mockTasks);

      const timeline = await calculateTimeline('project-1', 'weekly');

      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
      // All tasks are in the same week
      expect(timeline.length).toBeGreaterThanOrEqual(1);
    });

    it('should calculate monthly timeline correctly', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce(mockTasks);

      const timeline = await calculateTimeline('project-1', 'monthly');

      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
      // All tasks are in the same month
      expect(timeline.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty project for timeline', async () => {
      vi.mocked(taskStorage.getTasksByProject).mockResolvedValueOnce([]);

      const timeline = await calculateTimeline('project-1', 'daily');

      expect(timeline).toEqual([]);
    });
  });

  describe('aggregateByPeriod', () => {
    it('should aggregate tasks by day', () => {
      const result = aggregateByPeriod(mockTasks, 'daily');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should have entries for each unique day
      expect(result.length).toBe(4); // 4 different days
    });

    it('should aggregate tasks by week', () => {
      const result = aggregateByPeriod(mockTasks, 'weekly');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // All tasks in the same week
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should aggregate tasks by month', () => {
      const result = aggregateByPeriod(mockTasks, 'monthly');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // All tasks in the same month
      expect(result.length).toBe(1);
    });

    it('should count documents generated in each period', () => {
      const result = aggregateByPeriod(mockTasks, 'daily');

      // task-1 (day 1): no documents
      // task-2 (day 2): 1 document (design)
      // task-3 (day 3): 2 documents (design + prd)
      // task-4 (day 4): 3 documents (design + prd + prototype)
      const day2 = result.find((r) => r.date === '2024-01-02');
      const day3 = result.find((r) => r.date === '2024-01-03');
      const day4 = result.find((r) => r.date === '2024-01-04');

      expect(day2?.documentsGenerated).toBe(1);
      expect(day3?.documentsGenerated).toBe(2);
      expect(day4?.documentsGenerated).toBe(3);
    });

    it('should track completed tasks (prototype status)', () => {
      const result = aggregateByPeriod(mockTasks, 'daily');

      // Only task-4 is in prototype status
      const day4 = result.find((r) => r.date === '2024-01-04');
      expect(day4?.tasksCompleted).toBe(1);

      const day1 = result.find((r) => r.date === '2024-01-01');
      expect(day1?.tasksCompleted).toBe(0);
    });

    it('should handle empty tasks array', () => {
      const result = aggregateByPeriod([], 'daily');

      expect(result).toEqual([]);
    });
  });
});
