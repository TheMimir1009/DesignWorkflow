/**
 * Analytics API Routes
 * Endpoints for dashboard analytics data
 */
import { Router, type Request, type Response } from 'express';
import { calculateSummary, calculateTimeline } from '../utils/analyticsStorage.ts';
import type { PeriodFilter, TimelineDataPoint } from '../../src/types/index.ts';

/**
 * Analytics router
 */
export const analyticsRouter = Router({ mergeParams: true });

/**
 * Valid period values
 */
const VALID_PERIODS: PeriodFilter[] = ['daily', 'weekly', 'monthly'];

/**
 * Check if period is valid
 */
function isValidPeriod(period: string): period is PeriodFilter {
  return VALID_PERIODS.includes(period as PeriodFilter);
}

/**
 * Convert timeline data to CSV format
 */
function timelineToCSV(timeline: TimelineDataPoint[]): string {
  const headers = 'Date,Tasks Created,Tasks Completed,Documents Generated';
  const rows = timeline.map(
    (point) =>
      `${point.date},${point.tasksCreated},${point.tasksCompleted},${point.documentsGenerated}`
  );
  return [headers, ...rows].join('\n');
}

/**
 * GET /api/projects/:projectId/analytics/summary
 * Get dashboard summary for a project
 */
analyticsRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const summary = await calculateSummary(projectId);

    res.json({
      success: true,
      data: summary,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/projects/:projectId/analytics/timeline
 * Get timeline data for a project
 */
analyticsRouter.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const period = (req.query.period as string) || 'weekly';

    if (!isValidPeriod(period)) {
      res.status(400).json({
        success: false,
        data: null,
        error: `Invalid period: ${period}. Must be one of: ${VALID_PERIODS.join(', ')}`,
      });
      return;
    }

    const timeline = await calculateTimeline(projectId, period);

    res.json({
      success: true,
      data: timeline,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/projects/:projectId/analytics/export
 * Export analytics data
 */
analyticsRouter.get('/export', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const format = (req.query.format as string) || 'csv';

    if (format !== 'csv') {
      res.status(400).json({
        success: false,
        data: null,
        error: `Unsupported format: ${format}. Only 'csv' is currently supported.`,
      });
      return;
    }

    // Get data for export
    const timeline = await calculateTimeline(projectId, 'daily');

    // Generate CSV
    const csv = timelineToCSV(timeline);

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${projectId}.csv"`);

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
