/**
 * Response Utilities
 * Standard API response formatting functions
 */
import type { Response } from 'express';
import type { ApiResponse } from '../../src/types/index.ts';

/**
 * Send a standardized API response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param data - Response data (null on error)
 * @param error - Error message (null on success)
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data: T | null,
  error: string | null = null
): void {
  const response: ApiResponse<T> = {
    success: error === null,
    data,
    error,
  };
  res.status(statusCode).json(response);
}

/**
 * Send a success response
 * @param res - Express response object
 * @param data - Response data
 * @param statusCode - HTTP status code (default 200)
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  sendResponse(res, statusCode, data);
}

/**
 * Send an error response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param error - Error message
 */
export function sendError(res: Response, statusCode: number, error: string): void {
  sendResponse(res, statusCode, null, error);
}
