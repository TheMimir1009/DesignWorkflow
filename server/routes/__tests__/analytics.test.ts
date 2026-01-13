/**
 * Analytics API Route Tests
 * Tests for analytics endpoints
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { analyticsRouter } from '../analytics.ts';
import type { DashboardSummary, TimelineDataPoint } from '../../../src/types/index.ts';

// Mock analyticsStorage
vi.mock('../../utils/analyticsStorage.ts', () => ({
  calculateSummary: vi.fn(),
  calculateTimeline: vi.fn(),
}));

import * as analyticsStorage from '../../utils/analyticsStorage.ts';

describe('Analytics API Routes', () => {
  let app: Express;

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
    app = express();
    app.use(express.json());
    app.use('/api/projects/:projectId/analytics', analyticsRouter);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/projects/:projectId/analytics/summary', () => {
    it('should return dashboard summary', async () => {
      vi.mocked(analyticsStorage.calculateSummary).mockResolvedValueOnce(mockSummary);

      const response = await request(app)
        .get('/api/projects/project-1/analytics/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSummary);
      expect(analyticsStorage.calculateSummary).toHaveBeenCalledWith('project-1');
    });

    it('should handle errors', async () => {
      vi.mocked(analyticsStorage.calculateSummary).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/projects/project-1/analytics/summary')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/projects/:projectId/analytics/timeline', () => {
    it('should return timeline with default period', async () => {
      vi.mocked(analyticsStorage.calculateTimeline).mockResolvedValueOnce(mockTimeline);

      const response = await request(app)
        .get('/api/projects/project-1/analytics/timeline')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTimeline);
      // Default period is weekly
      expect(analyticsStorage.calculateTimeline).toHaveBeenCalledWith('project-1', 'weekly');
    });

    it('should return timeline with daily period', async () => {
      vi.mocked(analyticsStorage.calculateTimeline).mockResolvedValueOnce(mockTimeline);

      const response = await request(app)
        .get('/api/projects/project-1/analytics/timeline?period=daily')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(analyticsStorage.calculateTimeline).toHaveBeenCalledWith('project-1', 'daily');
    });

    it('should return timeline with monthly period', async () => {
      vi.mocked(analyticsStorage.calculateTimeline).mockResolvedValueOnce(mockTimeline);

      const response = await request(app)
        .get('/api/projects/project-1/analytics/timeline?period=monthly')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(analyticsStorage.calculateTimeline).toHaveBeenCalledWith('project-1', 'monthly');
    });

    it('should reject invalid period', async () => {
      const response = await request(app)
        .get('/api/projects/project-1/analytics/timeline?period=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid period');
    });

    it('should handle errors', async () => {
      vi.mocked(analyticsStorage.calculateTimeline).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/projects/project-1/analytics/timeline')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/projects/:projectId/analytics/export', () => {
    it('should export data as CSV', async () => {
      vi.mocked(analyticsStorage.calculateSummary).mockResolvedValueOnce(mockSummary);
      vi.mocked(analyticsStorage.calculateTimeline).mockResolvedValueOnce(mockTimeline);

      const response = await request(app)
        .get('/api/projects/project-1/analytics/export?format=csv')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('Date,Tasks Created,Tasks Completed,Documents Generated');
    });

    it('should reject unsupported format', async () => {
      const response = await request(app)
        .get('/api/projects/project-1/analytics/export?format=pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unsupported format');
    });

    it('should default to CSV format', async () => {
      vi.mocked(analyticsStorage.calculateSummary).mockResolvedValueOnce(mockSummary);
      vi.mocked(analyticsStorage.calculateTimeline).mockResolvedValueOnce(mockTimeline);

      const response = await request(app)
        .get('/api/projects/project-1/analytics/export')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should handle errors', async () => {
      vi.mocked(analyticsStorage.calculateTimeline).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/projects/project-1/analytics/export?format=csv')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });
});
