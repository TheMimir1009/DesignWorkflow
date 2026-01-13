/**
 * Unit Tests for BaseHTTPProvider
 * Testing requiresAuth flag and conditional Authorization header
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseHTTPProvider } from '../base';
import type { LLMProvider, LLMModelConfig } from '../../../../src/types/llm';

// Mock implementation of BaseHTTPProvider for testing
class TestHTTPProvider extends BaseHTTPProvider {
  readonly provider: LLMProvider = 'test' as const;

  async generate(prompt: string, config: LLMModelConfig): Promise<any> {
    // Call makeRequest to test Authorization header
    const response = await this.makeRequest(
      'http://localhost:8080/test',
      { prompt, model: config.modelId },
      config
    );
    return { success: true, content: 'test', data: response };
  }

  async getAvailableModels(): Promise<string[]> {
    return ['model1', 'model2'];
  }
}

describe('BaseHTTPProvider - requiresAuth Flag', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock fetch globally
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('requiresAuth default value', () => {
    it('should have requiresAuth default to true', () => {
      const provider = new TestHTTPProvider({});
      expect(provider.requiresAuth).toBe(true);
    });
  });

  describe('requiresAuth configuration', () => {
    it('should allow requiresAuth to be set to false via config', () => {
      const provider = new TestHTTPProvider({ requiresAuth: false });
      expect(provider.requiresAuth).toBe(false);
    });

    it('should allow requiresAuth to be explicitly set to true via config', () => {
      const provider = new TestHTTPProvider({ requiresAuth: true });
      expect(provider.requiresAuth).toBe(true);
    });
  });

  describe('Authorization header with requiresAuth', () => {
    it('should include Authorization header when requiresAuth is true', async () => {
      const provider = new TestHTTPProvider({
        apiKey: 'test-api-key',
        requiresAuth: true,
      });

      // Mock successful response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'test' } }] }),
      });

      await provider.generate('test prompt', {
        modelId: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      // Verify fetch was called with Authorization header
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should not include Authorization header when requiresAuth is false', async () => {
      const provider = new TestHTTPProvider({
        apiKey: 'test-api-key',
        requiresAuth: false,
      });

      // Mock successful response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'test' } }] }),
      });

      await provider.generate('test prompt', {
        modelId: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      // Verify fetch was called without Authorization header
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('ProviderConfig interface', () => {
    it('should accept requiresAuth in ProviderConfig', () => {
      const config = {
        apiKey: 'test-key',
        endpoint: 'http://localhost:8080',
        requiresAuth: false,
      };

      const provider = new TestHTTPProvider(config);

      expect(provider.requiresAuth).toBe(false);
    });
  });
});
