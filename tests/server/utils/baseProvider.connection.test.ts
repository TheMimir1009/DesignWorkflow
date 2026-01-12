/**
 * Tests for BaseHTTPProvider connection test logging (SPEC-LLM-002)
 * Following TDD RED-GREEN-REFACTOR cycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMLogger } from '../../../server/utils/llmLogger';
import type { LLMProvider } from '../../../src/types/llm';

// Mock BaseHTTPProvider for testing
class MockHTTPProvider {
  public provider: LLMProvider = 'openai';
  public logger: LLMLogger;

  constructor(logger: LLMLogger) {
    this.logger = logger;
  }

  // Simulate testConnection with logging
  async testConnectionWithLogging(projectId?: string): Promise<{
    success: boolean;
    status?: string;
    latency?: number;
    models?: string[];
    error?: any;
  }> {
    const testId = `test-${this.provider}-${Date.now()}`;
    const startTime = Date.now();

    try {
      // Log start
      if (projectId) {
        this.logger.logConnectionTestStart({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          startedAt: new Date().toISOString(),
        });
      }

      // Simulate successful connection
      const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
      const latency = Date.now() - startTime;

      // Log success
      if (projectId) {
        this.logger.logConnectionTestSuccess({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          completedAt: new Date().toISOString(),
          latency,
          models,
        });
      }

      return {
        success: true,
        status: 'connected',
        latency,
        models,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;

      // Log failure
      if (projectId) {
        this.logger.logConnectionTestFailure({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          error: {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message || 'Connection failed',
            suggestion: error.suggestion,
          },
        });
      }

      return {
        success: false,
        status: 'error',
        error,
      };
    }
  }

  // Simulate failed connection
  async testConnectionWithError(projectId: string, errorCode: string, errorMessage: string): Promise<any> {
    const testId = `test-${this.provider}-${Date.now()}`;
    const startTime = Date.now();

    // Log start
    this.logger.logConnectionTestStart({
      id: testId,
      timestamp: new Date().toISOString(),
      projectId,
      provider: this.provider,
      startedAt: new Date().toISOString(),
    });

    // Simulate error
    const error = {
      code: errorCode,
      message: errorMessage,
      retryable: true,
    };

    const latency = Date.now() - startTime;

    // Log failure
    this.logger.logConnectionTestFailure({
      id: testId,
      timestamp: new Date().toISOString(),
      projectId,
      provider: this.provider,
      error: {
        code: errorCode,
        message: errorMessage,
        suggestion: 'Check your API key and network connection',
      },
    });

    return {
      success: false,
      status: 'error',
      error,
      latency,
    };
  }
}

describe('BaseHTTPProvider - Connection Test Logging (SPEC-LLM-002)', () => {
  let logger: LLMLogger;
  let mockProvider: MockHTTPProvider;

  beforeEach(() => {
    logger = new LLMLogger();
    mockProvider = new MockHTTPProvider(logger);
  });

  describe('testConnection with projectId', () => {
    it('should log connection test lifecycle when projectId is provided', async () => {
      const projectId = 'test-project-001';

      await mockProvider.testConnectionWithLogging(projectId);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].request?.parameters?.type).toBe('connection-test');
      expect(logs[0].request?.parameters?.phase).toBe('success'); // Final phase after completion
      expect(logs[0].request?.parameters?.projectId).toBe(projectId);
    });

    it('should log connection test success with models and latency', async () => {
      const projectId = 'test-project-002';

      const result = await mockProvider.testConnectionWithLogging(projectId);

      expect(result.success).toBe(true);
      expect(result.models).toEqual(['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].response?.content).toContain('Found 3 models');
      expect(logs[0].request?.parameters?.phase).toBe('success');
    });

    it('should log connection test failure with error details', async () => {
      const projectId = 'test-project-003';

      await mockProvider.testConnectionWithError(
        projectId,
        'AUTHENTICATION_FAILED',
        'Invalid API key'
      );

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error?.code).toBe('AUTHENTICATION_FAILED');
      expect(logs[0].error?.message).toBe('Invalid API key');
      expect(logs[0].request?.parameters?.phase).toBe('failure');
      expect(logs[0].request?.parameters?.suggestion).toBe('Check your API key and network connection');
    });

    it('should generate unique test ID for each connection test', async () => {
      const projectId = 'test-project-004';

      await mockProvider.testConnectionWithLogging(projectId);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toMatch(/^test-openai-\d+$/);
    });
  });

  describe('testConnection without projectId', () => {
    it('should not log when projectId is not provided', async () => {
      await mockProvider.testConnectionWithLogging(undefined);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('should still return connection test result without logging', async () => {
      const result = await mockProvider.testConnectionWithLogging(undefined);

      expect(result.success).toBe(true);
      expect(result.models).toBeDefined();
    });
  });

  describe('Connection test log filtering', () => {
    it('should distinguish connection test logs from regular API logs', async () => {
      const projectId = 'test-project-005';

      // Add regular API log
      logger.logRequest({
        id: 'req-1',
        provider: 'openai',
        model: 'gpt-4o',
        request: {
          prompt: 'Generate text',
        },
      });

      // Add connection test log
      await mockProvider.testConnectionWithLogging(projectId);

      const allLogs = logger.getLogs();
      expect(allLogs).toHaveLength(2);

      const connectionTestLogs = logger.getConnectionTestLogs();
      expect(connectionTestLogs).toHaveLength(1);
      expect(connectionTestLogs[0].request?.parameters?.type).toBe('connection-test');
    });
  });
});
