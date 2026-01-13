/**
 * LLM Settings Service Tests
 * TDD test suite for LLM settings API service
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getLLMSettings,
  updateLLMSettings,
  updateProviderSettings,
  updateTaskStageConfig,
  testProviderConnection,
  getProviderModels,
  API_BASE_URL,
} from '../../src/services/llmSettingsService';
import { createDefaultProjectLLMSettings } from '../../src/types/llm';

const TEST_PROJECT_ID = 'test-project-123';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LLM Settings Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getLLMSettings', () => {
    it('should fetch LLM settings for a project', async () => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSettings }),
      });

      const result = await getLLMSettings(TEST_PROJECT_ID);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/llm-settings`
      );
      expect(result.projectId).toBe(TEST_PROJECT_ID);
      expect(result.providers).toHaveLength(4);
    });

    it('should throw error on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getLLMSettings(TEST_PROJECT_ID)).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw error on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Project not found' }),
      });

      await expect(getLLMSettings(TEST_PROJECT_ID)).rejects.toThrow('Project not found');
    });
  });

  describe('updateLLMSettings', () => {
    it('should update LLM settings', async () => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSettings }),
      });

      const result = await updateLLMSettings(TEST_PROJECT_ID, {
        providers: mockSettings.providers,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/llm-settings`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.projectId).toBe(TEST_PROJECT_ID);
    });
  });

  describe('updateProviderSettings', () => {
    it('should update specific provider settings', async () => {
      const mockProvider = {
        provider: 'openai',
        apiKey: 'sk-m...ked',
        isEnabled: true,
        connectionStatus: 'connected',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockProvider }),
      });

      const result = await updateProviderSettings(TEST_PROJECT_ID, 'openai', {
        apiKey: 'sk-new-key',
        isEnabled: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/llm-settings/provider/openai`,
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(result.isEnabled).toBe(true);
    });
  });

  describe('updateTaskStageConfig', () => {
    it('should update task stage configuration', async () => {
      const mockConfig = {
        designDoc: {
          provider: 'openai',
          modelId: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1.0,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockConfig }),
      });

      const result = await updateTaskStageConfig(TEST_PROJECT_ID, {
        designDoc: mockConfig.designDoc,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/llm-settings/task-stage`,
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(result.designDoc?.provider).toBe('openai');
    });
  });

  describe('testProviderConnection', () => {
    it('should test provider connection and return success', async () => {
      const mockResult = {
        success: true,
        latency: 150,
        models: ['gpt-4o', 'gpt-4o-mini'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResult }),
      });

      const result = await testProviderConnection(TEST_PROJECT_ID, 'openai');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/llm-settings/test-connection/openai`,
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.success).toBe(true);
      expect(result.latency).toBe(150);
    });

    it('should return error on connection failure', async () => {
      const mockResult = {
        success: false,
        error: 'Invalid API key',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResult }),
      });

      const result = await testProviderConnection(TEST_PROJECT_ID, 'openai');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });
  });

  describe('getProviderModels', () => {
    it('should fetch available models for a provider', async () => {
      const mockModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { provider: 'openai', models: mockModels },
        }),
      });

      const result = await getProviderModels(TEST_PROJECT_ID, 'openai');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/llm-settings/provider/openai/models`
      );
      expect(result).toEqual(mockModels);
    });
  });
});
