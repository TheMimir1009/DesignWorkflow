/**
 * API Response Utilities Tests
 * SPEC-DEBUG-005: Tests for extended API response utility functions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response } from 'express';
import {
  sendApiSuccess,
  sendApiSuccessWithNull,
  sendApiError,
  sendApiErrorFromBuilder,
} from '../../../server/utils/apiResponse.ts';

// Mock Express Response object
const createMockResponse = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('API Response Utilities', () => {
  describe('sendApiSuccess', () => {
    it('should send success response with data', () => {
      const res = createMockResponse();
      const data = { id: '123', name: 'Test' };

      sendApiSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send success response with custom status code', () => {
      const res = createMockResponse();
      const data = { id: '456' };

      sendApiSuccess(res, data, 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should handle complex data structures', () => {
      const res = createMockResponse();
      const data = {
        user: { id: '1', name: 'Test' },
        metadata: { count: 5, total: 10 },
      };

      sendApiSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });
  });

  describe('sendApiSuccessWithNull', () => {
    it('should send success response with null data', () => {
      const res = createMockResponse();

      sendApiSuccessWithNull(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should send success response with null and custom status code', () => {
      const res = createMockResponse();

      sendApiSuccessWithNull(res, 204);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should handle optional resources gracefully', () => {
      const res = createMockResponse();

      sendApiSuccessWithNull(res);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.data).toBeNull();
    });
  });

  describe('sendApiError', () => {
    it('should send error response with message and status code', () => {
      const res = createMockResponse();

      sendApiError(res, 400, 'Invalid input');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid input',
      });
    });

    it('should send error response with error code', () => {
      const res = createMockResponse();

      sendApiError(res, 404, 'Not found', 'TASK_NOT_FOUND');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        errorCode: 'TASK_NOT_FOUND',
      });
    });

    it('should send error response with full details', () => {
      const res = createMockResponse();

      sendApiError(res, 400, 'Invalid field', 'INVALID_FIELD', {
        field: 'testField',
        guidance: 'Test guidance',
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid field',
        errorCode: 'INVALID_FIELD',
        details: {
          field: 'testField',
          guidance: 'Test guidance',
        },
      });
    });

    it('should handle 500 errors', () => {
      const res = createMockResponse();

      sendApiError(res, 500, 'Internal server error');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should handle 404 errors', () => {
      const res = createMockResponse();

      sendApiError(res, 404, 'Resource not found');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found',
      });
    });
  });

  describe('sendApiErrorFromBuilder', () => {
    it('should send error response from ApiErrorResponse object', () => {
      const res = createMockResponse();
      const apiError = {
        success: false,
        error: 'Task not found',
        errorCode: 'TASK_NOT_FOUND',
        details: {
          field: 'taskId',
          value: 'task-123',
        },
      };

      sendApiErrorFromBuilder(res, apiError, 404);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(apiError);
    });

    it('should use default status code if not provided', () => {
      const res = createMockResponse();
      const apiError = {
        success: false,
        error: 'Invalid input',
        errorCode: 'INVALID_INPUT',
      };

      sendApiErrorFromBuilder(res, apiError);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(apiError);
    });

    it('should handle errors without details', () => {
      const res = createMockResponse();
      const apiError = {
        success: false,
        error: 'Server error',
      };

      sendApiErrorFromBuilder(res, apiError, 500);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(apiError);
    });
  });

  describe('Integration with Error Builder', () => {
    it('should work seamlessly with error builder functions', () => {
      const res = createMockResponse();

      // Simulate using error builder
      const errorResponse = {
        success: false,
        error: 'Design Document is required to generate PRD',
        errorCode: 'PREREQUISITE_MISSING',
        details: {
          field: 'designDocument',
          action: 'complete_design',
          guidance: 'Complete the Q&A session to generate Design Document first',
        },
      };

      sendApiErrorFromBuilder(res, errorResponse, 400);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(errorResponse);
    });
  });
});
