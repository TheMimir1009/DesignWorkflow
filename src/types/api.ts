/**
 * API Error Handling & Response Standardization Types
 * SPEC-DEBUG-005: Standardized API response and error handling interfaces
 */

/**
 * Error details for additional context in error responses
 * SPEC-DEBUG-005: Provides structured error information for clients
 */
export interface ErrorDetails {
  /** Field that caused the error */
  field?: string;
  /** Value that caused the error */
  value?: string;
  /** LLM provider name (for LLM-related errors) */
  provider?: string;
  /** Model identifier (for LLM-related errors) */
  model?: string;
  /** Suggested action to resolve the error */
  action?: string;
  /** Guidance message for resolving the error */
  guidance?: string;
  /** URL to help documentation */
  helpUrl?: string;
  /** Current status when error occurred (for pipeline-related errors) */
  currentStatus?: string;
  /** Operation being performed when error occurred (SPEC-PASSTHROUGH-001) */
  operation?: string;
}

/**
 * Standard API error response format
 * SPEC-DEBUG-005: REQ-ERR-001 - All API endpoints use this standardized error response
 */
export interface ApiErrorResponse {
  /** Indicates the response is an error */
  success: false;
  /** Human-readable error message */
  error: string;
  /** Machine-readable error code for client-side handling */
  errorCode?: string;
  /** Additional error context and details */
  details?: ErrorDetails;
}

/**
 * Standard API success response format
 * SPEC-DEBUG-005: REQ-ERR-003 - All successful responses use this standardized format
 */
export interface ApiSuccessResponse<T> {
  /** Indicates the response is successful */
  success: true;
  /** Response data (can be null for successful operations with no return value) */
  data: T;
}

/**
 * Union type for all API responses
 * SPEC-DEBUG-005: Combines success and error response types
 */
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Error code constants
 * SPEC-DEBUG-005: Standardized error codes for consistent error handling
 * SPEC-PASSTHROUGH-001: Added passthrough-specific error codes
 */
export const ErrorCode = {
  /** Task with specified ID not found (404) */
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  /** Project with specified ID not found (404) */
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  /** Invalid Q&A category (400) */
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  /** Missing required field in request (400) */
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  /** Invalid task status (400) */
  INVALID_STATUS: 'INVALID_STATUS',
  /** Prerequisite document not created (400) */
  PREREQUISITE_MISSING: 'PREREQUISITE_MISSING',
  /** LLM provider configuration missing (400) */
  LLM_CONFIG_MISSING: 'LLM_CONFIG_MISSING',
  /** LLM content generation failed (500) */
  LLM_GENERATION_FAILED: 'LLM_GENERATION_FAILED',
  /** AI generation timed out (504) */
  AI_GENERATION_TIMEOUT: 'AI_GENERATION_TIMEOUT',
  /** SPEC-PASSTHROUGH-001: Pipeline not found (404) */
  PIPELINE_NOT_FOUND: 'PIPELINE_NOT_FOUND',
  /** SPEC-PASSTHROUGH-001: Invalid pipeline status (400) */
  INVALID_PIPELINE_STATUS: 'INVALID_PIPELINE_STATUS',
  /** SPEC-PASSTHROUGH-001: Pipeline already running (409) */
  PIPELINE_ALREADY_RUNNING: 'PIPELINE_ALREADY_RUNNING',
  /** SPEC-PASSTHROUGH-001: Q&A not completed (400) */
  QA_NOT_COMPLETED: 'QA_NOT_COMPLETED',
  /** SPEC-PASSTHROUGH-001: Invalid pipeline stage (400) */
  INVALID_PIPELINE_STAGE: 'INVALID_PIPELINE_STAGE',
  /** SPEC-PASSTHROUGH-001: Pipeline operation not allowed (405) */
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
} as const;

/**
 * Error code type
 */
export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * HTTP status code mappings for error codes
 * SPEC-DEBUG-005: REQ-ERR-002 - Appropriate HTTP status codes for each error type
 * SPEC-PASSTHROUGH-001: Added passthrough-specific error code mappings
 */
export const ErrorStatusCode: Record<ErrorCodeType, number> = {
  TASK_NOT_FOUND: 404,
  PROJECT_NOT_FOUND: 404,
  INVALID_CATEGORY: 400,
  MISSING_REQUIRED_FIELD: 400,
  INVALID_STATUS: 400,
  PREREQUISITE_MISSING: 400,
  LLM_CONFIG_MISSING: 400,
  LLM_GENERATION_FAILED: 500,
  AI_GENERATION_TIMEOUT: 504,
  PIPELINE_NOT_FOUND: 404,
  INVALID_PIPELINE_STATUS: 400,
  PIPELINE_ALREADY_RUNNING: 409,
  QA_NOT_COMPLETED: 400,
  INVALID_PIPELINE_STAGE: 400,
  OPERATION_NOT_ALLOWED: 405,
};

/**
 * Type guard to check if a response is an error response
 * SPEC-DEBUG-005: Utility function for response type checking
 */
export function isApiErrorResponse<T>(
  response: ApiResult<T>
): response is ApiErrorResponse {
  return !response.success;
}

/**
 * Type guard to check if a response is a success response
 * SPEC-DEBUG-005: Utility function for response type checking
 */
export function isApiSuccessResponse<T>(
  response: ApiResult<T>
): response is ApiSuccessResponse<T> {
  return response.success;
}
