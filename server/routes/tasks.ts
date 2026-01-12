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
import {
  sendApiSuccess,
  sendApiError,
  sendApiErrorFromBuilder,
} from '../utils/apiResponse.ts';
import {
  buildTaskNotFoundError,
  buildMissingRequiredFieldError,
  buildInvalidStatusError,
  buildPrerequisiteMissingError,
  buildLLMConfigMissingError,
  buildLLMGenerationFailedError,
} from '../utils/errorBuilder.ts';
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
import { getLLMSettingsOrDefault } from '../utils/llmSettingsStorage.ts';
import { createLLMProvider, type LLMProviderInterface } from '../utils/llmProvider.ts';
import {
  getModelConfigForStage,
  isProviderConfigured,
  type LLMModelConfig,
  type TaskStage,
  type LLMProvider,
} from '../../src/types/llm.ts';

export const tasksRouter = Router();

/**
 * LLM Provider Selection Result
 * SPEC-DEBUG-004: Added to support project-specific LLM provider selection
 */
interface LLMProviderSelection {
  provider: LLMProviderInterface;
  config: LLMModelConfig;
  isDefault: boolean;
}

/**
 * Select LLM provider based on project settings and task stage
 * SPEC-DEBUG-004: Copied from generate.ts to support task AI generation with configured providers
 * SPEC-DEBUG-003: Always uses shared logger for debug console
 * Returns the appropriate provider based on project LLM settings
 */
async function selectLLMProvider(
  projectId: string | undefined,
  stage: TaskStage
): Promise<LLMProviderSelection> {
  // If no projectId, use default Claude Code
  if (!projectId) {
    const settings = await getLLMSettingsOrDefault('default');
    const config = settings.taskStageConfig.defaultModel;
    return {
      provider: createLLMProvider({
        provider: 'claude-code',
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'connected',
      }, true), // Enable shared logging
      config,
      isDefault: true,
    };
  }

  // Get project-specific LLM settings
  const settings = await getLLMSettingsOrDefault(projectId);
  const modelConfig = getModelConfigForStage(settings, stage);

  // Check if using default (Claude Code)
  if (modelConfig.provider === 'claude-code') {
    return {
      provider: createLLMProvider({
        provider: 'claude-code',
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'connected',
      }, true), // Enable shared logging
      config: modelConfig,
      isDefault: true,
    };
  }

  // Find the provider settings
  const providerSettings = settings.providers.find(
    (p) => p.provider === modelConfig.provider
  );

  if (!providerSettings) {
    throw new Error(`Provider ${modelConfig.provider} not found in settings`);
  }

  // Check if provider is enabled
  if (!providerSettings.isEnabled) {
    throw new Error(`Provider ${modelConfig.provider} is not enabled. Please enable it in project settings.`);
  }

  // Check if provider is configured (has API key or valid endpoint)
  const isConfigured = providerSettings.provider === 'lmstudio'
    ? (providerSettings.endpoint !== undefined && providerSettings.endpoint.length > 0)
    : (providerSettings.apiKey.length > 0);

  if (!isConfigured) {
    throw new Error(`Provider ${modelConfig.provider} is not configured. Please add API key or configure endpoint.`);
  }

  // Create and return the provider with shared logging
  return {
    provider: createLLMProvider(providerSettings, true), // Enable shared logging
    config: modelConfig,
    isDefault: false,
  };
}

/**
 * Map TaskStatus to TaskStage for LLM provider selection
 * SPEC-DEBUG-004: Added for proper stage-based model selection
 */
function mapStatusToStage(status: TaskStatus): TaskStage {
  switch (status) {
    case 'prd':
      return 'prd';
    case 'prototype':
      return 'prototype';
    default:
      return 'defaultModel';
  }
}

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
 * SPEC-DEBUG-005: Standardized error handling
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
      sendApiErrorFromBuilder(res, buildMissingRequiredFieldError('status'), 400);
      return;
    }

    // Validate status value
    if (!isValidStatus(status)) {
      sendApiErrorFromBuilder(res, buildInvalidStatusError(status), 400);
      return;
    }

    // Check if task exists
    const taskResult = await getTaskById(id);
    if (!taskResult) {
      sendApiErrorFromBuilder(res, buildTaskNotFoundError(id), 404);
      return;
    }

    // Update task
    const updatedTask = await updateTask(id, { status: status as TaskStatus });
    if (!updatedTask) {
      sendApiError(res, 500, 'Failed to update task');
      return;
    }

    sendApiSuccess(res, updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    sendApiError(res, 500, 'Failed to update task status');
  }
});

/**
 * POST /api/tasks/:id/trigger-ai - Trigger AI generation for a task
 * SPEC-DEBUG-005: REQ-ERR-006, REQ-ERR-011, REQ-ERR-012 - Standardized error handling
 *
 * Path Parameters:
 * - id: Task UUID
 *
 * Request Body:
 * - targetStatus: TaskStatus (required) - The status to generate content for
 *
 * Response: ApiResponse<Task>
 * - 200: AI generation successful, task updated
 * - 400: Invalid target status, missing target status, LLM config error, or prerequisite missing
 * - 404: Task not found
 * - 500: Server error
 */
