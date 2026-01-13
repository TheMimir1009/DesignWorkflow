/**
 * Test Suite for llmLogger (SPEC-DEBUG-001 TAG-002)
 *
 * Tests the LLM API logging utility with request/response/error tracking
 * Following RED-GREEN-REFACTOR TDD cycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMLogger } from '../llmLogger';
import { useDebugStore } from '../../store/debugStore';

// Mock the debug store
vi.mock('../../store/debugStore', () => ({
  useDebugStore: vi.fn(),
}));

describe('LLMLogger - TAG-002', () => {
  let mockStore: any;
  let logger: LLMLogger;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock store
    mockStore = {
      addLog: vi.fn(),
      updateLog: vi.fn(),
    };

    // Mock the store to return our mock store when getState is called
    vi.mocked(useDebugStore).mockReturnValue({
      ...mockStore,
    } as any);

    // Mock getState to return the mock store
    vi.mocked(useDebugStore).getState = vi.fn().mockReturnValue(mockStore);

    logger = new LLMLogger();
  });

  describe('TASK-003: Request Logging', () => {
    it('should log request and return log ID', () => {
      const config = {
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': 'sk-ant-api123-secret-key',
          'anthropic-version': '2023-06-01',
        },
        body: {
          model: 'claude-opus-4-5',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 4096,
        },
      };

      const logId = logger.logRequest(config);

      expect(logId).toBeDefined();
      expect(typeof logId).toBe('string');
      expect(mockStore.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          id: logId,
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          status: 'pending',
          requestHeaders: expect.objectContaining({
            'x-api-key': expect.stringContaining('****'),
          }),
        })
      );
    });

    it('should generate unique log IDs', () => {
      const config = {
        model: 'gpt-4o',
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {},
        body: {},
      };

      const id1 = logger.logRequest(config);
      const id2 = logger.logRequest(config);

      expect(id1).not.toBe(id2);
    });

    it('should store request body', () => {
      const config = {
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {},
        body: { test: 'data' },
      };

      const logId = logger.logRequest(config);

      expect(mockStore.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: { test: 'data' },
        })
      );
    });
  });

  describe('TASK-003: Response Logging', () => {
    it('should update log with success response', () => {
      const logId = 'log-123';

      const response = {
        status: 200,
        headers: {
          'request-id': 'req_abc123',
          'content-type': 'application/json',
        },
        body: {
          id: 'msg_xyz',
          type: 'message',
          content: [{ type: 'text', text: 'Response' }],
        },
        duration: 1240,
      };

      logger.logResponse(logId, response);

      expect(mockStore.updateLog).toHaveBeenCalledWith(
        logId,
        expect.objectContaining({
          status: 'success',
          statusCode: 200,
          duration: 1240,
          responseHeaders: expect.objectContaining({
            'request-id': 'req_abc123',
          }),
          responseBody: expect.any(Object),
        })
      );
    });

    it('should extract and log token usage', () => {
      const logId = 'log-123';

      const response = {
        status: 200,
        headers: {},
        body: {
          id: 'msg_xyz',
          type: 'message',
          usage: {
            input_tokens: 845,
            output_tokens: 400,
          },
        },
        duration: 1000,
      };

      logger.logResponse(logId, response);

      expect(mockStore.updateLog).toHaveBeenCalledWith(
        logId,
        expect.objectContaining({
          inputTokens: 845,
          outputTokens: 400,
          totalTokens: 1245,
        })
      );
    });

    it('should handle OpenAI usage format', () => {
      const logId = 'log-123';

      const response = {
        status: 200,
        headers: {},
        body: {
          id: 'chatcmpl-123',
          usage: {
            prompt_tokens: 500,
            completion_tokens: 300,
            total_tokens: 800,
          },
        },
        duration: 800,
      };

      logger.logResponse(logId, response);

      expect(mockStore.updateLog).toHaveBeenCalledWith(
        logId,
        expect.objectContaining({
          inputTokens: 500,
          outputTokens: 300,
          totalTokens: 800,
        })
      );
    });
  });

  describe('TASK-003: Error Logging', () => {
    it('should update log with error information', () => {
      const logId = 'log-123';

      const error = new Error('Rate limit exceeded');

      logger.logError(logId, error);

      expect(mockStore.updateLog).toHaveBeenCalledWith(
        logId,
        expect.objectContaining({
          status: 'error',
          error: 'Rate limit exceeded',
        })
      );
    });

    it('should handle error objects without message', () => {
      const logId = 'log-123';

      const error = { name: 'NetworkError' } as unknown as Error;

      logger.logError(logId, error);

      expect(mockStore.updateLog).toHaveBeenCalledWith(
        logId,
        expect.objectContaining({
          status: 'error',
          error: expect.any(String),
        })
      );
    });
  });

  describe('TASK-004: API Key Sanitization', () => {
    it('should mask x-api-key header', () => {
      const config = {
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': 'sk-ant-api123-secret-key',
        },
        body: {},
      };

      logger.logRequest(config);

      const callArgs = mockStore.addLog.mock.calls[0][0];
      expect(callArgs.requestHeaders['x-api-key']).not.toBe('sk-ant-api123-secret-key');
      expect(callArgs.requestHeaders['x-api-key']).toContain('...');
    });

    it('should mask authorization header', () => {
      const config = {
        model: 'gpt-4o',
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'authorization': 'Bearer sk-1234567890',
        },
        body: {},
      };

      logger.logRequest(config);

      const callArgs = mockStore.addLog.mock.calls[0][0];
      expect(callArgs.requestHeaders['authorization']).not.toBe('Bearer sk-1234567890');
      expect(callArgs.requestHeaders['authorization']).toContain('...');
    });

    it('should keep non-sensitive headers intact', () => {
      const config = {
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: {},
      };

      logger.logRequest(config);

      expect(mockStore.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          requestHeaders: expect.objectContaining({
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
          }),
        })
      );
    });

    it('should handle case-insensitive header names', () => {
      const config = {
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'X-API-KEY': 'sk-ant-api123',
          'Authorization': 'Bearer token12345',
        },
        body: {},
      };

      logger.logRequest(config);

      const sanitizedHeaders = mockStore.addLog.mock.calls[0][0].requestHeaders;

      expect(sanitizedHeaders['X-API-KEY']).toContain('****');
      expect(sanitizedHeaders['Authorization']).toContain('****');
      expect(sanitizedHeaders['X-API-KEY']).toContain('...');
      expect(sanitizedHeaders['Authorization']).toContain('...');
    });
  });
});
