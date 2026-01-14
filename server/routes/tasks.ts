/**
 * Tasks API Routes
 * Handles all task-related endpoints
 *
 * SPEC-DEBUG-004: Added LLM provider selection support
 * SPEC-DEBUG-005: Standardized error handling and response formats
 */
import { Router, type Request, type Response } from 'express';
import type { TaskStatus } from '../../src/types/index.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getProjectById } from '../utils/projectStorage.ts';
import {
  getTasksByProject,
  getTaskById,
  updateTask,
  createTask,
  deleteTask,
  isValidStatus,
  generateMockAIContent,
} from '../utils/taskStorage.ts';

export const tasksRouter = Router();

/**
 * GET /api/projects/:projectId/tasks - Get all tasks for a project
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Response: ApiResponse<Task[]>
 * - 200: List of tasks
 * - 404: Project not found
 * - 500: Server error
 */
export async function getProjectTasks(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    const tasks = await getTasksByProject(projectId);
    sendSuccess(res, tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    sendError(res, 500, 'Failed to get tasks');
  }
}

/**
 * PUT /api/tasks/:id/status - Update task status
 *
 * Path Parameters:
 * - id: Task UUID
 *
 * Request Body:
 * - status: TaskStatus (required)
 *
 * Response: ApiResponse<Task>
 * - 200: Task updated successfully
 * - 400: Invalid status or missing status
 * - 404: Task not found
 * - 500: Server error
 */
tasksRouter.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status is provided
    if (!status) {
      sendError(res, 400, 'Status is required');
      return;
    }

    // Validate status value
    if (!isValidStatus(status)) {
      sendError(res, 400, 'Invalid status. Must be one of: featurelist, design, prd, prototype');
      return;
    }

    // Check if task exists
    const taskResult = await getTaskById(id);
    if (!taskResult) {
      sendError(res, 404, 'Task not found');
      return;
    }

    // Update task
    const updatedTask = await updateTask(id, { status: status as TaskStatus });
    if (!updatedTask) {
      sendError(res, 500, 'Failed to update task');
      return;
    }

    sendSuccess(res, updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    sendError(res, 500, 'Failed to update task status');
  }
});

/**
 * POST /api/tasks/:id/trigger-ai - Trigger AI generation for a task
 *
 * Path Parameters:
 * - id: Task UUID
 *
 * Request Body:
 * - targetStatus: TaskStatus (required) - The status to generate content for
 *
 * Response: ApiResponse<Task>
 * - 200: AI generation successful, task updated
 * - 400: Invalid target status or missing target status
 * - 404: Task not found
 * - 500: Server error
 */
tasksRouter.post('/:id/trigger-ai', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { targetStatus } = req.body;

    // Validate targetStatus is provided
    if (!targetStatus) {
      sendError(res, 400, 'Target status is required');
      return;
    }

    // Validate targetStatus value
    if (!isValidStatus(targetStatus)) {
      sendError(res, 400, 'Invalid target status. Must be one of: featurelist, design, prd, prototype');
      return;
    }

    // Check if task exists
    const taskResult = await getTaskById(id);
    if (!taskResult) {
      sendError(res, 404, 'Task not found');
      return;
    }

    // Generate AI content (mock implementation)
    const aiGeneratedContent = generateMockAIContent(taskResult.task, targetStatus as TaskStatus);

    // Update task with AI generated content
    const updatedTask = await updateTask(id, aiGeneratedContent);
    if (!updatedTask) {
      sendError(res, 500, 'Failed to update task with AI content');
      return;
    }

    sendSuccess(res, updatedTask);
  } catch (error) {
    console.error('Error triggering AI generation:', error);
    sendError(res, 500, 'Failed to trigger AI generation');
  }
});

/**
 * PUT /api/tasks/:id - Update task content
 *
 * Path Parameters:
 * - id: Task UUID
 *
 * Request Body:
 * - title?: string
 * - featureList?: string
 * - designDocument?: string | null
 * - prd?: string | null
 * - prototype?: string | null
 * - references?: string[]
 *
 * Response: ApiResponse<Task>
 * - 200: Task updated successfully
 * - 404: Task not found
 * - 500: Server error
 */
tasksRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if task exists
    const taskResult = await getTaskById(id);
    if (!taskResult) {
      sendError(res, 404, 'Task not found');
      return;
    }

    // Update task
    const updatedTask = await updateTask(id, updates);
    if (!updatedTask) {
      sendError(res, 500, 'Failed to update task');
      return;
    }

    sendSuccess(res, updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    sendError(res, 500, 'Failed to update task');
  }
});

/**
 * DELETE /api/tasks/:id - Delete a task
 *
 * Path Parameters:
 * - id: Task UUID
 *
 * Response: ApiResponse<{ deleted: boolean }>
 * - 200: Task deleted successfully
 * - 404: Task not found
 * - 500: Server error
 */
tasksRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await deleteTask(id);
    if (!deleted) {
      sendError(res, 404, 'Task not found');
      return;
    }

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    sendError(res, 500, 'Failed to delete task');
  }
});

/**
 * POST /api/projects/:projectId/tasks - Create a new task
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Request Body:
 * - title: string (required)
 * - featureList?: string
 * - references?: string[]
 *
 * Response: ApiResponse<Task>
 * - 201: Task created successfully
 * - 400: Missing required fields
 * - 404: Project not found
 * - 500: Server error
 */
export async function createProjectTask(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { title, featureList, references } = req.body;

    // Validate title is provided
    if (!title) {
      sendError(res, 400, 'Title is required');
      return;
    }

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Create task
    const newTask = await createTask({
      title,
      projectId,
      featureList,
      references,
    });

    res.status(201).json({
      success: true,
      data: newTask,
      error: null,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    sendError(res, 500, 'Failed to create task');
  }
}
