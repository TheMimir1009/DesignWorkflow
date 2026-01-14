/**
 * Passthrough API Routes
 * SPEC-PASSTHROUGH-001: Handles passthrough pipeline endpoints
 *
 * Provides endpoints for:
 * - Starting a passthrough pipeline
 * - Pausing a running pipeline
 * - Resuming a paused pipeline
 * - Canceling a pipeline
 * - Getting pipeline status
 * - Retrying failed stages
 */
import { Router, type Request, type Response } from 'express';
import type {
  PipelineStatus,
  PipelineStage,
  StartPassthroughRequest,
} from '../../src/types/passthrough.ts';
import {
  sendApiSuccess,
  sendApiError,
  sendApiErrorFromBuilder,
} from '../utils/apiResponse.ts';
import {
  buildTaskNotFoundError,
  buildPipelineNotFoundError,
  buildPipelineAlreadyRunningError,
  buildQANotCompletedError,
  buildInvalidPipelineStageError,
  buildOperationNotAllowedError,
  buildMissingRequiredFieldError,
} from '../utils/errorBuilder.ts';
import { getTaskById } from '../utils/taskStorage.ts';
import {
  createPipeline,
  getPipelineByTaskId,
  updatePipelineStatus,
  savePipeline,
} from '../utils/passthroughStorage.ts';

export const passthroughRouter = Router();

/**
 * Validation helper: Check if a stage is valid
 */
function isValidStage(stage: string): stage is PipelineStage {
  return ['design_doc', 'prd', 'prototype'].includes(stage);
}

/**
 * Validation helper: Check if a status is valid
 */
function isValidStatus(status: string): status is PipelineStatus {
  return ['idle', 'running', 'paused', 'completed', 'failed', 'cancelled'].includes(
    status
  );
}

/**
 * Validation helper: Check if operation is allowed for current status
 */
function isOperationAllowed(
  operation: string,
  currentStatus: PipelineStatus
): boolean {
  switch (operation) {
    case 'pause':
      return currentStatus === 'running';
    case 'resume':
      return currentStatus === 'paused';
    case 'cancel':
      return currentStatus === 'running' || currentStatus === 'paused';
    case 'retry':
      return currentStatus === 'failed';
    default:
      return false;
  }
}

/**
 * POST /api/tasks/:taskId/passthrough/start
 * Start a new passthrough pipeline or resume from a specific stage
 */
passthroughRouter.post(
  '/:taskId/passthrough/start',
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const { resumeFromStage } = req.body as StartPassthroughRequest;

    try {
      // Validate task exists
      const taskResult = await getTaskById(taskId);
      if (!taskResult) {
        sendApiErrorFromBuilder(res, buildTaskNotFoundError(taskId), 404);
        return;
      }

      // Check if Q&A is completed
      if (!taskResult.task.qaSession?.isCompleted) {
        sendApiErrorFromBuilder(res, buildQANotCompletedError(), 400);
        return;
      }

      // Check if there's already a running pipeline
      const existingPipeline = await getPipelineByTaskId(taskId);
      if (existingPipeline && existingPipeline.status === 'running') {
        sendApiErrorFromBuilder(res, buildPipelineAlreadyRunningError(), 409);
        return;
      }

      // Validate resumeFromStage if provided
      if (resumeFromStage && !isValidStage(resumeFromStage)) {
        sendApiErrorFromBuilder(res, buildInvalidPipelineStageError(resumeFromStage), 400);
        return;
      }

      // Create new pipeline
      const pipeline = await createPipeline({
        taskId,
        resumeFromStage,
      });

      sendApiSuccess(res, { pipeline, message: 'Pipeline started successfully' });
    } catch (error) {
      sendApiError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to start pipeline'
      );
    }
  }
);

/**
 * POST /api/tasks/:taskId/passthrough/pause
 * Pause a running pipeline
 */
