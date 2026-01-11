/**
 * Tests for LLMLogger - Server-side LLM API call logger
 * Following TDD RED-GREEN-REFACTOR cycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMLogger, type LLMLogEntry } from '../../../server/utils/llmLogger';

describe('LLMLogger', () => {
  let logger: LLMLogger;

  beforeEach(() => {
    logger = new LLMLogger();
  });

  describe('logRequest', () => {
    it('should log a request with required fields', () => {
      const entry: Partial<LLMLogEntry> = {
        id: 'test-id-1',
        provider: 'openai',
        model: 'gpt-4o',
        request: {
          prompt: 'Test prompt',
          parameters: { temperature: 0.7 },
        },
      };

      logger.logRequest(entry);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        id: 'test-id-1',
        provider: 'openai',
        model: 'gpt-4o',
        timestamp: expect.any(String),
      });
    });

    it('should generate timestamp if not provided', () => {
      const entry: Partial<LLMLogEntry> = {
        id: 'test-id-2',
        provider: 'gemini',
        model: 'gemini-1.5-pro',
      };

      logger.logRequest(entry);

      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp).toISOString()).toBe(logs[0].timestamp);
    });

    it('should store request parameters correctly', () => {
      const entry: Partial<LLMLogEntry> = {
        id: 'test-id-3',
        provider: 'openai',
        model: 'gpt-4o',
        request: {
          prompt: 'Hello world',
          parameters: {
            temperature: 0.8,
            maxTokens: 1000,
            topP: 0.9,
          },
        },
      };

      logger.logRequest(entry);

      const logs = logger.getLogs();
      expect(logs[0].request).toEqual({
        prompt: 'Hello world',
        parameters: {
          temperature: 0.8,
          maxTokens: 1000,
          topP: 0.9,
        },
      });
    });
  });

  describe('logResponse', () => {
    it('should update existing log entry with response data', () => {
      const requestId = 'test-id-4';
      logger.logRequest({
        id: requestId,
        provider: 'openai',
        model: 'gpt-4o',
      });

      logger.logResponse({
        id: requestId,
        response: {
          content: 'Generated response',
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
          finish_reason: 'stop',
        },
        metrics: {
          duration_ms: 1500,
          estimated_cost: 0.0006,
        },
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].response).toEqual({
        content: 'Generated response',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        finish_reason: 'stop',
      });
      expect(logs[0].metrics).toEqual({
        duration_ms: 1500,
        estimated_cost: 0.0006,
      });
    });

    it('should create new entry if id does not exist', () => {
      logger.logResponse({
        id: 'test-id-5',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        response: {
          content: 'Response content',
        },
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe('test-id-5');
      expect(logs[0].response?.content).toBe('Response content');
    });

    it('should handle response without usage data', () => {
      logger.logResponse({
        id: 'test-id-6',
        response: {
          content: 'Response without usage',
        },
      });

      const logs = logger.getLogs();
      expect(logs[0].response?.usage).toBeUndefined();
    });
  });

  describe('logError', () => {
    it('should update existing log entry with error data', () => {
      const requestId = 'test-id-7';
      logger.logRequest({
        id: requestId,
        provider: 'openai',
        model: 'gpt-4o',
      });

      logger.logError({
        id: requestId,
        error: {
          message: 'API rate limit exceeded',
          code: 'rate_limit_exceeded',
        },
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toEqual({
        message: 'API rate limit exceeded',
        code: 'rate_limit_exceeded',
      });
    });

    it('should create new entry if id does not exist', () => {
      logger.logError({
        id: 'test-id-8',
        provider: 'lmstudio',
        model: 'local-model',
        error: {
          message: 'Connection refused',
        },
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error?.message).toBe('Connection refused');
    });

    it('should handle error without code', () => {
      logger.logError({
        id: 'test-id-9',
        error: {
          message: 'Unknown error occurred',
        },
      });

      const logs = logger.getLogs();
      expect(logs[0].error?.code).toBeUndefined();
      expect(logs[0].error?.message).toBe('Unknown error occurred');
    });
  });

  describe('getLogs', () => {
    it('should return all logged entries', () => {
      logger.logRequest({ id: 'id-1', provider: 'openai', model: 'gpt-4o' });
      logger.logRequest({ id: 'id-2', provider: 'gemini', model: 'gemini-1.5-pro' });
      logger.logRequest({ id: 'id-3', provider: 'lmstudio', model: 'local' });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
    });

    it('should return empty array initially', () => {
      const logs = logger.getLogs();
      expect(logs).toEqual([]);
    });

    it('should return entries in chronological order', () => {
      logger.logRequest({ id: 'id-1', provider: 'openai', model: 'gpt-4o' });
      logger.logRequest({ id: 'id-2', provider: 'gemini', model: 'gemini-1.5-pro' });
      logger.logRequest({ id: 'id-3', provider: 'lmstudio', model: 'local' });

      const logs = logger.getLogs();
      expect(logs[0].id).toBe('id-1');
      expect(logs[1].id).toBe('id-2');
      expect(logs[2].id).toBe('id-3');
    });
  });

  describe('clearLogs', () => {
    it('should remove all log entries', () => {
      logger.logRequest({ id: 'id-1', provider: 'openai', model: 'gpt-4o' });
      logger.logRequest({ id: 'id-2', provider: 'gemini', model: 'gemini-1.5-pro' });

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toEqual([]);
    });

    it('should handle clearing empty logs', () => {
      expect(() => logger.clearLogs()).not.toThrow();
      expect(logger.getLogs()).toEqual([]);
    });
  });

  describe('Log rotation', () => {
    it('should maintain maximum of 1000 logs (FIFO)', () => {
      // Add more than 1000 logs
      for (let i = 0; i < 1050; i++) {
        logger.logRequest({
          id: `id-${i}`,
          provider: 'openai',
          model: 'gpt-4o',
        });
      }

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1000);
      // First log should be id-50 (oldest 50 removed)
      expect(logs[0].id).toBe('id-50');
      // Last log should be id-1049
      expect(logs[999].id).toBe('id-1049');
    });

    it('should preserve newest logs when limit exceeded', () => {
      const maxLogs = 1000;
      for (let i = 0; i < maxLogs + 100; i++) {
        logger.logRequest({
          id: `id-${i}`,
          provider: 'openai',
          model: 'gpt-4o',
        });
      }

      const logs = logger.getLogs();
      expect(logs).toHaveLength(maxLogs);
      expect(logs[maxLogs - 1].id).toBe(`id-${maxLogs + 99}`);
    });
  });

  describe('Thread safety', () => {
    it('should handle concurrent logging operations', async () => {
      const promises: Promise<void>[] = [];

      // Create 100 concurrent log operations
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise((resolve) => {
            logger.logRequest({
              id: `concurrent-${i}`,
              provider: 'openai',
              model: 'gpt-4o',
            });
            resolve();
          })
        );
      }

      await Promise.all(promises);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(100);
    });
  });

  describe('Data integrity', () => {
    it('should mask API keys in request parameters', () => {
      logger.logRequest({
        id: 'test-mask',
        provider: 'openai',
        model: 'gpt-4o',
        request: {
          parameters: {
            apiKey: 'sk-abc123def456',
          },
        },
      });

      const logs = logger.getLogs();
      const paramApiKey = logs[0].request?.parameters?.apiKey as string | undefined;
      expect(paramApiKey).toBeDefined();
      if (paramApiKey) {
        expect(paramApiKey).not.toBe('sk-abc123def456');
        expect(paramApiKey).toMatch(/^sk-\*\*\*.*$/);
      }
    });

    it('should handle null and undefined values gracefully', () => {
      logger.logRequest({
        id: 'test-null',
        provider: 'openai',
        model: 'gpt-4o',
        request: {
          prompt: undefined as unknown as string,
        },
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
    });
  });
});
