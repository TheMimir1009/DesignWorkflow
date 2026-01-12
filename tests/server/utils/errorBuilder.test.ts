/**
 * Error Builder Tests
 * SPEC-DEBUG-005: Tests for error building utility functions
 */
import { describe, it, expect } from 'vitest';
import {
  buildErrorResponse,
  buildTaskNotFoundError,
  buildProjectNotFoundError,
  buildInvalidCategoryError,
  buildMissingRequiredFieldError,
  buildInvalidStatusError,
  buildPrerequisiteMissingError,
  buildLLMConfigMissingError,
  buildLLMGenerationFailedError,
  buildAIGenerationTimeoutError,
} from '../../../server/utils/errorBuilder.ts';
import type { ApiErrorResponse, ErrorDetails } from '../../../src/types/api.ts';

describe('Error Builder', () => {
  describe('buildErrorResponse', () => {
    it('should build basic error response', () => {
      const error = buildErrorResponse('Test error', 'TEST_ERROR');

      expect(error.success).toBe(false);
      expect(error.error).toBe('Test error');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.details).toBeUndefined();
    });

    it('should build error response with details', () => {
      const details: ErrorDetails = {
        field: 'testField',
        guidance: 'Test guidance',
      };

      const error = buildErrorResponse('Test error', 'TEST_ERROR', details);

      expect(error.success).toBe(false);
      expect(error.error).toBe('Test error');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.details).toEqual(details);
    });

    it('should build error response with all detail fields', () => {
      const details: ErrorDetails = {
        field: 'testField',
        value: 'testValue',
        provider: 'claude',
        model: 'claude-3.5-sonnet',
        action: 'generate',
        guidance: 'Test guidance',
        helpUrl: 'https://example.com/help',
      };

      const error = buildErrorResponse('Test error', 'TEST_ERROR', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('Task Not Found Error', () => {
    it('should build TASK_NOT_FOUND error', () => {
      const error = buildTaskNotFoundError('task-123');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('TASK_NOT_FOUND');
      expect(error.error).toContain('Task not found');
      expect(error.details?.field).toBe('taskId');
      expect(error.details?.value).toBe('task-123');
      expect(error.details?.field).toBeDefined();
      expect(error.details?.value).toBeDefined();
    });

    it('should include proper HTTP status code', () => {
      const error = buildTaskNotFoundError('task-123');
      // The error builder should not include HTTP status; that's set by the route handler
      expect(error.errorCode).toBe('TASK_NOT_FOUND');
    });
  });

  describe('Project Not Found Error', () => {
    it('should build PROJECT_NOT_FOUND error', () => {
      const error = buildProjectNotFoundError('project-456');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('PROJECT_NOT_FOUND');
      expect(error.error).toContain('Project not found');
      expect(error.details?.field).toBe('projectId');
      expect(error.details?.value).toBe('project-456');
      expect(error.details?.field).toBeDefined();
      expect(error.details?.value).toBeDefined();
    });
  });

  describe('Invalid Category Error', () => {
    it('should build INVALID_CATEGORY error', () => {
      const error = buildInvalidCategoryError('invalid_cat');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('INVALID_CATEGORY');
      expect(error.error).toContain('Invalid category');
      expect(error.details?.value).toBe('invalid_cat');
      expect(error.details?.value).toBeDefined();
    });

    it('should list valid categories in guidance', () => {
      const error = buildInvalidCategoryError('invalid_cat');

      expect(error.details?.guidance).toBeDefined();
      expect(error.details?.guidance).toContain('game_mechanic');
      expect(error.details?.guidance).toContain('economy');
      expect(error.details?.guidance).toContain('growth');
    });
  });

  describe('Missing Required Field Error', () => {
    it('should build MISSING_REQUIRED_FIELD error', () => {
      const error = buildMissingRequiredFieldError('title');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('MISSING_REQUIRED_FIELD');
      expect(error.error).toContain('required');
      expect(error.error).toMatch(/title/i); // Case-insensitive match
      expect(error.details?.field).toBe('title');
      expect(error.details?.field).toBeDefined();
    });
  });

  describe('Invalid Status Error', () => {
    it('should build INVALID_STATUS error', () => {
      const error = buildInvalidStatusError('invalid_status');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('INVALID_STATUS');
      expect(error.error).toContain('Invalid status');
      expect(error.details?.value).toBe('invalid_status');
      expect(error.details?.value).toBeDefined();
    });

    it('should list valid statuses in guidance', () => {
      const error = buildInvalidStatusError('invalid_status');

      expect(error.details?.guidance).toBeDefined();
      expect(error.details?.guidance).toContain('featurelist');
      expect(error.details?.guidance).toContain('design');
      expect(error.details?.guidance).toContain('prd');
      expect(error.details?.guidance).toContain('prototype');
    });
  });

  describe('Prerequisite Missing Error', () => {
    it('should build PREREQUISITE_MISSING error for design document', () => {
      const error = buildPrerequisiteMissingError('designDocument', 'prd');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('PREREQUISITE_MISSING');
      expect(error.error).toContain('Design Document');
      expect(error.error).toContain('required');
      expect(error.details?.field).toBe('designDocument');
      expect(error.details?.action).toBe('complete_design');
      expect(error.details?.guidance).toBeDefined();
    });

    it('should build PREREQUISITE_MISSING error for PRD', () => {
      const error = buildPrerequisiteMissingError('prd', 'prototype');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('PREREQUISITE_MISSING');
      expect(error.error).toContain('PRD');
      expect(error.error).toContain('required');
      expect(error.details?.field).toBe('prd');
      expect(error.details?.action).toBe('generate_prd');
      expect(error.details?.guidance).toBeDefined();
    });
  });

  describe('LLM Config Missing Error', () => {
    it('should build LLM_CONFIG_MISSING error', () => {
      const error = buildLLMConfigMissingError();

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('LLM_CONFIG_MISSING');
      expect(error.error).toContain('LLM provider');
      expect(error.error).toContain('configuration');
      expect(error.details?.action).toBe('configure_llm');
      expect(error.details?.guidance).toBeDefined();
    });
  });

  describe('LLM Generation Failed Error', () => {
    it('should build LLM_GENERATION_FAILED error', () => {
      const error = buildLLMGenerationFailedError('Network error');

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('LLM_GENERATION_FAILED');
      expect(error.error).toContain('LLM generation failed');
      expect(error.error).toContain('Network error');
    });

    it('should include provider and model if provided', () => {
      const error = buildLLMGenerationFailedError('API error', 'claude', 'claude-3.5-sonnet');

      expect(error.details?.provider).toBe('claude');
      expect(error.details?.model).toBe('claude-3.5-sonnet');
    });
  });

  describe('AI Generation Timeout Error', () => {
    it('should build AI_GENERATION_TIMEOUT error', () => {
      const error = buildAIGenerationTimeoutError();

      expect(error.success).toBe(false);
      expect(error.errorCode).toBe('AI_GENERATION_TIMEOUT');
      expect(error.error).toContain('timed out');
      expect(error.details?.guidance).toBeDefined();
    });
  });
});
