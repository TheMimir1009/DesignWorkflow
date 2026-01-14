/**
 * Error Builder Utilities
 * SPEC-DEBUG-005: Standardized error response building functions
 */
import type { ApiErrorResponse, ErrorDetails, ErrorCodeType } from '../../src/types/api.ts';
import { ErrorCode } from '../../src/types/api.ts';

/**
 * Build a standardized error response
 * SPEC-DEBUG-005: REQ-ERR-001 - Creates properly formatted error responses
 *
 * @param message - Human-readable error message
 * @param code - Machine-readable error code
 * @param details - Additional error context (optional)
 * @returns Formatted error response object
 */
export function buildErrorResponse(
  message: string,
  code: ErrorCodeType,
  details?: ErrorDetails
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
    errorCode: code,
  };

  if (details) {
    response.details = details;
  }

  return response;
}

/**
 * Build TASK_NOT_FOUND error
 * SPEC-DEBUG-005: REQ-ERR-010 - Error for when a task does not exist
 *
 * @param taskId - The task ID that was not found
 * @returns Formatted error response
 */
export function buildTaskNotFoundError(taskId: string): ApiErrorResponse {
  return buildErrorResponse('Task not found', ErrorCode.TASK_NOT_FOUND, {
    field: 'taskId',
    value: taskId,
  });
}

/**
 * Build PROJECT_NOT_FOUND error
 * SPEC-DEBUG-005: Error for when a project does not exist
 *
 * @param projectId - The project ID that was not found
 * @returns Formatted error response
 */
export function buildProjectNotFoundError(projectId: string): ApiErrorResponse {
  return buildErrorResponse('Project not found', ErrorCode.PROJECT_NOT_FOUND, {
    field: 'projectId',
    value: projectId,
  });
}

/**
 * Build INVALID_CATEGORY error
 * SPEC-DEBUG-005: Error for invalid Q&A category
 *
 * @param category - The invalid category value
 * @returns Formatted error response
 */
export function buildInvalidCategoryError(category: string): ApiErrorResponse {
  return buildErrorResponse(
    `Invalid category: ${category}`,
    ErrorCode.INVALID_CATEGORY,
    {
      value: category,
      guidance: `Valid categories are: game_mechanic, economy, growth`,
    }
  );
}

/**
 * Build MISSING_REQUIRED_FIELD error
 * SPEC-DEBUG-005: Error for missing required field in request
 *
 * @param fieldName - Name of the missing required field
 * @returns Formatted error response
 */
export function buildMissingRequiredFieldError(fieldName: string): ApiErrorResponse {
  // Capitalize first letter of field name for better readability
  const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

  return buildErrorResponse(
    `${capitalizedFieldName} is required`,
    ErrorCode.MISSING_REQUIRED_FIELD,
    {
      field: fieldName,
    }
  );
}

/**
 * Build INVALID_STATUS error
 * SPEC-DEBUG-005: Error for invalid task status
 *
 * @param status - The invalid status value
 * @returns Formatted error response
 */
export function buildInvalidStatusError(status: string): ApiErrorResponse {
  return buildErrorResponse(
    `Invalid status: ${status}`,
    ErrorCode.INVALID_STATUS,
    {
      value: status,
      guidance: 'Valid statuses are: featurelist, design, prd, prototype',
    }
  );
}

/**
 * Build PREREQUISITE_MISSING error
 * SPEC-DEBUG-005: REQ-ERR-011, REQ-ERR-012 - Error for missing prerequisite document
 *
 * @param missingField - Field that is missing (e.g., 'designDocument', 'prd')
 * @param targetStatus - Target status that requires the prerequisite
 * @returns Formatted error response
 */
export function buildPrerequisiteMissingError(
  missingField: string,
  targetStatus: string
): ApiErrorResponse {
  let message: string;
  let action: string;
  let guidance: string;

  if (missingField === 'designDocument') {
    message = 'Design Document is required to generate PRD';
    action = 'complete_design';
    guidance = 'Complete the Q&A session to generate Design Document first';
  } else if (missingField === 'prd') {
    message = 'PRD is required to generate Prototype';
    action = 'generate_prd';
    guidance = 'Generate PRD first before creating Prototype';
  } else {
    message = `${missingField} is required for ${targetStatus}`;
    action = `complete_${missingField}`;
    guidance = `Complete ${missingField} first`;
  }

  return buildErrorResponse(message, ErrorCode.PREREQUISITE_MISSING, {
    field: missingField,
    action,
    guidance,
  });
}

/**
 * Build LLM_CONFIG_MISSING error
 * SPEC-DEBUG-005: REQ-ERR-006 - Error for missing LLM provider configuration
 *
 * @returns Formatted error response
 */
export function buildLLMConfigMissingError(): ApiErrorResponse {
  return buildErrorResponse(
    'LLM provider configuration missing',
    ErrorCode.LLM_CONFIG_MISSING,
    {
      action: 'configure_llm',
      guidance: 'Configure LLM settings in project settings',
    }
  );
}

