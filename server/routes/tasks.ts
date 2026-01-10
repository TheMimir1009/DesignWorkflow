/**
 * Tasks API Routes
 * Handles all task-related endpoints
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
  addGenerationHistoryEntry,
} from '../utils/taskStorage.ts';
import { buildPRDPrompt, buildPrototypePrompt } from '../utils/promptBuilder.ts';
import { callClaudeCode } from '../utils/claudeCodeRunner.ts';

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

    const task = taskResult.task;
    let aiGeneratedContent: Partial<typeof task> = { status: targetStatus as TaskStatus };

    // Generate AI content based on target status
    if (targetStatus === 'prd') {
      // PRD generation requires Design Document
      if (!task.designDocument) {
        sendError(res, 400, 'Design Document is required to generate PRD');
        return;
      }

      // Build PRD prompt from GDD (Game Design Document)
      const prompt = buildPRDPrompt(task.designDocument);
      const fullPrompt = `
## Task Information
- Title: ${task.title}

${prompt}

## Additional Instructions
- Write the PRD in Korean (한국어)
- Focus on practical implementation details for developers
- Extract technical requirements from the Game Design Document
`;

      try {
        const result = await callClaudeCode(fullPrompt, process.cwd(), {
          timeout: 300000, // 5 minutes
          allowedTools: ['Read', 'Grep'],
        });

        // Extract content from result (Claude Code returns { result: "content" })
        let generatedContent: string;
        if (result.output && typeof result.output === 'object' && 'result' in result.output) {
          generatedContent = (result.output as { result: string }).result;
        } else if (result.rawOutput) {
          try {
            const parsed = JSON.parse(result.rawOutput);
            generatedContent = parsed.result || result.rawOutput;
          } catch {
            generatedContent = result.rawOutput;
          }
        } else {
          throw new Error('No content generated from Claude Code');
        }
        aiGeneratedContent = {
          status: 'prd' as TaskStatus,
          prd: generatedContent,
        };

        // Record generation history (SPEC-MODELHISTORY-001)
        try {
          await addGenerationHistoryEntry(taskResult.projectId, id, {
            documentType: 'prd',
            action: 'create',
            provider: 'claude-code',
            model: 'claude-3.5-sonnet',
          });
        } catch (historyError) {
          console.error('Failed to record PRD generation history:', historyError);
        }
      } catch (aiError) {
        console.error('AI PRD generation failed:', aiError);
        sendError(res, 500, 'Failed to generate PRD with AI');
        return;
      }
    } else if (targetStatus === 'prototype') {
      // Prototype generation requires PRD
      if (!task.prd) {
        sendError(res, 400, 'PRD is required to generate Prototype');
        return;
      }

      // Build Prototype prompt from PRD
      const prompt = buildPrototypePrompt(task.prd);
      const fullPrompt = `
## Task Information
- Title: ${task.title}

${prompt}

## Additional Instructions
- Generate a single, self-contained HTML file
- Include all CSS and JavaScript inline
- Use Tailwind CSS via CDN for styling
- Make the prototype interactive and visually appealing
- Include Korean text where appropriate
`;

      try {
        const result = await callClaudeCode(fullPrompt, process.cwd(), {
          timeout: 300000, // 5 minutes
          allowedTools: ['Read', 'Grep'],
        });

        // Extract content from result (Claude Code returns { result: "content" })
        let generatedContent: string;
        if (result.output && typeof result.output === 'object' && 'result' in result.output) {
          generatedContent = (result.output as { result: string }).result;
        } else if (result.rawOutput) {
          try {
            const parsed = JSON.parse(result.rawOutput);
            generatedContent = parsed.result || result.rawOutput;
          } catch {
            generatedContent = result.rawOutput;
          }
        } else {
          throw new Error('No content generated from Claude Code');
        }
        aiGeneratedContent = {
          status: 'prototype' as TaskStatus,
          prototype: generatedContent,
        };

        // Record generation history (SPEC-MODELHISTORY-001)
        try {
          await addGenerationHistoryEntry(taskResult.projectId, id, {
            documentType: 'prototype',
            action: 'create',
            provider: 'claude-code',
            model: 'claude-3.5-sonnet',
          });
        } catch (historyError) {
          console.error('Failed to record Prototype generation history:', historyError);
        }
      } catch (aiError) {
        console.error('AI Prototype generation failed:', aiError);
        sendError(res, 500, 'Failed to generate Prototype with AI');
        return;
      }
    } else {
      // For other statuses (featurelist, design), just update status
      // Design document is generated via Q&A flow, not here
      aiGeneratedContent = { status: targetStatus as TaskStatus };
    }

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
