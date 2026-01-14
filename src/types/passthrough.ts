/**
 * Passthrough Pipeline Type Definitions
 * Types for the automatic pipeline that generates Design Doc -> PRD -> Prototype
 */

/**
 * Pipeline stage names in execution order
 */
export type PassthroughStageName = 'design_doc' | 'prd' | 'prototype';

/**
 * Alias for PipelineStage for API compatibility
 */
export type PipelineStage = PassthroughStageName;

/**
 * Status of a single pipeline stage
 */
export type PassthroughStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Status of the overall pipeline
 */
export type PassthroughPipelineStatus = 'idle' | 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Alias for PipelineStatus for API compatibility
 */
export type PipelineStatus = PassthroughPipelineStatus;

/**
 * Error information for failed stages
 */
export interface PassthroughStageError {
  /** Error message */
  message: string;
  /** Error code for categorization */
  code: string;
  /** Stack trace if available */
  stack?: string;
  /** Number of retry attempts (SPEC-PASSTHROUGH-001) */
  retryCount?: number;
}

/**
 * Single stage in the pipeline
 */
export interface PassthroughStage {
  /** Unique stage identifier */
  id: string;
  /** Stage name */
  name: PassthroughStageName;
  /** Display name for UI */
  displayName: string;
  /** Current status of this stage */
  status: PassthroughStageStatus;
  /** ISO timestamp when stage started */
  startedAt: string | null;
  /** ISO timestamp when stage completed */
  completedAt: string | null;
  /** Error if stage failed */
  error: PassthroughStageError | null;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Complete pipeline execution state
 */
export interface PassthroughPipeline {
  /** Unique pipeline identifier */
  id: string;
  /** Associated task ID */
  taskId: string;
  /** Q&A session ID that triggered this pipeline */
  qaSessionId: string;
  /** Overall pipeline status */
  status: PassthroughPipelineStatus;
  /** Current stage being executed (null if not started) */
  currentStage: PassthroughStageName | null;
  /** All stages in the pipeline */
  stages: PassthroughStage[];
  /** ISO timestamp when pipeline was created */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** ISO timestamp when pipeline started */
  startedAt: string | null;
  /** ISO timestamp when pipeline completed */
  completedAt: string | null;
}

/**
 * Result of pipeline execution
 */
export interface PassthroughPipelineResult {
  /** Pipeline ID */
  pipelineId: string;
  /** Task ID */
  taskId: string;
  /** Final status */
  status: PassthroughPipelineStatus;
  /** Generated design document ID */
  designDocId: string | null;
  /** Generated PRD document ID */
  prdDocId: string | null;
  /** Generated prototype ID */
  prototypeId: string | null;
  /** Completion timestamp */
  completedAt: string | null;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation error messages */
  errors: string[];
}

/**
 * Request body for starting a passthrough pipeline
 */
export interface StartPassthroughRequest {
  /** Optional stage to resume from (for retry scenarios) */
  resumeFromStage?: PassthroughStageName | null;
  /** @deprecated Use resumeFromStage instead */
  resumeFrom?: PassthroughStageName | null;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a stage is currently active (pending, running)
 */
export function isStageActive(stage: PassthroughStage): boolean {
  return stage.status === 'pending' || stage.status === 'running';
}

/**
 * Check if pipeline is currently running (running or paused)
 */
export function isPipelineRunning(pipeline: PassthroughPipeline): boolean {
  return pipeline.status === 'running' || pipeline.status === 'paused';
}

/**
 * Check if pipeline has completed successfully
 */
export function isPipelineCompleted(pipeline: PassthroughPipeline): boolean {
  return pipeline.status === 'completed';
}

/**
 * Get the next stage in the pipeline sequence
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

// ============================================================================
// Validators
// ============================================================================

/**
 * Validate a stage's data integrity
 */
export function validateStage(stage: PassthroughStage): ValidationResult {
  const errors: string[] = [];

  // Validate progress range
  if (stage.progress < 0 || stage.progress > 100) {
    errors.push('Progress must be between 0 and 100');
  }

  // Validate status-specific requirements
  if (stage.status === 'completed') {
    if (!stage.startedAt) {
      errors.push('Completed stage must have startedAt timestamp');
    }
    if (!stage.completedAt) {
      errors.push('Completed stage must have completedAt timestamp');
    }
    if (stage.progress !== 100) {
      errors.push('Completed stage must have 100% progress');
    }
  }

  if (stage.status === 'failed' && !stage.error) {
    errors.push('Failed stage must have an error');
  }

  if (stage.status === 'running' && !stage.startedAt) {
    errors.push('Running stage must have startedAt timestamp');
  }

  if (stage.status === 'cancelled' && !stage.startedAt) {
    errors.push('Cancelled stage must have startedAt timestamp');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a pipeline's data integrity
 */
export function validatePipeline(pipeline: PassthroughPipeline): ValidationResult {
  const errors: string[] = [];

  // Validate status-specific requirements
  if (pipeline.status === 'completed') {
    if (!pipeline.completedAt) {
      errors.push('Completed pipeline must have completedAt timestamp');
    }
    if (pipeline.currentStage !== null) {
      errors.push('Completed pipeline must not have a current stage');
    }
  }

  if ((pipeline.status === 'running' || pipeline.status === 'paused') && !pipeline.startedAt) {
    errors.push('Running or paused pipeline must have startedAt timestamp');
  }

  // Validate stage order
  if (pipeline.stages.length > 0) {
    const stageOrder: PassthroughStageName[] = ['design_doc', 'prd', 'prototype'];
    for (let i = 0; i < pipeline.stages.length; i++) {
      const stage = pipeline.stages[i];
      const expectedIndex = stageOrder.indexOf(stage.name);
      if (expectedIndex !== i) {
        errors.push(`Stage "${stage.name}" is in wrong position`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