/**
 * Build LLM_GENERATION_FAILED error
 * SPEC-DEBUG-005: Error when LLM content generation fails
 *
 * @param reason - Reason for the generation failure
 * @param provider - LLM provider name (optional)
 * @param model - Model identifier (optional)
 * @returns Formatted error response
 */
export function buildLLMGenerationFailedError(
  reason: string,
  provider?: string,
  model?: string
): ApiErrorResponse {
  const details: ErrorDetails = {};

  if (provider) {
    details.provider = provider;
  }

  if (model) {
    details.model = model;
  }

  return buildErrorResponse(
    `LLM generation failed: ${reason}`,
    ErrorCode.LLM_GENERATION_FAILED,
    Object.keys(details).length > 0 ? details : undefined
  );
}

/**
 * Build AI_GENERATION_TIMEOUT error
 * SPEC-DEBUG-005: Error when AI generation times out
 *
 * @returns Formatted error response
 */
export function buildAIGenerationTimeoutError(): ApiErrorResponse {
  return buildErrorResponse(
    'AI generation timed out. Please try again.',
    ErrorCode.AI_GENERATION_TIMEOUT,
    {
      guidance: 'The AI generation took too long. Try with a simpler prompt or check your connection.',
    }
  );
}

/**
 * SPEC-PASSTHROUGH-001: Pipeline error builders
 */

/**
 * Build PIPELINE_NOT_FOUND error
 * SPEC-PASSTHROUGH-001: Error when pipeline does not exist
 *
 * @param taskId - The task ID for which pipeline was not found
 * @returns Formatted error response
 */
export function buildPipelineNotFoundError(taskId: string): ApiErrorResponse {
  return buildErrorResponse('Pipeline not found', ErrorCode.PIPELINE_NOT_FOUND, {
    field: 'taskId',
    value: taskId,
    guidance: 'No passthrough pipeline found for this task. Start a new pipeline.',
  });
}

/**
 * Build INVALID_PIPELINE_STATUS error
 * SPEC-PASSTHROUGH-001: Error when pipeline status is invalid
 *
 * @param status - The invalid status value
 * @returns Formatted error response
 */
export function buildInvalidPipelineStatusError(status: string): ApiErrorResponse {
  return buildErrorResponse(
    `Invalid pipeline status: ${status}`,
    ErrorCode.INVALID_PIPELINE_STATUS,
    {
      value: status,
      guidance: 'Valid statuses are: idle, running, paused, completed, failed, cancelled',
    }
  );
}

/**
 * Build PIPELINE_ALREADY_RUNNING error
 * SPEC-PASSTHROUGH-001: Error when trying to start a pipeline that is already running
 *
 * @returns Formatted error response
 */
export function buildPipelineAlreadyRunningError(): ApiErrorResponse {
  return buildErrorResponse(
    'Pipeline is already running',
    ErrorCode.PIPELINE_ALREADY_RUNNING,
    {
      guidance: 'A pipeline is already in progress. Pause or cancel it before starting a new one.',
    }
  );
}

/**
 * Build QA_NOT_COMPLETED error
 * SPEC-PASSTHROUGH-001: Error when trying to start passthrough before Q&A is completed
 *
 * @returns Formatted error response
 */
export function buildQANotCompletedError(): ApiErrorResponse {
  return buildErrorResponse(
    'Q&A session must be completed before starting passthrough',
    ErrorCode.QA_NOT_COMPLETED,
    {
      field: 'qaStatus',
      action: 'complete_qa',
      guidance: 'Complete the Q&A session first before starting the automatic document generation pipeline.',
    }
  );
}

/**
 * Build INVALID_PIPELINE_STAGE error
 * SPEC-PASSTHROUGH-001: Error when pipeline stage is invalid
 *
 * @param stage - The invalid stage value
 * @returns Formatted error response
 */
export function buildInvalidPipelineStageError(stage: string): ApiErrorResponse {
  return buildErrorResponse(
    `Invalid pipeline stage: ${stage}`,
    ErrorCode.INVALID_PIPELINE_STAGE,
    {
      value: stage,
      guidance: 'Valid stages are: design_doc, prd, prototype',
    }
  );
}

/**
 * Build OPERATION_NOT_ALLOWED error
 * SPEC-PASSTHROUGH-001: Error when operation is not allowed for current pipeline state
 *
 * @param operation - The operation that was attempted
 * @param currentStatus - The current pipeline status
 * @returns Formatted error response
 */
export function buildOperationNotAllowedError(
  operation: string,
  currentStatus: string
): ApiErrorResponse {
  return buildErrorResponse(
    `Operation '${operation}' is not allowed when pipeline status is '${currentStatus}'`,
    ErrorCode.OPERATION_NOT_ALLOWED,
    {
      currentStatus,
      operation,
      guidance: 'Check the pipeline status and try a valid operation for this state.',
    }
  );
}
