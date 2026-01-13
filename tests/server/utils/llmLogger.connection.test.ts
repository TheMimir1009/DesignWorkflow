/**
 * Tests for LLMLogger Connection Test Logging (SPEC-LLM-002)
 * Following TDD RED-GREEN-REFACTOR cycle
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LLMLogger, type LLMLogEntry } from '../../../server/utils/llmLogger';
import type { LLMProvider } from '../../../src/types/llm';

describe('LLMLogger - Connection Test Logging (SPEC-LLM-002)', () => {
  let logger: LLMLogger;

  beforeEach(() => {
    logger = new LLMLogger();
  });

  describe('logConnectionTestStart', () => {
    it('should log connection test start with required fields', () => {
      const params = {
        id: 'test-openai-1234567890',
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId: 'project-001',
        provider: 'openai' as LLMProvider,
        startedAt: '2026-01-12T10:00:00.000Z',
      };

      logger.logConnectionTestStart(params);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        id: 'test-openai-1234567890',
        provider: 'openai',
        model: 'connection-test',
        timestamp: '2026-01-12T10:00:00.000Z',
      });
    });

    it('should store connection test parameters in request.parameters', () => {
      const params = {
        id: 'test-gemini-123',
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId: 'project-002',
        provider: 'gemini' as LLMProvider,
        startedAt: '2026-01-12T10:00:00.000Z',
      };

      logger.logConnectionTestStart(params);

      const logs = logger.getLogs();
      expect(logs[0].request?.parameters).toEqual({
        type: 'connection-test',
        phase: 'start',
        projectId: 'project-002',
        startedAt: '2026-01-12T10:00:00.000Z',
      });
    });

    it('should store prompt with project information', () => {
      const params = {
        id: 'test-claude-code-123',
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId: 'project-003',
        provider: 'claude-code' as LLMProvider,
        startedAt: '2026-01-12T10:00:00.000Z',
      };

      logger.logConnectionTestStart(params);

      const logs = logger.getLogs();
      expect(logs[0].request?.prompt).toBe('Connection test started for project: project-003');
    });
  });

  describe('logConnectionTestSuccess', () => {
    it('should log connection test success with models and latency', () => {
      const params = {
        id: 'test-openai-1234567890',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-001',
        provider: 'openai' as LLMProvider,
        completedAt: '2026-01-12T10:00:01.000Z',
        latency: 1234,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
      };

      logger.logConnectionTestSuccess(params);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].response?.content).toBe('Connection test successful. Found 3 models.');
      expect(logs[0].metrics?.duration_ms).toBe(1234);
    });

    it('should store model count in usage.total_tokens', () => {
      const params = {
        id: 'test-gemini-123',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-002',
        provider: 'gemini' as LLMProvider,
        completedAt: '2026-01-12T10:00:01.000Z',
        latency: 567,
        models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
      };

      logger.logConnectionTestSuccess(params);

      const logs = logger.getLogs();
      expect(logs[0].response?.usage).toEqual({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 2,
      });
    });

    it('should store connection test parameters in request.parameters', () => {
      const params = {
        id: 'test-lmstudio-123',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-004',
        provider: 'lmstudio' as LLMProvider,
        completedAt: '2026-01-12T10:00:01.000Z',
        latency: 100,
        models: ['local-model-1', 'local-model-2'],
      };

      logger.logConnectionTestSuccess(params);

      const logs = logger.getLogs();
      expect(logs[0].request?.parameters).toEqual({
        type: 'connection-test',
        phase: 'success',
        projectId: 'project-004',
        completedAt: '2026-01-12T10:00:01.000Z',
        modelCount: 2,
        models: ['local-model-1', 'local-model-2'],
      });
    });
  });

  describe('logConnectionTestFailure', () => {
    it('should log connection test failure with error details', () => {
      const params = {
        id: 'test-openai-1234567890',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-001',
        provider: 'openai' as LLMProvider,
        error: {
          code: 'AUTHENTICATION_FAILED' as const,
          message: 'Invalid API key',
          suggestion: 'Check your API key in settings',
        },
      };

      logger.logConnectionTestFailure(params);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toEqual({
        message: 'Invalid API key',
        code: 'AUTHENTICATION_FAILED',
      });
    });

    it('should store error suggestion in request.parameters', () => {
      const params = {
        id: 'test-gemini-123',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-002',
        provider: 'gemini' as LLMProvider,
        error: {
          code: 'NETWORK_ERROR' as const,
          message: 'Connection timeout',
          suggestion: 'Check your network connection',
        },
      };

      logger.logConnectionTestFailure(params);

      const logs = logger.getLogs();
      expect(logs[0].request?.parameters).toEqual({
        type: 'connection-test',
        phase: 'failure',
        projectId: 'project-002',
        suggestion: 'Check your network connection',
      });
    });

    it('should handle error without suggestion', () => {
      const params = {
        id: 'test-claude-code-123',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-003',
        provider: 'claude-code' as LLMProvider,
        error: {
          code: 'UNKNOWN_ERROR' as const,
          message: 'Unknown error occurred',
        },
      };

      logger.logConnectionTestFailure(params);

      const logs = logger.getLogs();
      expect(logs[0].request?.parameters).toEqual({
        type: 'connection-test',
        phase: 'failure',
        projectId: 'project-003',
      });
    });
  });

  describe('getConnectionTestLogs', () => {
    it('should return only connection test logs', () => {
      // Add regular API logs
      logger.logRequest({
        id: 'req-1',
        provider: 'openai',
        model: 'gpt-4o',
        request: {
          prompt: 'Generate text',
          parameters: { temperature: 0.7 },
        },
      });

      // Add connection test logs
      logger.logConnectionTestStart({
        id: 'test-1',
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId: 'project-001',
        provider: 'openai',
        startedAt: '2026-01-12T10:00:00.000Z',
      });

      logger.logConnectionTestStart({
        id: 'test-2',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-002',
        provider: 'gemini',
        startedAt: '2026-01-12T10:00:01.000Z',
      });

      const connectionTestLogs = logger.getConnectionTestLogs();
      expect(connectionTestLogs).toHaveLength(2);
      expect(connectionTestLogs[0].id).toBe('test-1');
      expect(connectionTestLogs[1].id).toBe('test-2');
    });

    it('should return empty array when no connection test logs exist', () => {
      // Add only regular API logs
      logger.logRequest({
        id: 'req-1',
        provider: 'openai',
        model: 'gpt-4o',
      });

      const connectionTestLogs = logger.getConnectionTestLogs();
      expect(connectionTestLogs).toEqual([]);
    });

    it('should filter logs by connection-test type in parameters', () => {
      logger.logConnectionTestStart({
        id: 'test-start',
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId: 'project-001',
        provider: 'openai',
        startedAt: '2026-01-12T10:00:00.000Z',
      });

      logger.logConnectionTestSuccess({
        id: 'test-success',
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId: 'project-001',
        provider: 'gemini',
        completedAt: '2026-01-12T10:00:01.000Z',
        latency: 500,
        models: ['model-1'],
      });

      logger.logConnectionTestFailure({
        id: 'test-failure',
        timestamp: '2026-01-12T10:00:02.000Z',
        projectId: 'project-002',
        provider: 'lmstudio',
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect',
        },
      });

      const connectionTestLogs = logger.getConnectionTestLogs();
      expect(connectionTestLogs).toHaveLength(3);
    });
  });

  describe('Connection test logging integration', () => {
    it('should track complete connection test lifecycle', () => {
      const testId = 'test-complete-123';
      const projectId = 'project-integration';
      const provider: LLMProvider = 'openai';

      // Start
      logger.logConnectionTestStart({
        id: testId,
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId,
        provider,
        startedAt: '2026-01-12T10:00:00.000Z',
      });

      let logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].request?.parameters?.phase).toBe('start');

      // Success - updates the existing log entry
      logger.logConnectionTestSuccess({
        id: testId,
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId,
        provider,
        completedAt: '2026-01-12T10:00:01.000Z',
        latency: 1000,
        models: ['gpt-4o', 'gpt-4o-mini'],
      });

      logs = logger.getLogs();
      expect(logs).toHaveLength(1); // Updates existing entry
      expect(logs[0].request?.parameters?.phase).toBe('success');
      expect(logs[0].response?.content).toBe('Connection test successful. Found 2 models.');
      expect(logs[0].metrics?.duration_ms).toBe(1000);

      // Verify it's a connection test log
      const connectionTestLogs = logger.getConnectionTestLogs();
      expect(connectionTestLogs).toHaveLength(1);
    });

    it('should handle connection test failure lifecycle', () => {
      const testId = 'test-fail-123';
      const projectId = 'project-fail';
      const provider: LLMProvider = 'gemini';

      // Start
      logger.logConnectionTestStart({
        id: testId,
        timestamp: '2026-01-12T10:00:00.000Z',
        projectId,
        provider,
        startedAt: '2026-01-12T10:00:00.000Z',
      });

      // Failure - updates the existing log entry
      logger.logConnectionTestFailure({
        id: testId,
        timestamp: '2026-01-12T10:00:01.000Z',
        projectId,
        provider,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid API key',
          suggestion: 'Update your API key',
        },
      });

      const connectionTestLogs = logger.getConnectionTestLogs();
      expect(connectionTestLogs).toHaveLength(1);
      expect(connectionTestLogs[0].request?.parameters?.phase).toBe('failure');
      expect(connectionTestLogs[0].error?.code).toBe('AUTHENTICATION_FAILED');
      expect(connectionTestLogs[0].request?.parameters?.suggestion).toBe('Update your API key');
    });
  });
});
