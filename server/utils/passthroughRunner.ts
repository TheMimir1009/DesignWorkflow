/**
 * Passthrough Pipeline Runner
 * SPEC-PASSTHROUGH-001: Executes the automatic document generation pipeline
 *
 * Pipeline: Design Doc -> PRD -> Prototype
 * Features: Pause, resume, cancel, retry with LLM integration
 */

import type {
  PassthroughPipeline,
  PassthroughStage,
  PassthroughStageName,
  PassthroughPipelineStatus,
} from '../../src/types/passthrough.ts';
import type { Task } from '../../src/types/index.ts';
import type { LLMProvider } from '../../src/types/llm.ts';
import type { LLMProviderInterface } from './llmProvider.ts';

// Storage operations
import {
  createPipeline,
  savePipeline,
  getPipelineById,
  updatePipelineStatus,
  updateStageProgress,
} from './passthroughStorage.ts';

// Task operations
import { getTaskById, updateTask } from './taskStorage.ts';

// LLM settings
import { getLLMSettingsOrDefault } from './llmSettingsStorage.ts';

// LLM provider
import { createLLMProvider } from './llmProvider.ts';

// Prompt builders
import {
  buildDesignDocumentPrompt,
  buildPRDPrompt,
  buildPrototypePrompt,
} from './promptBuilder.ts';

// Claude Code runner
import { callClaudeCode } from './claudeCodeRunner.ts';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for running a pipeline
 */
export interface PipelineRunnerOptions {
  /** Task ID to run pipeline for */
  taskId: string;
  /** Q&A session ID that triggered the pipeline */
  qaSessionId: string;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Stage to resume from (for retry scenarios) */
  resumeFromStage?: PassthroughStageName | null;
}

/**
 * Options for running a single stage
 */
export interface StageRunnerOptions {
  /** Pipeline being executed */
  pipeline: PassthroughPipeline;
  /** Stage to execute */
  stage: PassthroughStage;
  /** Task context */
  task: Task;
  /** LLM settings to use */
  llmSettings: any;
}

/**
 * Options for handling stage errors
 */
export interface ErrorHandlerOptions {
  /** Pipeline being executed */
  pipeline: PassthroughPipeline;
  /** Stage that failed */
  stage: PassthroughStage;
  /** Error that occurred */
  error: Error;
  /** Current retry count */
  retryCount: number;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
}

// =============================================================================
// Pipeline Execution
// =============================================================================

/**
 * Run the complete passthrough pipeline
 * Executes stages: design_doc -> prd -> prototype
 */
