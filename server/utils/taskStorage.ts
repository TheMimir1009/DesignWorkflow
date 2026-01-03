/**
 * Task Storage Utilities
 * File system operations for task persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { Task, TaskStatus } from '../../src/types/index.ts';
import { WORKSPACE_PATH } from './projectStorage.ts';

/**
 * Valid task statuses
 */
const VALID_STATUSES: TaskStatus[] = ['featurelist', 'design', 'prd', 'prototype'];

/**
 * Check if a status is valid
 */
export function isValidStatus(status: string): status is TaskStatus {
  return VALID_STATUSES.includes(status as TaskStatus);
}

/**
 * Get tasks file path for a project
 */
function getTasksFilePath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'tasks', 'tasks.json');
}

/**
 * Get all tasks for a project
 * @param projectId - Project ID
 * @returns Array of tasks for the project
 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const tasksPath = getTasksFilePath(projectId);

  try {
    const content = await fs.readFile(tasksPath, 'utf-8');
    return JSON.parse(content) as Task[];
  } catch {
    return [];
  }
}

/**
 * Get a task by ID across all projects
 * @param taskId - Task ID to find
 * @returns Task and its project ID if found, null otherwise
 */
export async function getTaskById(taskId: string): Promise<{ task: Task; projectId: string } | null> {
  try {
    const entries = await fs.readdir(WORKSPACE_PATH, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '.gitkeep') {
        const tasks = await getTasksByProject(entry.name);
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          return { task, projectId: entry.name };
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * Save tasks for a project
 * @param projectId - Project ID
 * @param tasks - Tasks array to save
 */
export async function saveProjectTasks(projectId: string, tasks: Task[]): Promise<void> {
  const tasksPath = getTasksFilePath(projectId);
  await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2), 'utf-8');
}

/**
 * Update a task
 * @param taskId - Task ID to update
 * @param updates - Partial task updates
 * @returns Updated task if found, null otherwise
 */
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const result = await getTaskById(taskId);
  if (!result) {
    return null;
  }

  const { task, projectId } = result;
  const tasks = await getTasksByProject(projectId);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  await saveProjectTasks(projectId, tasks);

  return updatedTask;
}

/**
 * Generate mock AI content based on target status
 * In a real implementation, this would call an AI service
 */
export function generateMockAIContent(task: Task, targetStatus: TaskStatus): Partial<Task> {
  const timestamp = new Date().toISOString();

  switch (targetStatus) {
    case 'design':
      return {
        status: 'design',
        designDocument: `[AI Generated Design Document for "${task.title}"]\n\nBased on Feature List:\n${task.featureList}\n\nGenerated at: ${timestamp}`,
      };
    case 'prd':
      return {
        status: 'prd',
        prd: `[AI Generated PRD for "${task.title}"]\n\nBased on Design Document:\n${task.designDocument}\n\nGenerated at: ${timestamp}`,
      };
    case 'prototype':
      return {
        status: 'prototype',
        prototype: `[AI Generated Prototype for "${task.title}"]\n\nBased on PRD:\n${task.prd}\n\nGenerated at: ${timestamp}`,
      };
    default:
      return { status: targetStatus };
  }
}
