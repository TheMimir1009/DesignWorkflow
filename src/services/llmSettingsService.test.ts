/**
 * LLM Settings Service Tests
 * Test coverage for timeout handling and error management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProviderConnection, handleResponse } from './llmSettingsService';
import type { ConnectionTestResult } from '../types/llm';

// Mock fetch
global.fetch = vi.fn();

describe('LLM Settings Service - Timeout Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should timeout after configured duration', async () => {
    const projectId = 'test-project';
    const provider = 'openai' as const;

    // Mock fetch with error that includes "timeout" to simulate timeout
    const timeoutError = new Error('Request timeout after 100ms');
    vi.mocked(global.fetch).mockRejectedValue(timeoutError);

    // Should timeout and return error result (not throw)
    const result = await testProviderConnection(projectId, provider, 100);

    expect(result.success).toBe(false);
    expect(result.status).toBe('error');
    if (typeof result.error !== 'string' && result.error) {
      expect(result.error.code).toBe('TIMEOUT');
      expect(result.error.retryable).toBe(true);
    }
  });

  it('should handle timeout error gracefully', async () => {
    const projectId = 'test-project';
    const provider = 'openai' as const;

    // Mock fetch with AbortError
    vi.mocked(global.fetch).mockRejectedValue(
      new DOMException('Aborted', 'AbortError')
    );

    const result = await testProviderConnection(projectId, provider);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should complete successfully before timeout', async () => {
    const projectId = 'test-project';
    const provider = 'openai' as const;
    const mockResult: ConnectionTestResult = {
      success: true,
      status: 'connected',
      latency: 100,
      timestamp: new Date().toISOString(),
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockResult,
      }),
    } as Response);

    const result = await testProviderConnection(projectId, provider);

    expect(result.success).toBe(true);
    expect(result.status).toBe('connected');
  });
});

describe('handleResponse', () => {
  it('should throw error for non-OK responses', async () => {
    const response = {
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Internal Server Error' }),
    } as unknown as Response;

    await expect(handleResponse(response)).rejects.toThrow(
      'HTTP error! status: 500'
    );
  });

  it('should throw error for API error responses', async () => {
    const response = {
      ok: true,
      json: async () => ({ success: false, error: 'Invalid API key' }),
    } as unknown as Response;

    await expect(handleResponse(response)).rejects.toThrow('Invalid API key');
  });

  it('should return data for successful responses', async () => {
    const mockData = { test: 'data' };
    const response = {
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    } as unknown as Response;

    const result = await handleResponse(response);

    expect(result).toEqual(mockData);
  });
});
