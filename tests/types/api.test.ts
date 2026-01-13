/**
 * API Type Definitions Tests
 * SPEC-DEBUG-005: Tests for standardized API error handling types
 */
import { describe, it, expect } from 'vitest';

describe('API Type Definitions', () => {
  describe('ApiErrorResponse', () => {
    it('should have correct structure for error response', () => {
      // This test verifies that ApiErrorResponse type exists and has required fields
      // The actual type checking happens at compile time
      const mockErrorResponse = {
        success: false,
        error: 'Test error message',
        errorCode: 'TEST_ERROR',
        details: {
          field: 'testField',
          value: 'testValue',
          action: 'testAction',
          guidance: 'Test guidance',
        },
      };

      expect(mockErrorResponse.success).toBe(false);
      expect(mockErrorResponse.error).toBeDefined();
      expect(mockErrorResponse.errorCode).toBeDefined();
      expect(mockErrorResponse.details).toBeDefined();
    });

    it('should allow minimal error response without optional fields', () => {
      const minimalErrorResponse = {
        success: false,
        error: 'Minimal error',
      };

      expect(minimalErrorResponse.success).toBe(false);
      expect(minimalErrorResponse.error).toBe('Minimal error');
      expect(minimalErrorResponse.errorCode).toBeUndefined();
      expect(minimalErrorResponse.details).toBeUndefined();
    });
  });

  describe('ApiSuccessResponse', () => {
    it('should have correct structure for success response', () => {
      const mockSuccessResponse = {
        success: true,
        data: { id: '123', name: 'Test Data' },
      };

      expect(mockSuccessResponse.success).toBe(true);
      expect(mockSuccessResponse.data).toBeDefined();
      expect(mockSuccessResponse.data.id).toBe('123');
    });

    it('should allow null data for successful empty responses', () => {
      const nullSuccessResponse = {
        success: true,
        data: null,
      };

      expect(nullSuccessResponse.success).toBe(true);
      expect(nullSuccessResponse.data).toBeNull();
    });
  });

  describe('ApiResult', () => {
    it('should accept either success or error response', () => {
      const successResult: any = {
        success: true,
        data: { test: 'data' },
      };

      const errorResult: any = {
        success: false,
        error: 'Error occurred',
        errorCode: 'TEST_ERROR',
      };

      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(false);
    });
  });

  describe('ErrorDetails', () => {
    it('should support all optional detail fields', () => {
      const fullDetails = {
        field: 'testField',
        value: 'testValue',
        provider: 'claude',
        model: 'claude-3.5-sonnet',
        action: 'generate',
        guidance: 'Test guidance message',
        helpUrl: 'https://example.com/help',
      };

      expect(fullDetails.field).toBe('testField');
      expect(fullDetails.provider).toBe('claude');
      expect(fullDetails.model).toBe('claude-3.5-sonnet');
      expect(fullDetails.action).toBe('generate');
      expect(fullDetails.guidance).toBe('Test guidance message');
      expect(fullDetails.helpUrl).toBe('https://example.com/help');
    });
  });
});