tasksRouter.post('/:id/trigger-ai', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { targetStatus } = req.body;

    // Validate targetStatus is provided
    if (!targetStatus) {
      sendApiErrorFromBuilder(res, buildMissingRequiredFieldError('targetStatus'), 400);
      return;
    }

    // Validate targetStatus value
    if (!isValidStatus(targetStatus)) {
      sendApiErrorFromBuilder(res, buildInvalidStatusError(targetStatus), 400);
      return;
    }

    // Check if task exists
    const taskResult = await getTaskById(id);
    if (!taskResult) {
      sendApiErrorFromBuilder(res, buildTaskNotFoundError(id), 404);
      return;
    }

    const task = taskResult.task;
    let aiGeneratedContent: Partial<typeof task> = { status: targetStatus as TaskStatus };

    // SPEC-DEBUG-005: Generate AI content based on target status using configured LLM provider
    if (targetStatus === 'prd') {
      // SPEC-DEBUG-005: REQ-ERR-011 - PRD generation requires Design Document
      if (!task.designDocument) {
        sendApiErrorFromBuilder(
          res,
          buildPrerequisiteMissingError('designDocument', 'prd'),
          400
        );
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
        // SPEC-DEBUG-004: Select LLM provider based on project settings
        const { provider, config, isDefault } = await selectLLMProvider(
          taskResult.projectId,
          'prd'
        );

        let generatedContent: string;

        // If using default Claude Code, use the claudeCodeRunner
        if (isDefault) {
          const result = await callClaudeCode(fullPrompt, process.cwd(), {
            timeout: 300000,
            allowedTools: ['Read', 'Grep'],
          });

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
        } else {
          // Use selected LLM provider
          const result = await provider.generate(fullPrompt, config, process.cwd());

          if (!result.success) {
            sendApiErrorFromBuilder(
              res,
              buildLLMGenerationFailedError(result.error || 'Unknown error', config.provider as any, config.modelId),
              500
            );
            return;
          }

          generatedContent = result.content as string;
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
            provider: config.provider as LLMProvider,
            model: config.modelId,
          });
        } catch (historyError) {
          console.error('Failed to record PRD generation history:', historyError);
        }
      } catch (aiError) {
        console.error('AI PRD generation failed:', aiError);

        // SPEC-DEBUG-005: REQ-ERR-006 - Return 400 for LLM config errors
        const errorMessage = (aiError as Error).message;
        if (
          errorMessage.includes('Invalid LLM provider') ||
          errorMessage.includes('configuration') ||
          errorMessage.includes('provider')
        ) {
          sendApiErrorFromBuilder(res, buildLLMConfigMissingError(), 400);
          return;
        }

        sendApiError(res, 500, 'Failed to generate PRD with AI');
        return;
      }
    } else if (targetStatus === 'prototype') {
      // SPEC-DEBUG-005: REQ-ERR-012 - Prototype generation requires PRD
      if (!task.prd) {
        sendApiErrorFromBuilder(
          res,
          buildPrerequisiteMissingError('prd', 'prototype'),
          400
        );
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
        // SPEC-DEBUG-004: Select LLM provider based on project settings
        const { provider, config, isDefault } = await selectLLMProvider(
          taskResult.projectId,
          'prototype'
        );

        let generatedContent: string;

        // If using default Claude Code, use the claudeCodeRunner
        if (isDefault) {
          const result = await callClaudeCode(fullPrompt, process.cwd(), {
            timeout: 300000,
            allowedTools: ['Read', 'Grep'],
          });

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
        } else {
          // Use selected LLM provider
          const result = await provider.generate(fullPrompt, config, process.cwd());

          if (!result.success) {
            sendApiErrorFromBuilder(
              res,
              buildLLMGenerationFailedError(result.error || 'Unknown error', config.provider as any, config.modelId),
              500
            );
            return;
          }

          generatedContent = result.content as string;
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
            provider: config.provider as LLMProvider,
            model: config.modelId,
          });
        } catch (historyError) {
          console.error('Failed to record Prototype generation history:', historyError);
        }
      } catch (aiError) {
        console.error('AI Prototype generation failed:', aiError);

        // SPEC-DEBUG-005: REQ-ERR-006 - Return 400 for LLM config errors
        const errorMessage = (aiError as Error).message;
        if (
          errorMessage.includes('Invalid LLM provider') ||
          errorMessage.includes('configuration') ||
          errorMessage.includes('provider')
        ) {
          sendApiErrorFromBuilder(res, buildLLMConfigMissingError(), 400);
          return;
        }

        sendApiError(res, 500, 'Failed to generate Prototype with AI');
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
      sendApiError(res, 500, 'Failed to update task with AI content');
      return;
    }

    sendApiSuccess(res, updatedTask);
  } catch (error) {
    console.error('Error triggering AI generation:', error);
    sendApiError(res, 500, 'Failed to trigger AI generation');
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
 * SPEC-DEBUG-005: Standardized error handling
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
      sendApiErrorFromBuilder(res, buildTaskNotFoundError(id), 404);
      return;
    }

    sendApiSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    sendApiError(res, 500, 'Failed to delete task');
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
