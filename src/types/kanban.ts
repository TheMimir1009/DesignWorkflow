/**
 * Kanban Board Type Definitions
 * Column definitions and helper functions for the Kanban board workflow
 */

// Re-export TaskStatus from main types for convenience
export type { TaskStatus } from './index';
import type { TaskStatus } from './index';

/**
 * Kanban column definition interface
 */
export interface KanbanColumnDef {
  /** Column identifier matching TaskStatus */
  id: TaskStatus;
  /** Display title for the column header */
  title: string;
  /** Whether moving to this column should trigger AI generation */
  triggerAI: boolean;
}

/**
 * Kanban column definitions in order
 * - featurelist: Starting point, no AI trigger
 * - design: Generate Design Document from Feature List
 * - prd: Generate PRD from Design Document
 * - prototype: Generate Prototype from PRD
 */
export const KANBAN_COLUMNS: readonly KanbanColumnDef[] = [
  { id: 'featurelist', title: 'Feature List', triggerAI: false },
  { id: 'design', title: 'Design Doc', triggerAI: true },
  { id: 'prd', title: 'PRD', triggerAI: true },
  { id: 'prototype', title: 'Prototype', triggerAI: true },
] as const;

/**
 * Get the index of a column by its status
 * @param status - Task status to find
 * @returns Index of the column, or -1 if not found
 */
export function getColumnIndex(status: TaskStatus): number {
  return KANBAN_COLUMNS.findIndex((col) => col.id === status);
}

/**
 * Get the next status in the workflow
 * @param currentStatus - Current task status
 * @returns Next status or null if at the last column
 */
export function getNextStatus(currentStatus: TaskStatus): TaskStatus | null {
  const currentIndex = getColumnIndex(currentStatus);
  if (currentIndex === -1 || currentIndex >= KANBAN_COLUMNS.length - 1) {
    return null;
  }
  return KANBAN_COLUMNS[currentIndex + 1].id;
}

/**
 * Get the previous status in the workflow
 * @param currentStatus - Current task status
 * @returns Previous status or null if at the first column
 */
export function getPreviousStatus(currentStatus: TaskStatus): TaskStatus | null {
  const currentIndex = getColumnIndex(currentStatus);
  if (currentIndex <= 0) {
    return null;
  }
  return KANBAN_COLUMNS[currentIndex - 1].id;
}

/**
 * Check if a movement is forward in the workflow
 * Forward movement triggers AI generation
 * @param fromStatus - Source status
 * @param toStatus - Target status
 * @returns true if moving forward, false otherwise
 */
export function isForwardMovement(fromStatus: TaskStatus, toStatus: TaskStatus): boolean {
  const fromIndex = getColumnIndex(fromStatus);
  const toIndex = getColumnIndex(toStatus);
  return toIndex > fromIndex;
}
