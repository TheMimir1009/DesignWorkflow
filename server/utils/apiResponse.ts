/**
 * API Response Utilities (Extended)
 * SPEC-DEBUG-005: Enhanced response formatting with standardized error handling
 * Extends the existing response.ts utilities with new error response format
 */
import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, ErrorDetails, ErrorCodeType } from '../../src/types/api.ts';
import { ErrorStatusCode } from '../../src/types/api.ts';

/**
 * Send a standardized API success response
 * SPEC-DEBUG-005: REQ-ERR-003 - Sends properly formatted success responses
 *
 * @param res - Express response object
 * @param data - Response data
 * @param statusCode - HTTP status code (default 200)
 */
export function sendApiSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
}

/**
 * Send a standardized API success response with null data
 * SPEC-DEBUG-005: REQ-ERR-004 - For optional resources that don't exist
 *
 * @param res - Express response object
 * @param statusCode - HTTP status code (default 200)
 */
export function sendApiSuccessWithNull(res: Response, statusCode: number = 200): void {
  sendApiSuccess(res, null, statusCode);
}

/**
 * Send a standardized API error response
 * SPEC-DEBUG-005: REQ-ERR-001, REQ-ERR-002 - Sends properly formatted error responses
 *
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param message - Human-readable error message
 * @param errorCode - Machine-readable error code (optional)
 * @param details - Additional error context (optional)
 */
export function sendApiError(
  res: Response,
  statusCode: number,
  message: string,
  errorCode?: ErrorCodeType,
  details?: ErrorDetails
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
  };

  if (errorCode) {
    response.errorCode = errorCode;
  }

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send an API error response from an ApiErrorResponse object
 * SPEC-DEBUG-005: Helper to send pre-built error responses
 *
 * @param res - Express response object
 * @param errorResponse - Pre-built error response object
 * @param statusCode - HTTP status code (default 400)
 */
export function sendApiErrorFromBuilder(
  res: Response,
  errorResponse: ApiErrorResponse,
  statusCode: number = 400
): void {
  res.status(statusCode).json(errorResponse);
}

/**
 * Get HTTP status code for an error code
 * SPEC-DEBUG-005: REQ-ERR-002 - Maps error codes to appropriate HTTP status codes
 *
 * @param errorCode - Error code to look up
 * @returns HTTP status code
 */
export function getStatusCodeForError(errorCode: ErrorCodeType): number {
  return ErrorStatusCode[errorCode] || 500;
}