passthroughRouter.post(
  '/:taskId/passthrough/pause',
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
      const pipeline = await getPipelineByTaskId(taskId);

      if (!pipeline) {
        sendApiErrorFromBuilder(res, buildPipelineNotFoundError(taskId), 404);
        return;
      }

      if (!isOperationAllowed('pause', pipeline.status)) {
        sendApiErrorFromBuilder(
          res,
          buildOperationNotAllowedError('pause', pipeline.status),
          405
        );
        return;
      }

      const updatedPipeline = await updatePipelineStatus(taskId, 'paused');
      sendApiSuccess(res, { pipeline: updatedPipeline, message: 'Pipeline paused' });
    } catch (error) {
      sendApiError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to pause pipeline'
      );
    }
  }
);

/**
 * POST /api/tasks/:taskId/passthrough/resume
 * Resume a paused pipeline
 */
passthroughRouter.post(
  '/:taskId/passthrough/resume',
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
      const pipeline = await getPipelineByTaskId(taskId);

      if (!pipeline) {
        sendApiErrorFromBuilder(res, buildPipelineNotFoundError(taskId), 404);
        return;
      }

      if (!isOperationAllowed('resume', pipeline.status)) {
        sendApiErrorFromBuilder(
          res,
          buildOperationNotAllowedError('resume', pipeline.status),
          405
        );
        return;
      }

      const updatedPipeline = await updatePipelineStatus(taskId, 'running');
      sendApiSuccess(res, { pipeline: updatedPipeline, message: 'Pipeline resumed' });
    } catch (error) {
      sendApiError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to resume pipeline'
      );
    }
  }
);

/**
 * POST /api/tasks/:taskId/passthrough/cancel
 * Cancel a running or paused pipeline
 */
passthroughRouter.post(
  '/:taskId/passthrough/cancel',
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
      const pipeline = await getPipelineByTaskId(taskId);

      if (!pipeline) {
        sendApiErrorFromBuilder(res, buildPipelineNotFoundError(taskId), 404);
        return;
      }

      if (!isOperationAllowed('cancel', pipeline.status)) {
        sendApiErrorFromBuilder(
          res,
          buildOperationNotAllowedError('cancel', pipeline.status),
          405
        );
        return;
      }

      const updatedPipeline = await updatePipelineStatus(taskId, 'cancelled');
      sendApiSuccess(res, { pipeline: updatedPipeline, message: 'Pipeline cancelled' });
    } catch (error) {
      sendApiError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to cancel pipeline'
      );
    }
  }
);

/**
 * GET /api/tasks/:taskId/passthrough/status
 * Get the current status of a passthrough pipeline
 */
passthroughRouter.get(
  '/:taskId/passthrough/status',
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
      const pipeline = await getPipelineByTaskId(taskId);

      if (!pipeline) {
        sendApiErrorFromBuilder(res, buildPipelineNotFoundError(taskId), 404);
        return;
      }

      sendApiSuccess(res, { pipeline });
    } catch (error) {
      sendApiError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to get pipeline status'
      );
    }
  }
);

/**
 * POST /api/tasks/:taskId/passthrough/retry
 * Retry a failed stage in the pipeline
 */
passthroughRouter.post(
  '/:taskId/passthrough/retry',
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const { stage } = req.body;

    try {
      // Validate stage parameter
      if (!stage) {
        sendApiErrorFromBuilder(res, buildMissingRequiredFieldError('stage'), 400);
        return;
      }

      if (!isValidStage(stage)) {
        sendApiErrorFromBuilder(res, buildInvalidPipelineStageError(stage), 400);
        return;
      }

      const pipeline = await getPipelineByTaskId(taskId);

      if (!pipeline) {
        sendApiErrorFromBuilder(res, buildPipelineNotFoundError(taskId), 404);
        return;
      }

      if (!isOperationAllowed('retry', pipeline.status)) {
        sendApiErrorFromBuilder(
          res,
          buildOperationNotAllowedError('retry', pipeline.status),
          405
        );
        return;
      }

      // Reset stage status and restart pipeline
      const updatedPipeline = await updatePipelineStatus(taskId, 'running');
      sendApiSuccess(res, { pipeline: updatedPipeline, message: 'Stage retry initiated' });
    } catch (error) {
      sendApiError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to retry stage'
      );
    }
  }
);

/**
 * Register passthrough routes with the main app
 * This function can be imported and called from the main server file
 */
export function registerPassthroughRoutes(app: express.Application): void {
  app.use('/api/tasks', passthroughRouter);
}