export async function runPipeline(
  options: PipelineRunnerOptions
): Promise<PassthroughPipeline> {
  const { taskId, qaSessionId, maxRetries = 3, resumeFromStage } = options;

  // Get task information
  const taskResult = await getTaskById(taskId);
  if (!taskResult) {
    throw new Error(`Task not found: ${taskId}`);
  }
  const { task, projectId } = taskResult;

  // Get LLM settings
  const llmSettings = await getLLMSettingsOrDefault(projectId);

  // Check if pipeline already exists (resume scenario)
  let pipeline = await getPipelineById(taskId);
  if (!pipeline) {
    // Create new pipeline
    pipeline = await createPipeline({
      taskId,
      qaSessionId,
    });
  }

  // Determine starting stage
  let stageIndex = 0;
  if (resumeFromStage) {
    stageIndex = pipeline.stages.findIndex((s) => s.name === resumeFromStage);
    if (stageIndex === -1) {
      throw new Error(`Invalid resume stage: ${resumeFromStage}`);
    }
  } else if (pipeline.currentStage) {
    // Resume from current stage if pipeline is paused
    stageIndex = pipeline.stages.findIndex((s) => s.name === pipeline.currentStage);
  }

  // Execute each stage
  for (let i = stageIndex; i < pipeline.stages.length; i++) {
    const stage = pipeline.stages[i];

    // Check if pipeline was paused or cancelled before starting stage
    pipeline = await getPipelineById(pipeline.id) || pipeline;

    if (isPipelinePaused(pipeline)) {
      pipeline.status = 'paused';
      await updatePipelineStatus(pipeline.id, 'paused');
      return pipeline;
    }

    if (isPipelineCancelled(pipeline)) {
      pipeline.status = 'cancelled';
      await updatePipelineStatus(pipeline.id, 'cancelled');
      return pipeline;
    }

    // Execute stage with retry logic
    let retryCount = 0;
    let stageCompleted = false;

    while (retryCount <= maxRetries && !stageCompleted) {
      try {
        // Update stage to running (only on first attempt, don't save)
        if (retryCount === 0) {
          const stageIndexInPipeline = pipeline.stages.findIndex((s) => s.id === stage.id);
          pipeline.stages[stageIndexInPipeline].status = 'running';
          pipeline.stages[stageIndexInPipeline].startedAt = new Date().toISOString();
        }

        // Run the stage
        const updatedStage = await runStage({
          pipeline,
          stage,
          task,
          llmSettings,
        });

        // Update stage in pipeline as completed
        const stageIndexInPipeline = pipeline.stages.findIndex((s) => s.id === stage.id);
        pipeline.stages[stageIndexInPipeline] = updatedStage;

        // Save only after successful completion
        await savePipeline(pipeline);
        stageCompleted = true;
      } catch (error) {
        retryCount++;

        // Handle error
        const errorHandlerResult = await handleStageError({
          pipeline,
          stage,
          error: error as Error,
          retryCount,
          maxRetries,
        });

        const stageIndexInPipeline = pipeline.stages.findIndex((s) => s.id === stage.id);
        pipeline.stages[stageIndexInPipeline] = errorHandlerResult;

        if (retryCount >= maxRetries) {
          // Max retries exceeded, fail the pipeline
          pipeline.status = 'failed';
          pipeline.stages[stageIndexInPipeline].status = 'failed';
          await savePipeline(pipeline);
          return pipeline;
        }

        // Save after error for retry tracking
        await savePipeline(pipeline);
      }
    }

    // Update overall progress (don't save, will save after next stage completes)
    pipeline.currentStage = stage.name;
    pipeline.status = 'running';
    if (!pipeline.startedAt) {
      pipeline.startedAt = new Date().toISOString();
    }

    // Calculate progress and update completed stages
    const progress = calculateProgress(pipeline);
    pipeline.stages.forEach((s, idx) => {
      if (idx <= i && s.status === 'completed') {
        pipeline.stages[idx].progress = 100;
      }
    });
  }

  // All stages completed
  pipeline = await getPipelineById(pipeline.id) || pipeline;
  pipeline.status = 'completed';
  pipeline.currentStage = null;
  pipeline.completedAt = new Date().toISOString();
  pipeline.stages.forEach((s) => {
    if (s.status === 'running') {
      s.status = 'completed';
      s.completedAt = pipeline.completedAt!;
      s.progress = 100;
    }
  });

  // Final save for pipeline completion
  await savePipeline(pipeline);
  return pipeline;
}

// =============================================================================
// Stage Execution
// =============================================================================

/**
 * Run a single pipeline stage
 */
export async function runStage(options: StageRunnerOptions): Promise<PassthroughStage> {
  const { pipeline, stage, task, llmSettings } = options;

  // Update progress
  const updatedStage: PassthroughStage = { ...stage, status: 'running', progress: 50 };

  try {
    // Create LLM provider
    const provider = createLLMProvider(llmSettings);

    // Build prompt based on stage
    let prompt = '';
    let result = '';

    switch (stage.name) {
      case 'design_doc':
        prompt = buildDesignDocumentPrompt({
          task: task.featureList,
          qaAnswers: task.qaAnswers,
          references: [],
        });
        result = await generateDocumentContent(provider, prompt, task);
        // Update task with design document
        await updateTask(task.id, { designDocument: result });
        break;

      case 'prd':
        prompt = buildPRDPrompt({
          designDocument: task.designDocument || '',
          references: [],
        });
        result = await generateDocumentContent(provider, prompt, task);
        // Update task with PRD
        await updateTask(task.id, { prd: result });
        break;

      case 'prototype':
        prompt = buildPrototypePrompt({
          prd: task.prd || '',
          techStack: [],
        });
        result = await generatePrototypeCode(provider, prompt, task);
        // Update task with prototype
        await updateTask(task.id, { prototype: result });
        break;

      default:
        throw new Error(`Unknown stage: ${stage.name}`);
    }

    // Stage completed successfully
    updatedStage.status = 'completed';
    updatedStage.progress = 100;
    updatedStage.completedAt = new Date().toISOString();
    updatedStage.error = null;

    return updatedStage;
  } catch (error) {
    // Stage failed
    updatedStage.status = 'failed';
    updatedStage.error = {
      message: (error as Error).message,
      code: 'STAGE_FAILED',
      stack: (error as Error).stack,
    };
    throw error;
  }
}

