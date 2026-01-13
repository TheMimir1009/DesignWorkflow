/**
 * Analytics Storage Utilities
 * Functions for calculating dashboard analytics
 */
import type {
  Task,
  DashboardSummary,
  TimelineDataPoint,
  PeriodFilter,
  TasksByStatus,
} from '../../src/types/index.ts';
import { getTasksByProject } from './taskStorage.ts';
import { getArchivesByProject } from './archiveStorage.ts';

/**
 * Count documents generated for a task
 */
function countDocuments(task: Task): number {
  let count = 0;
  if (task.designDocument) count++;
  if (task.prd) count++;
  if (task.prototype) count++;
  return count;
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get week start date (Monday)
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return getDateString(d);
}

/**
 * Get month string in YYYY-MM format
 */
function getMonthString(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/**
 * Get period key based on filter type
 */
function getPeriodKey(date: Date, period: PeriodFilter): string {
  switch (period) {
    case 'daily':
      return getDateString(date);
    case 'weekly':
      return getWeekStart(date);
    case 'monthly':
      return getMonthString(date);
  }
}

/**
 * Calculate dashboard summary for a project
 * @param projectId - Project ID to calculate summary for
 * @returns Dashboard summary with statistics
 */
export async function calculateSummary(projectId: string): Promise<DashboardSummary> {
  const tasks = await getTasksByProject(projectId);
  const archives = await getArchivesByProject(projectId);

  const tasksByStatus: TasksByStatus = {
    featurelist: 0,
    design: 0,
    prd: 0,
    prototype: 0,
  };

  let documentsGenerated = 0;

  for (const task of tasks) {
    tasksByStatus[task.status]++;
    documentsGenerated += countDocuments(task);
  }

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? tasksByStatus.prototype / totalTasks : 0;

  return {
    projectId,
    totalTasks,
    tasksByStatus,
    completionRate,
    archivedCount: archives.length,
    documentsGenerated,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate timeline data for a project
 * @param projectId - Project ID to calculate timeline for
 * @param period - Time period for aggregation
 * @returns Array of timeline data points
 */
export async function calculateTimeline(
  projectId: string,
  period: PeriodFilter
): Promise<TimelineDataPoint[]> {
  const tasks = await getTasksByProject(projectId);
  return aggregateByPeriod(tasks, period);
}

/**
 * Aggregate tasks by time period
 * @param tasks - Array of tasks to aggregate
 * @param period - Time period for aggregation
 * @returns Array of timeline data points
 */
export function aggregateByPeriod(tasks: Task[], period: PeriodFilter): TimelineDataPoint[] {
  if (tasks.length === 0) {
    return [];
  }

  const periodMap = new Map<
    string,
    { tasksCreated: number; tasksCompleted: number; documentsGenerated: number }
  >();

  for (const task of tasks) {
    const createdDate = new Date(task.createdAt);
    const periodKey = getPeriodKey(createdDate, period);

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        tasksCreated: 0,
        tasksCompleted: 0,
        documentsGenerated: 0,
      });
    }

    const entry = periodMap.get(periodKey)!;
    entry.tasksCreated++;
    entry.documentsGenerated += countDocuments(task);

    if (task.status === 'prototype') {
      entry.tasksCompleted++;
    }
  }

  // Convert map to sorted array
  const result: TimelineDataPoint[] = [];
  const sortedKeys = Array.from(periodMap.keys()).sort();

  for (const key of sortedKeys) {
    const entry = periodMap.get(key)!;
    result.push({
      date: key,
      tasksCreated: entry.tasksCreated,
      tasksCompleted: entry.tasksCompleted,
      documentsGenerated: entry.documentsGenerated,
    });
  }

  return result;
}
