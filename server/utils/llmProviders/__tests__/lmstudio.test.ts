/**
 * Unit Tests for LMStudioProvider
 * Testing refactored implementation without testConnection() override
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LMStudioProvider } from '../lmstudio';
import type { LLMModelConfig } from '../../../../src/types/llm';

describe('LMStudioProvider - Refactored Implementation', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock fetch globally
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('requiresAuth configuration', () => {
    it('should have requiresAuth set to false', () => {
      const provider = new LMStudioProvider({});
      expect(provider.requiresAuth).toBe(false);
    });

    it('should not include Authorization header in requests', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      // Mock successful chat completion response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'test-model',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'Test response' },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        }),
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

  describe('getAvailableModels() - direct /models endpoint call', () => {
    it('should call /models endpoint directly', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      const mockModels = [
        { id: 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF', object: 'model' },
        { id: 'lmstudio-community/Mistral-7B-Instruct-v0.3-GGUF', object: 'model' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockModels }),
      });

      const models = await provider.getAvailableModels();

      expect(models).toEqual([
        'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF',
        'lmstudio-community/Mistral-7B-Instruct-v0.3-GGUF',
      ]);

      // Verify /models endpoint was called directly
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:1234/v1/models',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return empty array on non-OK response', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const models = await provider.getAvailableModels();

      expect(models).toEqual([]);
    });

    it('should return empty array on fetch error', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const models = await provider.getAvailableModels();

      expect(models).toEqual([]);
    });

    it('should return empty array on timeout', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      // Mock timeout by calling the abort callback
      const abortController = new AbortController();
      fetchMock.mockImplementationOnce(() => {
        setTimeout(() => abortController.abort(), 100);
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 150);
        });
      });

      const models = await provider.getAvailableModels();

      expect(models).toEqual([]);
    });

    it('should handle empty models list', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const models = await provider.getAvailableModels();

      expect(models).toEqual([]);
    });

    it('should handle missing data field', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const models = await provider.getAvailableModels();

      expect(models).toEqual([]);
    });
  });

  describe('testConnection() - should use base class implementation', () => {
    it('should not have testConnection override', () => {
      const provider = new LMStudioProvider({});

      // Verify that testConnection is inherited from base class
      expect(LMStudioProvider.prototype.hasOwnProperty('testConnection')).toBe(false);
    });

    it('should use base class testConnection with projectId', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      const mockModels = [
        { id: 'test-model-1', object: 'model' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockModels }),
      });

      // Call testConnection with projectId (SPEC-LLM-002)
      // Base class testConnection accepts optional projectId parameter
      const result = await provider.testConnection('test-project-id');

      expect(result.success).toBe(true);
      expect(result.models).toEqual(['test-model-1']);
    });

    it('should handle empty models array from getAvailableModels', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      // Mock empty models array (LMStudio server running but no models loaded)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      // testConnection should return success with empty models array
      const result = await provider.testConnection('test-project-id');

      expect(result.success).toBe(true);
      expect(result.models).toEqual([]);
      expect(result.status).toBe('connected');
    });
  });

  describe('generate() - using base class makeRequest', () => {
    it('should use base class makeRequest method', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'test-model',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'Test response' },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        }),
      });

      const result = await provider.generate('test prompt', {
        modelId: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test response');
      expect(result.tokens).toEqual({
        input: 10,
        output: 5,
      });
    });

    it('should handle API errors gracefully', async () => {
      const provider = new LMStudioProvider({
        endpoint: 'http://localhost:1234/v1',
      });

      fetchMock.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await provider.generate('test prompt', {
        modelId: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('Code structure - removed methods', () => {
    it('should not have makeLocalRequest method', () => {
      const provider = new LMStudioProvider({});

      // Verify makeLocalRequest does not exist
      expect(provider.makeLocalRequest).toBeUndefined();
    });
  });
});