/**
 * Generate document content using LLM
 */
async function generateDocumentContent(
  provider: LLMProviderInterface,
  prompt: string,
  task: Task
): Promise<string> {
  // Try using provider's generateText method
  if ('generateText' in provider && typeof provider.generateText === 'function') {
    const result = await provider.generateText(prompt);
    return result;
  }

  // Fallback to chat method
  if ('chat' in provider && typeof provider.chat === 'function') {
    const result = await provider.chat([
      { role: 'user', content: prompt },
    ]);
    return result.content || result.text || '';
  }

  // Final fallback to Claude Code runner
  const result = await callClaudeCode(prompt, process.cwd(), { timeout: 120000 });
  if (result.success && result.output) {
    return typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
  }
  throw new Error('Failed to generate document content');
}

/**
 * Generate prototype code using Claude Code
 */
async function generatePrototypeCode(
  provider: LLMProviderInterface,
  prompt: string,
  task: Task
): Promise<string> {
  try {
    const result = await callClaudeCode(prompt, process.cwd(), { timeout: 180000 });
    if (result.success && result.output) {
      return typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
    }
    throw new Error('Failed to generate prototype code');
  } catch (error) {
    throw new Error(`Prototype generation failed: ${(error as Error).message}`);
  }
}

// =============================================================================
// Status Checks
// =============================================================================

/**
 * Check if pipeline is paused
 */
export function isPipelinePaused(pipeline: PassthroughPipeline): boolean {
  return pipeline.status === 'paused';
}

/**
 * Check if pipeline is cancelled
 */
export function isPipelineCancelled(pipeline: PassthroughPipeline): boolean {
  return pipeline.status === 'cancelled';
}

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Handle stage errors with retry logic
 */
export async function handleStageError(
  options: ErrorHandlerOptions
): Promise<PassthroughStage> {
  const { pipeline, stage, error, retryCount, maxRetries = 3 } = options;

  // Update stage with error information
  const updatedStage: PassthroughStage = {
    ...stage,
    error: {
      message: error.message,
      code: error.name || 'STAGE_ERROR',
      stack: error.stack,
      retryCount,
    },
  };

  // If maxRetries was explicitly not provided, fail immediately
  // Otherwise, use retry logic
  if (options.maxRetries === undefined || retryCount >= maxRetries) {
    updatedStage.status = 'failed';
  } else {
    updatedStage.status = 'running';
  }

  return updatedStage;
}

// =============================================================================
// Progress Calculation
// =============================================================================

/**
 * Calculate overall pipeline progress percentage
 */
export function calculateProgress(pipeline: PassthroughPipeline): number {
  const totalStages = pipeline.stages.length;
  if (totalStages === 0) return 0;

  const completedStages = pipeline.stages.filter(
    (s) => s.status === 'completed'
  ).length;
  const runningStages = pipeline.stages.filter(
    (s) => s.status === 'running'
  ).length;

  // Each completed stage contributes 100%, running stages contribute 50%
  const progress = (completedStages * 100 + runningStages * 50) / totalStages;
  return Math.round(progress);
}

/**
 * Get the next stage to execute
 */
export function getNextStage(pipeline: PassthroughPipeline): PassthroughStageName | null {
  const stageOrder: PassthroughStageName[] = ['design_doc', 'prd', 'prototype'];

  if (pipeline.currentStage === null) {
    return stageOrder[0];
  }

  const currentIndex = stageOrder.indexOf(pipeline.currentStage);
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) {
    return null;
  }

  return stageOrder[currentIndex + 1];
}
