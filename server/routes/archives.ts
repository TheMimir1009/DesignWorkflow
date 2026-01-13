/**
 * Archives API Routes
 * Handles all archive-related endpoints
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getProjectById } from '../utils/projectStorage.ts';
import {
  getArchivesByProject,
  getArchiveById,
  createArchive,
  deleteArchive,
  restoreArchive,
} from '../utils/archiveStorage.ts';
import {
  getTasksByProject,
  saveProjectTasks,
} from '../utils/taskStorage.ts';
export const archivesRouter = Router();

/**
 * GET /api/projects/:projectId/archives - Get all archives for a project
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Response: ApiResponse<Archive[]>
 * - 200: List of archives
 * - 404: Project not found
 * - 500: Server error
 */
export async function getProjectArchives(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    const archives = await getArchivesByProject(projectId);
    sendSuccess(res, archives);
  } catch (error) {
    console.error('Error getting archives:', error);
    sendError(res, 500, 'Failed to get archives');
  }
}

/**
 * GET /api/projects/:projectId/archives/:archiveId - Get a single archive
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - archiveId: Archive UUID
 *
 * Response: ApiResponse<Archive>
 * - 200: Archive found
 * - 404: Project or Archive not found
 * - 500: Server error
 */
export async function getProjectArchive(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, archiveId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    const archive = await getArchiveById(projectId, archiveId);
    if (!archive) {
      sendError(res, 404, 'Archive not found');
      return;
    }

    sendSuccess(res, archive);
  } catch (error) {
    console.error('Error getting archive:', error);
    sendError(res, 500, 'Failed to get archive');
  }
}

/**
 * POST /api/projects/:projectId/tasks/:taskId/archive - Archive a task
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - taskId: Task UUID
 *
 * Response: ApiResponse<Archive>
 * - 201: Task archived successfully
 * - 400: Task is not in prototype status
 * - 404: Project or Task not found
 * - 500: Server error
 */
export async function archiveTask(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, taskId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Get tasks for the project
    const tasks = await getTasksByProject(projectId);
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }

    // Check if task is in prototype status
    if (task.status !== 'prototype') {
      sendError(res, 400, 'Only prototype tasks can be archived');
      return;
    }

    // Create archive
    const archive = await createArchive(projectId, taskId, task);

    // Remove task from tasks list
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    await saveProjectTasks(projectId, updatedTasks);

    res.status(201).json({
      success: true,
      data: archive,
      error: null,
    });
  } catch (error) {
    console.error('Error archiving task:', error);
    sendError(res, 500, 'Failed to archive task');
  }
}

/**
 * POST /api/projects/:projectId/archives/:archiveId/restore - Restore an archived task
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - archiveId: Archive UUID
 *
 * Response: ApiResponse<Task>
 * - 200: Archive restored successfully
 * - 404: Project or Archive not found
 * - 500: Server error
 */
export async function restoreArchivedTask(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, archiveId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Restore archive (this also removes it from archives list)
    const restoredTask = await restoreArchive(projectId, archiveId);

    if (!restoredTask) {
      sendError(res, 404, 'Archive not found');
      return;
    }

    // Add restored task back to tasks list
    const tasks = await getTasksByProject(projectId);
    tasks.push(restoredTask);
    await saveProjectTasks(projectId, tasks);

    sendSuccess(res, restoredTask);
  } catch (error) {
    console.error('Error restoring archive:', error);
    sendError(res, 500, 'Failed to restore archive');
  }
}

/**
 * DELETE /api/projects/:projectId/archives/:archiveId - Delete an archive permanently
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - archiveId: Archive UUID
 *
 * Response: ApiResponse<{ deleted: boolean }>
 * - 200: Archive deleted successfully
 * - 404: Project or Archive not found
 * - 500: Server error
 */
export async function deleteProjectArchive(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, archiveId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    const deleted = await deleteArchive(projectId, archiveId);

    if (!deleted) {
      sendError(res, 404, 'Archive not found');
      return;
    }

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting archive:', error);
    sendError(res, 500, 'Failed to delete archive');
  }
}
